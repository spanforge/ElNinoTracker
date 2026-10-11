import fs from 'node:fs';
const original=JSON.parse(fs.readFileSync('data/countries.json','utf8'));
const bank=JSON.parse(fs.readFileSync('.data-cache/worldbank-countries.json','utf8')).data;
const names={'COD':'Democratic Republic of the Congo','COG':'Republic of the Congo','EGY':'Egypt','IRN':'Iran','KOR':'South Korea','PRK':'North Korea','LAO':'Laos','RUS':'Russia','SYR':'Syria','VEN':'Venezuela','VNM':'Vietnam','YEM':'Yemen','TUR':'Turkey','SVK':'Slovakia','KGZ':'Kyrgyzstan','USA':'United States of America','PSE':'Palestine','SWZ':'eSwatini','CIV':"Côte d'Ivoire"};
const result=original.filter(c=>/^[A-Z]{3}$/.test(c.iso3));
for(const b of bank){const existing=result.find(c=>c.iso3===b.iso3);if(existing)Object.assign(existing,{capital:b.capital,region:b.region,income:b.income});else result.push({...b,name:names[b.iso3]||b.name})}
fs.writeFileSync('data/countries.json',JSON.stringify(result,null,2));
console.log(result.length,'countries and territories with usable ISO3 codes');
