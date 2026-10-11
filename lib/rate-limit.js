import {createHash} from 'node:crypto';
import {consumeLimit} from './storage.js';

export async function allow(request,limit=240,scope='default',period=3600000){
 const route=new URL(request.url).pathname;
 // Only trust forwarding headers when the hosting proxy is configured to replace them.
 const client=process.env.TRUST_PROXY==='1'?(request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown'):'local';
 const identity=createHash('sha256').update(client).digest('hex').slice(0,24),window=Math.floor(Date.now()/period);
 return consumeLimit(`${scope}:${route}:${identity}:${window}`,limit,(window+1)*period);
}
export const limited=()=>Response.json({error:'Too many requests. Please wait and try again.'},{status:429,headers:{'Retry-After':'3600','Cache-Control':'no-store'}});
