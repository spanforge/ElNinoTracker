import assert from 'node:assert/strict';
const base=process.env.TEST_URL||'http://localhost:3000';
async function get(path){const r=await fetch(base+path,{signal:AbortSignal.timeout(100000)});assert.equal(r.status,200,path);return r.json()}
const global=await get('/api/global');assert.ok(global.roni.data.length>800);assert.ok(global.outlook.data.length>=6);assert.ok(global.food.data.length>400);assert.ok(global.ocean.data.length>400);assert.equal(new Set(global.soi.data.map(r=>r.date)).size,global.soi.data.length);
const countries=await get('/api/countries');assert.ok(countries.data.length>200);
const seasonalMap=await get('/api/seasonal-map');assert.ok(seasonalMap.data.points.length>200);assert.ok(seasonalMap.data.points.every(p=>p.months.length===6&&p.temperature.length===6&&p.rainfall.length===6));
const india=await get('/api/country?iso=IND');for(const source of ['economy','weather','air','flood','seasonal','recent'])assert.ok(india[source].data,`${source}: ${india[source].status}`);assert.equal(india.weather.data.daily.time.length,14);assert.equal(india.seasonal.data.monthly.time.length,6);assert.ok(india.point.scope.includes('not a country average'));
const history=await get('/api/country?iso=IND&mode=history&event=2023%E2%80%9324');assert.equal(history.data.monthly.length,12);assert.ok(history.data.monthly.some(r=>r.temperatureAnomaly!==null));
const geo=await get('/api/geocode?q=Chennai');assert.ok(geo.data.results.length>0);
const fires=await get('/api/fires');assert.ok(fires.data.total>=fires.data.detections.length);assert.ok(fires.data.detections.length<=8000);
const power=await get('/api/country?iso=IND&mode=climatology');assert.ok(power.data?.parameters?.T2M);
const chirps=await get('/api/country?iso=IND&mode=chirps');assert.equal(chirps.data.rows.length,12);
for(const bad of ['/api/country?iso=INVALID','/api/country?iso=IND&lat=999&lng=0','/api/country?iso=IND&mode=history&event=bad','/api/geocode?q=x'])assert.equal((await fetch(base+bad)).status,400);

const auth=await fetch(base+'/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'register',username:'qa-'+Date.now(),name:'QA owner',password:'test-long-account-password'})});assert.equal(auth.status,201);const session=auth.headers.get('set-cookie').split(';')[0];
const headers={'Content-Type':'application/json',Cookie:session};
const workspaceBody={action:'create',name:'API verification',assets:[],notes:[]};assert.equal((await fetch(base+'/api/workspaces',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(workspaceBody)})).status,401);
const create=await fetch(base+'/api/workspaces',{method:'POST',headers,body:JSON.stringify(workspaceBody)});assert.equal(create.status,201);const workspace=await create.json();assert.equal(workspace.role,'owner');assert.equal((await fetch(base+'/api/workspaces?id='+workspace.id)).status,401);
const payload={id:workspace.id,revision:1,assets:[],notes:[{author:'QA',text:'Test annotation',date:new Date().toISOString(),id:'test'}]};
const saves=await Promise.all([fetch(base+'/api/workspaces',{method:'PUT',headers,body:JSON.stringify(payload)}),fetch(base+'/api/workspaces',{method:'PUT',headers,body:JSON.stringify(payload)})]);assert.deepEqual(saves.map(r=>r.status).sort(),[200,409]);
const loaded=await fetch(base+'/api/workspaces?id='+workspace.id,{headers});assert.equal((await loaded.json()).notes.length,1);
const invite=await fetch(base+'/api/workspaces',{method:'POST',headers,body:JSON.stringify({action:'invite',id:workspace.id,role:'viewer'})});assert.equal(invite.status,200);const invitation=(await invite.json()).invitationCode;
const viewerAuth=await fetch(base+'/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'register',username:'viewer-'+Date.now(),name:'QA viewer',password:'test-long-viewer-password'})});assert.equal(viewerAuth.status,201);const viewerHeaders={'Content-Type':'application/json',Cookie:viewerAuth.headers.get('set-cookie').split(';')[0]};
const joinBody=JSON.stringify({action:'join',id:workspace.id,code:invitation});const join=await fetch(base+'/api/workspaces',{method:'POST',headers:viewerHeaders,body:joinBody});assert.equal(join.status,200);assert.equal((await join.json()).role,'viewer');assert.equal((await fetch(base+'/api/workspaces',{method:'PUT',headers:viewerHeaders,body:JSON.stringify({...payload,revision:4})})).status,403);assert.equal((await fetch(base+'/api/workspaces',{method:'POST',headers:viewerHeaders,body:joinBody})).status,403);
assert.equal((await fetch(base+'/api/reviews',{method:'POST',headers,body:JSON.stringify({iso:'IND',note:'Unapproved scientific review attempt'})})).status,403);
assert.equal((await fetch(base+'/embed?country=IND')).status,200);
console.log('PASS: live public sources, historical baseline, geocoding, fire sampling, NASA climatology, CHIRPS archive, validation, workspace access control, revision conflicts, widget.');
