import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base=process.env.TEST_URL||'http://localhost:3000';
const canonical=value=>{const url=new URL(value);url.searchParams.sort();return url.href};
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
await fs.mkdir('test-results',{recursive:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 assert.equal((await page.goto(base)).status(),200);await page.locator('#status-heading').waitFor();const status=await page.locator('#status-heading').innerText();
 assert.equal(await page.locator('.impact-card').count(),3);assert.equal(await page.locator('.impact-action').count(),3);assert.match(await page.locator('.impact-cards').innerText(),/85%/);assert.doesNotMatch(await page.locator('.impact-cards').innerText(),/We do not have|Independent interpretation review pending/);
 await page.locator('.impact-card').first().getByText('Source and context',{exact:true}).click();assert.match(await page.locator('.impact-card').first().innerText(),/not an impact attributed to El Niño alone/);
 await page.locator('.impact-card').first().getByText('Source and context',{exact:true}).click();await page.locator('.impact-cards').screenshot({path:'test-results/india-guidance.png'});
 await page.getByLabel('Impact region').selectOption('global');await page.getByRole('heading',{name:'What this could mean for the world'}).waitFor();assert.equal(await page.locator('#status-heading').innerText(),status);
 await page.getByLabel('World region').selectOption('australia');assert.match(await page.locator('.regional-guide').innerText(),/Bureau of Meteorology/);assert.match(page.url(),/area=australia/);assert.equal(await page.locator('#status-heading').innerText(),status);
 await page.getByRole('button',{name:/Learn how it works/}).click();await page.getByRole('group',{name:'Illustration learning phase'}).getByRole('button',{name:'La Niña'}).click();assert.equal(await page.locator('#status-heading').innerText(),status);
 await page.getByRole('button',{name:/Learn how it works/}).click();
 assert.ok(await page.getByRole('button',{name:'Previous forecast season'}).isDisabled());await page.getByRole('button',{name:'Next forecast season'}).click();assert.ok(await page.getByRole('button',{name:'Previous forecast season'}).isEnabled());
 const sharedView=page.url();await page.reload();assert.equal(page.url(),sharedView);assert.ok(await page.getByRole('button',{name:'Previous forecast season'}).isEnabled());assert.equal(await page.getByLabel('World region').inputValue(),'australia');
 await page.getByText('What changed since the previous update?',{exact:true}).click();assert.match(await page.locator('.forecast-change').innerText(),/No comparable previous|Compared with/);
 await page.context().grantPermissions(['clipboard-read','clipboard-write']);await page.getByRole('button',{name:/Share this view/}).click();await page.getByText('Link copied. It includes your region and selected forecast period.',{exact:true}).waitFor();const copied=await page.evaluate(()=>navigator.clipboard.readText());assert.equal(canonical(copied),canonical(sharedView));
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('clipboard unavailable')}}}));await page.getByRole('button',{name:/Share this view/}).click();await page.locator('.share-view input').waitFor();assert.equal(canonical(await page.locator('.share-view input').inputValue()),canonical(sharedView));
 await page.screenshot({path:'test-results/spec-desktop.png',fullPage:true});
 for(const width of [390,320]){await page.setViewportSize({width,height:844});await page.goto(base);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'horizontal overflow at '+width);if(width===390){const box=await page.locator('#forecast-heading').boundingBox();assert.ok(box.y+box.height<=844,'first forecast heading below fold: '+box.y);await page.screenshot({path:'test-results/spec-mobile.png'});}}
 await page.setViewportSize({width:1440,height:1000});await page.goto(base);await page.locator('#history-heading').scrollIntoViewIfNeeded();await page.locator('.history-chart').waitFor({timeout:30000});
 const point=page.locator('.history-chart circle[tabindex="0"]');await point.focus();const before=await page.locator('.chart-tooltip').innerText();await point.press('ArrowLeft');assert.notEqual(await page.locator('.chart-tooltip').innerText(),before);
 assert.match(await page.locator('.history-takeaway').innerText(),/observed ocean index/);
 await page.getByRole('button',{name:'View data table',exact:true}).click();assert.equal(await page.locator('.history-table tbody tr').count(),24);
 await page.getByRole('button',{name:'10 years',exact:true}).click();await page.waitForFunction(()=>document.querySelectorAll('.history-table tbody tr').length===120);
 await page.getByRole('button',{name:'All available',exact:true}).click();await page.waitForFunction(()=>document.querySelectorAll('.history-table tbody tr').length>900);
 for(const route of ['status','outlook','history?range=24m','impacts?region=india']){const response=await page.request.get(base+'/api/'+route);assert.equal(response.status(),200);const data=await response.json();assert.ok('freshness'in data);}
 assert.equal((await page.request.get(base+'/api/history?range=bad')).status(),400);
 for(const route of ['/understand','/sources'])assert.equal((await page.goto(base+route)).status(),200);
 await page.goto(base+'/understand');await page.getByRole('heading',{name:'Understand El Niño',exact:true}).waitFor();assert.equal(await page.locator('.learning-video').count(),3);assert.equal(await page.locator('.learning-resource').count(),6);assert.equal(await page.locator('iframe').count(),0);
 await page.getByRole('radio',{name:'My town has a 70% chance of drought.',exact:true}).check();await page.getByText('Here’s the distinction.',{exact:true}).waitFor();assert.match(await page.locator('.quiz-feedback').innerText(),/does not give the chance/);
 await page.getByRole('button',{name:'Next question →',exact:true}).click();await page.getByRole('radio',{name:'Yes. Other weather and climate influences still matter.',exact:true}).check();await page.getByRole('button',{name:'Next question →',exact:true}).click();await page.getByRole('radio',{name:'The dated regional outlook, crop advice and water available on the farm.',exact:true}).check();await page.getByRole('button',{name:'Finish the quick check',exact:true}).click();await page.getByRole('heading',{name:'You’ve explored the three key ideas.',exact:true}).waitFor();await page.getByRole('button',{name:'Try the questions again',exact:true}).click();assert.ok(await page.getByRole('button',{name:'Next question →',exact:true}).isDisabled());
 await page.getByText('Rainfall amounts and chances are different',{exact:true}).click();assert.match(await page.locator('.probability-lesson').innerText(),/compares an amount/);
 for(const width of [1440,390,320]){await page.setViewportSize({width,height:900});await page.goto(base+'/understand');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'learning overflow at '+width);if(width!==320)await page.screenshot({path:'test-results/learn-'+width+'.png',fullPage:true});if(width===390)await page.screenshot({path:'test-results/learn-mobile-first.png'});}
 assert.equal(await page.getByRole('link',{name:'Suggest a correction',exact:true}).getAttribute('href'),'mailto:sriram@sriramadvisory.com');
 assert.deepEqual(errors,[]);console.log('PASS: region isolation, learning isolation, seasons, 390/320 layouts, observed history, read-only APIs, information pages and contact.');
}finally{await browser.close()}
