import test from 'node:test';
import assert from 'node:assert/strict';
import {completeTotal,makeBriefing} from '../lib/briefing.js';
import {countryEvidence,countryEvidenceCoverage} from '../lib/country-evidence.js';
import {plain,countryName} from '../lib/plain-language.js';

test('Rain totals require fourteen finite observations, including genuine zero-rain days',()=>{
 assert.equal(completeTotal(Array(14).fill(0)).value,0);
 assert.equal(completeTotal([1,...Array(13).fill(2)]).value,27);
 for(const values of [[],Array(13).fill(1),[null,...Array(13).fill(1)],[NaN,...Array(13).fill(1)]])assert.equal(completeTotal(values).value,null);
 assert.equal(completeTotal([null,...Array(13).fill(1)]).validDays,13);
});
test('The simple briefing does not interpret stale or partial forecasts as an all-clear',()=>{
 const now=Date.parse('2026-10-11T12:00:00Z'),feed={status:'fresh',fetchedAt:'2026-10-11T10:00:00Z',data:{current:{temperature_2m:30},daily:{temperature_2m_max:[null,...Array(13).fill(31)],precipitation_sum:[null,...Array(13).fill(1)]}}};
 const current=makeBriefing({weather:feed},now);assert.equal(current.temperature,30);assert.equal(current.hotDays,null);assert.equal(current.rain.value,null);
 assert.equal(makeBriefing({weather:{...feed,status:'stale'}},now).temperature,null);
 assert.equal(makeBriefing({weather:{...feed,fetchedAt:'2026-10-01T00:00:00Z'}},now).temperature,null);
});
test('Regional ENSO guidance preserves mixed and unknown locations and never invents a reviewer',()=>{
 assert.equal(countryEvidence('IND').pattern,'dry');assert.equal(countryEvidence('BRA').pattern,'mixed');assert.equal(countryEvidence('FRA').pattern,'unknown');assert.equal(countryEvidence('IND').reviewer,null);assert.ok(countryEvidenceCoverage.regionalCountries>30);
});
test('The beginner briefing has complete translations and stable English country names',()=>{
 for(const language of ['hi','es','fr'])for(const key of Object.keys(plain.en))assert.equal(typeof plain[language][key],'string',`${language}: ${key}`);
 assert.equal(countryName({name:'Falkland Islands',iso2:'FK'},'en'),'Falkland Islands');
 assert.equal(countryName({name:'Unrecognized territory',iso2:'JG'},'es'),'Unrecognized territory');
});
