import {randomBytes,createHash,scrypt as scryptCallback,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import {readRecord,insertRecord,writeRecord,removeRecord} from './storage.js';
const scrypt=promisify(scryptCallback);
export const secret=()=>randomBytes(32).toString('hex');
export const digest=v=>createHash('sha256').update(v||'').digest('hex');
export function cookie(request,name){const value=request.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith(name+'='))?.slice(name.length+1);return value||null}
export function sessionCookie(request,value,maxAge=604800){return `tracker_session=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${new URL(request.url).protocol==='https:'?'; Secure':''}`}
export function sameOrigin(request){const origin=request.headers.get('origin');return !origin||origin===new URL(request.url).origin||(process.env.APP_ORIGIN&&origin===process.env.APP_ORIGIN)}
export async function userFor(request){const session=await readRecord('sessions',digest(cookie(request,'tracker_session')));if(!session||session.expires<Date.now())return null;return readRecord('users',session.userId)}
export function publicUser(user){return user?{id:user.id,name:user.name,username:user.username,provider:user.provider,emailVerified:!!user.emailVerified,reviewer:reviewerAllowed(user)}:null}
export function reviewerAllowed(user){return user?.provider==='oidc'&&!!user.emailVerified&&(process.env.SCIENTIFIC_REVIEWER_SUBJECTS||'').split(',').map(s=>s.trim()).includes(user.subject)}
export async function newSession(userId){const token=secret();await writeRecord('sessions',digest(token),{userId,expires:Date.now()+7*86400000});return token}
export async function signOut(request){await removeRecord('sessions',digest(cookie(request,'tracker_session')))}
export async function registerUser({username,name,password}){
 if(typeof username!=='string'||!/^[a-zA-Z0-9_.-]{3,40}$/.test(username)||typeof name!=='string'||!name.trim()||name.length>80||typeof password!=='string'||password.length<12||password.length>128)throw Error('Use a 3–40 character username, a name, and a password of 12–128 characters.');
 const normalized=username.toLowerCase(),salt=secret(),passwordHash=(await scrypt(password,salt,64)).toString('hex');
 const user={id:'local:'+normalized,username:normalized,name:name.trim(),salt,passwordHash,provider:'local',emailVerified:false,createdAt:new Date().toISOString()};
 if(!await insertRecord('users',user.id,user))throw Error('This username is already taken.');return user;
}
export async function loginUser({username,password}){
 if(typeof username!=='string'||typeof password!=='string'||password.length>128)throw Error('Invalid username or password.');
 const user=await readRecord('users','local:'+username.toLowerCase());
 const actual=await scrypt(password,user?.salt||'not-an-account',64),expected=Buffer.from(user?.passwordHash||'00'.repeat(64),'hex');
 if(!user||!timingSafeEqual(actual,expected))throw Error('Invalid username or password.');return user;
}
