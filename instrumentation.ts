export async function register(){
 if(process.env.NEXT_RUNTIME==='nodejs'&&process.env.ENSO_AUTO_REFRESH!=='0'){
  const {ingest}=await import('./lib/enso/releases.mjs');
  const schedule=()=>{const now=new Date(),next=new Date(now);next.setUTCHours(6,0,0,0);if(next<=now)next.setUTCDate(next.getUTCDate()+1);const timer=setTimeout(async()=>{try{const result=await ingest();if(Object.values(result.checks).some((c:any)=>c.state!=='ok'))console.error('ENSO ingestion: owner review required; inspect checks.json and audit.ndjson.')}catch{console.error('ENSO ingestion: check failed; inspect server runbook.')}finally{schedule()}},next.getTime()-now.getTime());timer.unref()};schedule();
 }
}
