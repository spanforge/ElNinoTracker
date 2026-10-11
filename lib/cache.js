import fs from 'node:fs/promises';
import path from 'node:path';
const directory=path.join(process.cwd(),'.data-cache');
const pending=new Map();
const memory=new Map();
export async function readCache(key){if(memory.has(key))return memory.get(key);try {const data=JSON.parse(await fs.readFile(path.join(directory,`${key}.json`),'utf8'));memory.set(key,data);return data}catch{return null}}
export async function cached(key,ttl,loader){
 const previous=await readCache(key);
 if(previous&&Date.now()-new Date(previous.fetchedAt).getTime()<ttl)return {...previous,status:'cached'};
 if(pending.has(key))return pending.get(key);
 const task=(async()=>{try{const data=await loader();const result={data,fetchedAt:new Date().toISOString(),status:'fresh'};await fs.mkdir(directory,{recursive:true});const filename=path.join(directory,`${key}.json`),temporary=filename+'.tmp';await fs.writeFile(temporary,JSON.stringify(result));await fs.rename(temporary,filename);memory.set(key,result);if(['enso','roni','outlook','food'].includes(key)){const archive=path.join(directory,'revisions',key);await fs.mkdir(archive,{recursive:true});await fs.writeFile(path.join(archive,`${result.fetchedAt.replaceAll(':','-')}.json`),JSON.stringify(result));const files=(await fs.readdir(archive)).sort();for(const old of files.slice(0,-36))await fs.unlink(path.join(archive,old));}return result}catch(error){return previous?{...previous,status:'stale',error:'Upstream refresh failed; showing the last successful retrieval.'}:{data:null,status:'unavailable',fetchedAt:null,error:error.message?.includes('429')?'Provider rate limit reached. Try later.':'Source unavailable. No substitute data displayed.'}}finally{pending.delete(key)}})();
 pending.set(key,task);return task;
}
export async function request(url,type='json',timeout=18000){const response=await fetch(url,{signal:AbortSignal.timeout(timeout),headers:{'User-Agent':'ElNinoTracker/2.0 (non-commercial climate education)'},cache:'no-store'});if(!response.ok)throw Error(`Source HTTP ${response.status}`);return type==='text'?response.text():response.json()}
