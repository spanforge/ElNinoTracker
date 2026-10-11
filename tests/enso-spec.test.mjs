import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {parseAssessment,parseOutlook,parseHistory} from '../lib/enso/adapters.mjs';
import {validateRelease} from '../lib/enso/validate.mjs';
import {publicSnapshot,safeFetch,ingest,rollback} from '../lib/enso/releases.mjs';
import {freshness,likelihood,fullSeason,ongoingSeasons} from '../lib/enso/policy.mjs';
import {forecastChange,historyTakeaway,regionalTakeaway,normalizeArea} from '../lib/enso/insights.mjs';
import {impactSnapshot,selectImpactCards} from '../lib/enso/impacts.mjs';
import impactContent from '../data/impact-content.json' with {type:'json'};
const fixture=name=>fs.readFile(new URL('./fixtures/enso/'+name+'.html',import.meta.url),'utf8');
test('India cards provide dated official inputs and practical actions with honest scopes',()=>{
 const cards=impactSnapshot('india','el_nino',Date.parse('2026-10-20')).cards;assert.equal(cards.length,3);assert.ok(cards.every(c=>c.evidence_type==='official_outlook'&&c.action&&c.sources.length));assert.match(cards[0].text,/85%/);assert.match(cards[1].text,/warmer/);assert.match(cards[2].text,/irrigation/);
 for(const c of impactContent.cards){assert.ok((c.text+' '+c.action).split(/\s+/).length<55,c.id+' exceeds word budget');assert.doesNotMatch(c.text,/We do not have/);}
});
test('expired monthly inputs become useful general guidance; seasonal outlooks retain their own validity',()=>{
 const november=impactSnapshot('india','neutral',Date.parse('2026-11-15')).cards;assert.deepEqual(november.map(c=>c.evidence_type),['official_guidance','official_guidance','official_outlook']);
 const january=impactSnapshot('india','unknown',Date.parse('2027-01-05')).cards;assert.ok(january.every(c=>c.evidence_type==='official_guidance'&&c.action));assert.ok(january.every(c=>!c.text.includes('October rainfall')));
 const pending=structuredClone(impactContent.cards);pending.forEach(c=>c.review_state='pending');assert.equal(selectImpactCards(pending,'india','el_nino',Date.parse('2026-10-20')).length,0);
});
test('forecast changes compare the same period and basis, with percentage points and no invented baseline',async()=>{
 const {outlook}=await publicSnapshot(),current=structuredClone(outlook),previous=structuredClone(outlook),row=current.forecasts[0];previous.issued_at='2026-09-10T00:00:00.000Z';previous.forecasts[0].p_el_nino=row.p_el_nino-5;previous.forecasts[0].p_neutral=row.p_neutral+5;
 assert.match(forecastChange(current,previous,row).text,/rose by 5 percentage points/);
 assert.equal(forecastChange(current,null,row),null);assert.equal(forecastChange(current,current,row),null);
 previous.forecasts[0].probability_basis='A different index';assert.equal(forecastChange(current,previous,row),null);
});
test('regional guidance respects seasons and stale status; unknown areas fall back safely',()=>{
 assert.match(regionalTakeaway('india',10,'el_nino','current'),/October–December/);assert.match(regionalTakeaway('india',7,'neutral','current'),/June–September/);assert.match(regionalTakeaway('india',2,'la_nina','current'),/separate season/);
 assert.match(regionalTakeaway('india',10,'el_nino','archive'),/latest status/);assert.equal(normalizeArea('unsupported'),'world');assert.equal(normalizeArea('australia'),'australia');
});
test('history takeaway reports observed movement and revision uncertainty, never a phase diagnosis',async()=>{
 const {history}=await publicSnapshot();assert.match(historyTakeaway(history),/do not decide the official phase/);
 const h=structuredClone(history);h.observations.at(-1).value_c=h.observations.at(-2).value_c;assert.match(historyTakeaway(h),/unchanged/);h.observations.at(-1).value_c-=.2;assert.match(historyTakeaway(h),/0.2 °C lower/);assert.equal(historyTakeaway({observations:[]}),null);
});
test('archived NOAA sources parse authoritative diagnosis, nine seasons and a single observed index',async()=>{
 const a=parseAssessment(await fixture('assessment')),o=parseOutlook(await fixture('outlook'),a.issued_at),h=parseHistory(await fixture('history'));
 assert.ok(['el_nino','la_nina','neutral'].includes(a.phase));assert.equal(o.forecasts.length,9);assert.equal(h.index_name,'RONI');assert.equal(h.dataset_version,'ERSSTv6');assert.ok(h.observations.length>900);assert.equal(h.issued_at,null);assert.match(h.issued_at_basis,/does not state/);
 assert.ok(o.forecasts.some(r=>new Date(r.season_start).getUTCFullYear()!==new Date(r.season_end).getUTCFullYear()));
});
test('live approved snapshots validate; malformed data and unsafe archive paths fail closed',async()=>{
 const s=await publicSnapshot();for(const r of [s.assessment,s.outlook,s.history])assert.equal(validateRelease(r),r);
 const bad=structuredClone(s.outlook);bad.forecasts[0].p_el_nino=NaN;assert.throws(()=>validateRelease(bad),/invalid_probability/);
 const duplicate=structuredClone(s.outlook);duplicate.forecasts[1]=duplicate.forecasts[0];assert.throws(()=>validateRelease(duplicate),/duplicate/);
 assert.throws(()=>validateRelease({...s.assessment,raw_file:'../../private.html'}),/identity/);
 assert.throws(()=>validateRelease({...s.history,index_name:'ONI'}),/migration/);
});
test('rounded probabilities retain original values and ties have no invented winner',()=>{
 assert.match(likelihood({p_el_nino:45,p_neutral:45,p_la_nina:10}),/No single/);
 const row={season_start:'2026-12-01T00:00:00.000Z',season_end:'2027-02-28T23:59:59.999Z'};
 assert.match(fullSeason(row),/December 2026.*February 2027/);assert.equal(ongoingSeasons([row],Date.parse('2027-03-01')).length,0);
});
test('a neutral diagnosis with an El Niño watch remains neutral',()=>{
 const r=parseAssessment('<html><body>ENSO Diagnostic Discussion 8 October 2026 ENSO Alert System Status: El Niño Watch Synopsis: ENSO-neutral conditions are present. The next ENSO Diagnostic Discussion is scheduled for 12 November 2026.</body></html>');
 assert.equal(r.phase,'neutral');assert.equal(r.alert,'watch');assert.equal(r.alert_phase,'el_nino');
});
test('freshness follows issue age, retains failed-check warning and archives old assessments',()=>{
 const r={issued_at:'2026-01-01T00:00:00.000Z',fetched_at:'2026-10-01T00:00:00.000Z'};
 assert.equal(freshness(r,{state:'failed'},Date.parse('2026-02-20')).state,'overdue');assert.equal(freshness(r,{state:'failed'},Date.parse('2026-10-01')).state,'archive');assert.equal(freshness(r,{state:'pending_review'}).check_failed,true);
});
test('source fetch rejects unapproved hosts, redirects and oversized responses',async()=>{
 await assert.rejects(safeFetch('https://example.com/'),/unapproved/);
 await assert.rejects(safeFetch('https://www.cpc.ncep.noaa.gov/',{},async()=>new Response(null,{status:302,headers:{location:'https://example.com/'}})),/unapproved/);
 await assert.rejects(safeFetch('https://www.cpc.ncep.noaa.gov/',{},async()=>new Response('x',{headers:{'content-type':'text/html','content-length':'3000001'}})),/too_large/);
});
test('paired publication is atomic; malformed and failed updates retain the approved release; rollback works',async()=>{
 const priorFetch=globalThis.fetch,priorRoot=process.env.ENSO_DATA_DIR,priorRecovery=process.env.ENSO_RECOVERY_DIR;
 const root=await fs.mkdtemp(new URL('../test-results/ingestion-',import.meta.url));
 process.env.ENSO_DATA_DIR=root;process.env.ENSO_RECOVERY_DIR=root+'/recovery';
 const sources=Object.fromEntries(await Promise.all(['assessment','outlook','history'].map(async name=>[name,await fixture(name)])));
 let mode='valid',revision=1;
 globalThis.fetch=async url=>{const kind=url.includes('ensodisc')?'assessment':url.includes('probabilities')?'outlook':'history';if(mode==='failed'&&kind==='outlook')throw Error('offline');return new Response(mode==='malformed'&&kind==='outlook'?'<html>Changed source layout</html>':sources[kind]+'<!-- revision '+revision+' -->',{headers:{'content-type':'text/html'}})};
 try{
  assert.equal((await ingest()).diagnosis,'published');const first=await publicSnapshot();assert.equal(first.assessment.bundle_id,first.outlook.bundle_id);
  mode='malformed';await ingest();const retained=await publicSnapshot();assert.equal(retained.assessment.id,first.assessment.id);assert.equal(retained.freshness.assessment.check_failed,true);
  mode='failed';await ingest();assert.equal((await publicSnapshot()).assessment.id,first.assessment.id);
  mode='valid';revision=2;await ingest();assert.notEqual((await publicSnapshot()).assessment.id,first.assessment.id);
  await rollback('diagnosis',first.manifest.bundle_id,'test reviewer');assert.equal((await publicSnapshot()).assessment.id,first.assessment.id);
 }finally{globalThis.fetch=priorFetch;if(priorRoot===undefined)delete process.env.ENSO_DATA_DIR;else process.env.ENSO_DATA_DIR=priorRoot;if(priorRecovery===undefined)delete process.env.ENSO_RECOVERY_DIR;else process.env.ENSO_RECOVERY_DIR=priorRecovery;}
});
