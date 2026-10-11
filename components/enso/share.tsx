'use client';
import {useState,useRef} from 'react';
export default function ShareView(){
 const [message,setMessage]=useState(''),[fallback,setFallback]=useState(''),input=useRef<HTMLInputElement>(null);
 async function share(){const source=new URL(location.href),url=new URL('/',source.origin);for(const key of ['region','area','season']){const value=source.searchParams.get(key);if(value)url.searchParams.set(key,value)}try{if(!navigator.clipboard?.writeText)throw Error();await navigator.clipboard.writeText(url.href);setFallback('');setMessage('Link copied. It includes your region and selected forecast period.')}catch{setFallback(url.href);setMessage('Copy the link below to share this view.');setTimeout(()=>input.current?.select(),0)}}
 return <div className="share-view"><button onClick={share}>Share this view <span aria-hidden="true">↗</span></button><p role="status" aria-live="polite">{message}</p>{fallback&&<label>Link to this view<input ref={input} readOnly value={fallback} onFocus={e=>e.target.select()}/></label>}<small>The link shows the latest approved information when opened.</small></div>;
}
