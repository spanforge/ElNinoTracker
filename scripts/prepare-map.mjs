import fs from 'node:fs';
import { feature } from 'topojson-client';
const response=await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');if(!response.ok)throw Error('Could not download Natural Earth map');
const topo=await response.json();const geo=feature(topo,topo.objects.countries);
const aliases={'Dem. Rep. Congo':'Democratic Republic of the Congo','Congo':'Republic of the Congo','Dominican Rep.':'Dominican Republic','Central African Rep.':'Central African Republic','Eq. Guinea':'Equatorial Guinea','S. Sudan':'South Sudan','Solomon Is.':'Solomon Islands','Bosnia and Herz.':'Bosnia and Herzegovina','W. Sahara':'Western Sahara','Falkland Is.':'Falkland Islands'};
for(const f of geo.features)f.properties.name=aliases[f.properties.name]||f.properties.name;
fs.writeFileSync('public/world.json',JSON.stringify(geo));
console.log('Natural Earth 110m boundaries:',geo.features.length,'features,',Math.round(fs.statSync('public/world.json').size/1024),'KB');
