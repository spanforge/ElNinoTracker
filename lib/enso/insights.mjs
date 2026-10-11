import {PHASES,fullSeason} from './policy.mjs';
export const GLOBAL_AREAS=[
 {id:'world',name:'Worldwide',season:'Check your local season',text:'The same Pacific phase can mean different things in different places. Start with your national weather service before making plans.',url:'https://www.noaa.gov/understanding-el-nino',source:'NOAA: regional and seasonal effects'},
 {id:'north-america',name:'North America',season:'Look for the winter explanation',text:'NOAA explains how winter weather patterns can differ across the United States. Choose the part of the country relevant to you; a continent-wide label is too broad for local decisions.',url:'https://www.noaa.gov/understanding-el-nino',source:'NOAA: North American seasonal context'},
 {id:'south-america',name:'South America',season:'Check the country and time of year',text:'NOAA’s guide covers rainfall and coastal ocean effects in parts of South America. Conditions vary along the coast and inland, so check your national weather service for a current outlook.',url:'https://www.noaa.gov/understanding-el-nino',source:'NOAA: South American context'},
 {id:'australia',name:'Australia',season:'Use the current Australian seasonal outlook',text:'Australia’s Bureau of Meteorology monitors the Pacific alongside other climate influences. Its regional outlook is the place to check what the current season could mean where you live.',url:'https://www.bom.gov.au/climate/enso/',source:'Bureau of Meteorology: climate monitoring'},
 {id:'southeast-asia',name:'Southeast Asia',season:'Check the local wet or dry season',text:'NOAA’s guide discusses El Niño effects in Indonesia and parts of southern Asia. Wet and dry seasons differ across this region; use your national weather service for local guidance.',url:'https://www.noaa.gov/understanding-el-nino',source:'NOAA: Asian regional context'},
];
export const normalizeArea=value=>GLOBAL_AREAS.some(a=>a.id===value)?value:'world';
export function regionalTakeaway(region,month,phase,freshness){
 if(freshness!=='current'||phase==='unknown')return 'Use the official source for the latest status, then check your local weather service before making plans.';
 if(region!=='india')return 'Choose a region below, then check its local outlook. Pacific phase chances do not predict rain in your town.';
 if(month>=10)return 'For India now, check IMD’s October–December rain outlook. Southwest monsoon links describe a different season, not your current local forecast.';
 if(month>=6&&month<=9)return 'For India’s June–September monsoon, check IMD’s rainfall outlook. The Pacific phase is only one influence and does not decide how much rain your town gets.';
 return 'For India, check IMD’s current seasonal outlook. The June–September southwest monsoon is a separate season; the Pacific phase alone does not predict your local weather.';
}
export function forecastChange(current,previous,selected){
 if(!current||!previous||!selected||current.parser_version!==previous.parser_version||current.provider!==previous.provider||current.source_url!==previous.source_url||!current.issued_at||!previous.issued_at||Date.parse(previous.issued_at)>=Date.parse(current.issued_at))return null;
 const old=previous.forecasts.find(r=>r.season_start===selected.season_start&&r.season_end===selected.season_end&&r.method===selected.method&&r.probability_basis===selected.probability_basis);if(!old)return null;
 const changes=[['el_nino','p_el_nino'],['neutral','p_neutral'],['la_nina','p_la_nina']].map(([phase,key])=>({phase,old:old[key],value:selected[key],delta:Math.round((selected[key]-old[key])*10)/10}));
 if(changes.some(c=>!Number.isFinite(c.delta)))return null;
 const changed=changes.filter(c=>c.delta!==0);
 return {period:fullSeason(selected),previous_issued_at:previous.issued_at,text:changed.length?changed.map(c=>`${PHASES[c.phase]} ${c.delta>0?'rose':'fell'} by ${Math.abs(c.delta)} percentage ${Math.abs(c.delta)===1?'point':'points'} (${c.old}% to ${c.value}%)`).join('; ')+'.':'The three phase chances are unchanged for this period.'};
}
export function historyTakeaway(release){
 const rows=release?.observations;if(!rows||rows.length<2)return null;
 const latest=rows.at(-1),previous=rows.at(-2);if(!Number.isFinite(latest.value_c)||!Number.isFinite(previous.value_c))return null;
 const delta=Math.round((latest.value_c-previous.value_c)*10)/10;
 return `${fullSeason(latest)}: the observed ocean index is ${latest.value_c.toFixed(1)} °C, ${delta===0?'unchanged from':`${Math.abs(delta).toFixed(1)} °C ${delta>0?'higher':'lower'} than`} the previous three month period. These overlapping averages do not decide the official phase.${latest.provisional?' The latest value may be revised.':''}`;
}
