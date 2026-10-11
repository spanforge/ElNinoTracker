import { globalData,worldCountries,countryData,fireData } from '../lib/providers.js';
import countryDataIndex from '../data/countries.json' with {type:'json'};
// Run hourly with your scheduler. Provider-specific TTLs prevent redundant calls.
console.log('Refreshing freely available climate data…');
const [global,countries,fires]=await Promise.all([globalData(),worldCountries(),fireData()]);
for(const [key,result] of Object.entries(global))if(result&&typeof result==='object')console.log(key,result.status,result.data?.length??'');
console.log('countries',countries.status,'fires',fires.status,fires.data?.total??'');
for(const iso of (process.env.PREWARM_COUNTRIES||'IND,AUS,PER,KEN').split(',')){
 const base=countryDataIndex.find(c=>c.iso3===iso);if(!base)continue;const country={...base,...countries.data?.find(c=>c.iso3===iso),name:base.name};const d=await countryData(country);console.log(iso,Object.fromEntries(['economy','weather','air','flood','seasonal','recent'].map(k=>[k,d[k].status])));
}
