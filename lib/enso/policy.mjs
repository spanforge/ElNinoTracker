export const SOURCES={
 assessment:'https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml',
 outlook:'https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso/roni/probabilities/',
 history:'https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso/roni/',
 imd:'https://mausam.imd.gov.in/responsive/monsooninformation.php',
 imdHistory:'https://mausam.imd.gov.in/responsive/el_nino_ismr.php',
};
export const PHASES={el_nino:'El Niño',la_nina:'La Niña',neutral:'Neutral',unknown:'Unknown'};
export const SUMMARIES={
 el_nino:'Part of the tropical Pacific is unusually warm, with changes in the atmosphere too. This can shift weather patterns far away.',
 la_nina:'Part of the tropical Pacific is unusually cool, with changes in the atmosphere too. Its effects vary by region and season.',
 neutral:'Neither El Niño nor La Niña is currently dominant. Other climate influences can still bring unusual weather.',
 unknown:'We cannot show a verified assessment right now.',
};
export const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
export const SEASONS=['DJF','JFM','FMA','MAM','AMJ','MJJ','JJA','JAS','ASO','SON','OND','NDJ'];
export const isoMonth=(year,month)=>new Date(Date.UTC(year,month,1)).toISOString();
export const endMonth=(year,month)=>new Date(Date.UTC(year,month+1,1)-1).toISOString();
export function fullSeason(row){const start=new Date(row.season_start),end=new Date(row.season_end);return `${MONTHS[start.getUTCMonth()]} ${start.getUTCFullYear()} – ${MONTHS[end.getUTCMonth()]} ${end.getUTCFullYear()}`}
export function ongoingSeasons(rows,now=Date.now()){return rows.filter(r=>Date.parse(r.season_end)>=now)}
export function likelihood(row){const entries=[['el_nino',row.p_el_nino],['neutral',row.p_neutral],['la_nina',row.p_la_nina]],max=Math.max(...entries.map(e=>e[1]));const leaders=entries.filter(e=>e[1]===max);return leaders.length===1?`Most likely phase: ${PHASES[leaders[0][0]]}`:'No single outcome has a higher chance.'}
export function freshness(release,lastCheck,now=Date.now(),kind='monthly'){
 if(!release)return {state:'unavailable',check_failed:lastCheck?.state==='failed',issue_age_days:null,policy:'Website operating policy'};
 // NOAA's history page has no issue day. Use its explicit observation period, never its fetch time, as the age fallback.
 const basis=release.issued_at||release.observations?.at(-1)?.season_end;
 const age=Math.max(0,(now-Date.parse(basis))/86400000);
 const due=release.next_expected_at?Date.parse(release.next_expected_at)+7*86400000:Date.parse(basis)+45*86400000;
 const state=age>90?'archive':now>due?'overdue':'current';
 return {state,check_failed:lastCheck?.state==='failed'||lastCheck?.state==='pending_review',last_checked_at:lastCheck?.checked_at||release.fetched_at,issue_age_days:Math.floor(age),next_expected_at:release.next_expected_at||null,policy:'Website operating policy, not a NOAA rule',kind};
}
