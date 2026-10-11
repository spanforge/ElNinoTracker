import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'elnino-storage-test-'));
process.env.APP_DATABASE_PATH=path.join(directory,'tracker.sqlite');
delete process.env.DATABASE_URL;
const {allow}=await import('../lib/rate-limit.js');
const {insertRecord,readRecord,compareRecord}=await import('../lib/storage.js');
const {registerUser,loginUser,reviewerAllowed}=await import('../lib/auth.js');
test('Country requests do not consume workspace creation allowance',async()=>{
 const country=new Request('http://localhost/api/country'),workspace=new Request('http://localhost/api/workspaces');
 for(let i=0;i<40;i++)assert.equal(await allow(country,100,'country'),true);
 for(let i=0;i<3;i++)assert.equal(await allow(workspace,3,'create'),true);
 assert.equal(await allow(workspace,3,'create'),false);
 assert.equal(await allow(workspace,3,'save'),true);
});
test('Database revision checks accept exactly one concurrent writer',async()=>{
 await insertRecord('tests','shared',{text:'original',revision:1});
 const outcomes=await Promise.all([compareRecord('tests','shared',{text:'a',revision:2},1),compareRecord('tests','shared',{text:'b',revision:2},1)]);
 assert.equal(outcomes.filter(Boolean).length,1);assert.equal((await readRecord('tests','shared')).revision,2);
});
test('Local accounts check passwords and cannot self-assign scientific reviewer access',async()=>{
 const user=await registerUser({username:'test-user',name:'Local reviewer',password:'correct-test-password'});
 assert.equal((await loginUser({username:'test-user',password:'correct-test-password'})).id,user.id);
 await assert.rejects(()=>loginUser({username:'test-user',password:'wrong-password'}));assert.equal(reviewerAllowed(user),false);assert.equal(user.emailVerified,false);
});
