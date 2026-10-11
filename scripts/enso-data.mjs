import fs from 'node:fs/promises';
import path from 'node:path';
import {ingest,manualImport,rollback,publicSnapshot,dataDirectory} from '../lib/enso/releases.mjs';
const [command='update',...args]=process.argv.slice(2);
try{
 if(command==='update'){const result=await ingest();console.log(JSON.stringify(result,null,2));if(Object.values(result.checks).some(c=>c.state!=='ok'))process.exitCode=1;}
 else if(command==='status'){const s=await publicSnapshot();console.log(JSON.stringify({diagnosis:s.manifest,history:s.history?.id,freshness:s.freshness},null,2))}
 else if(command==='import'){console.log(await manualImport(JSON.parse(await fs.readFile(args[0],'utf8')),args[1]||process.env.APPROVAL_IDENTITY))}
 else if(command==='rollback'){console.log(await rollback(args[0],args[1],args[2]||process.env.APPROVAL_IDENTITY))}
 else if(command==='bootstrap'){const source=dataDirectory(),target=path.join(process.cwd(),'data','bootstrap');await fs.mkdir(path.join(target,'releases'),{recursive:true});const s=await publicSnapshot();if(!s.assessment||!s.outlook||!s.history)throw Error('complete_approved_release_required');for(const name of ['latest-diagnosis.json','latest-history.json'])await fs.copyFile(path.join(source,name),path.join(target,name));for(const r of [s.assessment,s.outlook,s.history])await fs.writeFile(path.join(target,'releases',r.id+'.json'),JSON.stringify(r,null,2));console.log('Saved a verified bootstrap snapshot with original issue and check dates.');}
 else throw Error('unknown_command');
}catch(e){console.error('ENSO workflow:',e.message);process.exitCode=1}
