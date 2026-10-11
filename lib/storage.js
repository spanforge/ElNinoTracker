import fs from 'node:fs';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';

let connection, initializing;
export const storageMode=()=>process.env.DATABASE_URL?'postgres':'sqlite';
export const storagePath=()=>process.env.APP_DATABASE_PATH||path.join(process.cwd(),'.team-data','tracker.sqlite');
async function database(){
 if(initializing)return initializing;
 initializing=(async()=>{
  if(process.env.DATABASE_URL){const {default:postgres}=await import('postgres');connection=postgres(process.env.DATABASE_URL,{max:5,idle_timeout:20,connect_timeout:10});}
  else {const filename=storagePath();fs.mkdirSync(path.dirname(filename),{recursive:true});connection=new DatabaseSync(filename);connection.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON;');}
  await raw('CREATE TABLE IF NOT EXISTS records (collection TEXT NOT NULL, key TEXT NOT NULL, payload TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1, PRIMARY KEY(collection,key))');
  await raw('CREATE TABLE IF NOT EXISTS rate_buckets (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires BIGINT NOT NULL)');
  return connection;
 })().catch(e=>{initializing=null;throw e});return initializing;
}
async function raw(statement,args=[]){
 if(storageMode()==='postgres')return connection.unsafe(statement,args);
 const sql=statement.replace(/\$\d+/g,'?'), prepared=connection.prepare(sql);
 return /^(SELECT|.*RETURNING)/is.test(statement)?prepared.all(...args):prepared.run(...args);
}
export async function query(statement,args=[]){await database();return raw(statement,args)}
export async function readRecord(collection,key){const rows=await query('SELECT payload FROM records WHERE collection=$1 AND key=$2',[collection,key]);return rows[0]?JSON.parse(rows[0].payload):null}
export async function insertRecord(collection,key,value){const rows=await query('INSERT INTO records(collection,key,payload,revision) VALUES($1,$2,$3,$4) ON CONFLICT(collection,key) DO NOTHING RETURNING key',[collection,key,JSON.stringify(value),Number.isInteger(value.revision)?value.revision:1]);return rows.length>0}
export async function writeRecord(collection,key,value){await query('INSERT INTO records(collection,key,payload,revision) VALUES($1,$2,$3,1) ON CONFLICT(collection,key) DO UPDATE SET payload=excluded.payload,revision=records.revision+1',[collection,key,JSON.stringify(value)])}
export async function compareRecord(collection,key,value,revision){const rows=await query('UPDATE records SET payload=$1,revision=revision+1 WHERE collection=$2 AND key=$3 AND revision=$4 RETURNING key',[JSON.stringify(value),collection,key,revision]);return rows.length>0}
export async function removeRecord(collection,key){await query('DELETE FROM records WHERE collection=$1 AND key=$2',[collection,key])}
export async function listRecords(collection){const rows=await query('SELECT payload FROM records WHERE collection=$1',[collection]);return rows.map(r=>JSON.parse(r.payload))}
export async function consumeLimit(key,limit,expires){const rows=await query('INSERT INTO rate_buckets(key,count,expires) VALUES($1,1,$2) ON CONFLICT(key) DO UPDATE SET count=rate_buckets.count+1 RETURNING count',[key,expires]);if(Math.random()<.01)await query('DELETE FROM rate_buckets WHERE expires<$1',[Date.now()]);return rows[0].count<=limit}
export async function checkStorage(){await query('SELECT 1 AS ok');return {ok:true,mode:storageMode()}}
