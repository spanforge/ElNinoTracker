import * as cheerio from 'cheerio';
import {MONTHS,SEASONS,SUMMARIES,isoMonth,endMonth} from './policy.mjs';
export const PARSER_VERSION='cpc-fixed-adapters/1.1.0';
const clean=text=>text.replace(/\s+/g,' ').trim();
const normalize=text=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function dateFrom(text){const m=text.match(/\b(\d{1,2}) (January|February|March|April|May|June|July|August|September|October|November|December) (20\d{2})\b/);if(!m)throw Error('missing_issue_date');const date=new Date(Date.UTC(Number(m[3]),MONTHS.indexOf(m[2]),Number(m[1])));if(date.getUTCDate()!==Number(m[1]))throw Error('invalid_issue_date');return date.toISOString()}
export function parseAssessment(html){
 const $=cheerio.load(html);$('script,style').remove();const text=clean($('body').text());
 if(!text.includes('ENSO Diagnostic Discussion')&&!text.includes('DIAGNOSTIC DISCUSSION'))throw Error('changed_assessment_structure');
 const issued=dateFrom(text),status=text.match(/ENSO Alert System Status:\s*(.*?)\s*Synopsis:/i)?.[1]?.trim();
 if(!status)throw Error('missing_alert');const n=normalize(status);if(!/^(el nino advisory|la nina advisory|el nino watch|la nina watch|not active|inactive|none)(\s*\/\s*(el nino|la nina) watch)?$/.test(n))throw Error('unknown_alert_label');
 const matchPhase=n.includes('advisory')?(n.startsWith('el nino')?'el_nino':'la_nina'):null;
 const present=normalize(text).match(/collectively,?[^.]{0,500}(?:system|conditions) (?:reflected|reflect|indicated|indicate)[^.]*\./)?.[0]||'';
 const synopsis=normalize(text.match(/Synopsis:\s*(.*?)(?:\.\s)/i)?.[1]||'');
 let phase=matchPhase;
 if(!phase){if(/enso.neutral (?:conditions )?(?:are present|continued|continue|persist|prevailed|remain|returned|conditions)/.test(present+' '+synopsis)||/enso.neutral conditions/.test(synopsis))phase='neutral';else throw Error('ambiguous_phase');}
 if(matchPhase&&present&&((phase==='el_nino'&&present.includes('la nina'))||(phase==='la_nina'&&present.includes('el nino'))))throw Error('conflicting_phase');
 const watch=n.match(/(el nino|la nina) watch/),alert=watch?'watch':n.includes('advisory')?'advisory':'none';
 const summary=text.match(/Synopsis:\s*(.*?)(?:\.\s)/i)?.[1]||'';
 const scheduled=text.match(/next ENSO Diagnostics? Discussion is scheduled for\s+([^.]*)/i)?.[1];
 return {issued_at:issued,next_expected_at:scheduled?dateFrom(scheduled):null,phase,alert,alert_phase:watch?(watch[1]==='el nino'?'el_nino':'la_nina'):matchPhase,alert_wording:status,source_summary:summary.split(/\s+/).slice(0,22).join(' '),approved_plain_summary:SUMMARIES[phase]};
}
export function parseOutlook(html,assessmentIssue){
 const $=cheerio.load(html);const issuedText=clean($('h2').filter((_,el)=>$(el).text().includes('Issued')).first().text()),m=issuedText.match(/Issued (\w+) (20\d{2})/);
 if(!m||!MONTHS.includes(m[1]))throw Error('missing_forecast_issue');const issue=new Date(assessmentIssue);if(issue.getUTCMonth()!==MONTHS.indexOf(m[1])||issue.getUTCFullYear()!==Number(m[2]))throw Error('diagnosis_forecast_issue_mismatch');
 const table=$('#probabilities-table');if(table.length!==1)throw Error('changed_forecast_structure');const header=normalize(table.find('tr').first().children('th,td').map((_,el)=>clean($(el).text())).get().join(' '));if(header!=='season la nina neutral el nino')throw Error('changed_probability_columns');
 const rows=[];table.find('tr').slice(1).each((_,tr)=>{const cells=$(tr).children('td,th').map((_,el)=>clean($(el).text())).get();if(cells.length!==4)throw Error('changed_probability_row');const code=cells[0].split(' ')[0];if(!SEASONS.includes(code))throw Error('unknown_season');const values=cells.slice(1).map(v=>/^\d+(?:\.\d+)?%?$/.test(v)?Number(v.replace('%','')):NaN);let year=issue.getUTCFullYear(),startMonth=(SEASONS.indexOf(code)+11)%12;while(Date.UTC(year,startMonth,1)<Date.UTC(issue.getUTCFullYear(),issue.getUTCMonth()-1,1))year++;rows.push({season:code,season_start:isoMonth(year,startMonth),season_end:endMonth(year,startMonth+2),p_la_nina:values[0],p_neutral:values[1],p_el_nino:values[2],method:'NOAA CPC official consensus outlook',probability_basis:'Pacific climate phase, verified against RONI',rounding_rule:'Source percentages rounded; totals 99–101 permitted'});});
 if(rows.length!==9)throw Error('changed_forecast_season_count');return {issued_at:assessmentIssue,source_issued_period:`${m[1]} ${m[2]}`,issued_at_basis:'Associated NOAA diagnostic issue; source table displays month and year',forecasts:rows};
}
export function parseHistory(html){
 const $=cheerio.load(html);const text=clean($('body').text());const version=text.match(/ERSSTv[56]/)?.[0];if(!version||!text.includes('Relative Oceanic Niño Index'))throw Error('index_method_not_recognized');
 if(version!=='ERSSTv6')throw Error('index_migration_requires_review');if(!/1991[–-]2020/.test(text))throw Error('reference_period_changed');const observations=[];
 $('tr').each((_,tr)=>{const cells=$(tr).children('th,td').map((_,el)=>clean($(el).text())).get();if(!/^\d{4}$/.test(cells[0]||''))return;if(cells.length<2||cells.length>13)throw Error('changed_history_row');const year=Number(cells[0]);cells.slice(1).forEach((cell,i)=>{if(!cell)return;if(!/^-?\d+(?:\.\d+)?$/.test(cell))throw Error('invalid_history_value');const month=i;observations.push({index_name:'RONI',dataset_version:version,series_id:'RONI-ERSSTv6-1991-2020',reference_period:'1991–2020',season:SEASONS[i],year,season_start:isoMonth(year,month-1),season_end:endMonth(year,month+1),mid_month:isoMonth(year,month),value_c:Number(cell),provisional:false})});});
 if(observations.length<120||observations[0]?.year!==1950)throw Error('changed_history_structure');const last=Date.parse(observations.at(-1).mid_month);observations.forEach(r=>r.provisional=last-Date.parse(r.mid_month)<=62*86400000);
 const final=observations.at(-1),end=new Date(final.season_end);return {issued_at:null,issued_at_basis:'NOAA table does not state a publication day; observation periods retained',next_expected_at:new Date(Date.UTC(end.getUTCFullYear(),end.getUTCMonth()+2,5)).toISOString(),index_name:'RONI',dataset_version:version,series_id:'RONI-ERSSTv6-1991-2020',reference_period:'1991–2020',observations};
}
