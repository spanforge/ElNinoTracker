import {SOURCES} from './policy.mjs';
const iso=value=>typeof value==='string'&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString()===value;
export function validateRelease(release,now=Date.now(),previous=null){
 if(!/^[a-z0-9-]{8,120}$/.test(release.id)||!/^[a-z0-9-]{8,120}$/.test(release.bundle_id)||!/^[a-f0-9]{64}$/.test(release.checksum)||!new RegExp('^'+release.kind+'-[a-f0-9]{64}\\.html$').test(release.raw_file)||release.source_url!==SOURCES[release.kind])throw Error('invalid_release_identity');
 if(release.schema_version!=='1.1'||!release.id||!release.bundle_id||release.provider!=='NOAA CPC'||!Object.values(SOURCES).includes(release.source_url)||!iso(release.fetched_at)||Date.parse(release.fetched_at)>now+60000||!release.checksum||!release.parser_version||!['approved','staged'].includes(release.review_state))throw Error('invalid_release_metadata');
 if(release.kind!=='history'&&!iso(release.issued_at))throw Error('missing_issue_date');
 if(release.issued_at&&(!iso(release.issued_at)||Date.parse(release.issued_at)>now))throw Error('future_or_invalid_issue_date');
 if(release.kind==='assessment'){
  if(!['el_nino','la_nina','neutral','unknown'].includes(release.phase)||!['advisory','watch','none','unknown'].includes(release.alert))throw Error('unknown_labels');
  if(release.phase==='unknown'||release.alert==='unknown'||!release.approved_plain_summary)throw Error('ambiguous_assessment');
  if(release.alert==='watch'&&!['el_nino','la_nina'].includes(release.alert_phase))throw Error('watch_phase_missing');
 }else if(release.kind==='outlook'){
  const seen=new Set();let last=0;
  for(const r of release.forecasts||[]){const p=[r.p_el_nino,r.p_neutral,r.p_la_nina],total=p.reduce((a,b)=>a+b,0);if(p.some(n=>typeof n!=='number'||!Number.isFinite(n)||n<0||n>100))throw Error('invalid_probability');if(total<99||total>101||(total!==100&&!r.rounding_rule?.includes('99–101')))throw Error('invalid_probability_total');if(!iso(r.season_start)||!iso(r.season_end)||Date.parse(r.season_end)<=Date.parse(r.season_start)||seen.has(r.season_start)||Date.parse(r.season_start)<=last)throw Error('duplicate_or_invalid_seasons');seen.add(r.season_start);last=Date.parse(r.season_start);}
  if(!seen.size)throw Error('empty_forecast');
 }else if(release.kind==='history'){
  if(release.issued_at===undefined)throw Error('missing_history_date_basis');
  if(release.issued_at===null&&!release.issued_at_basis?.includes('does not state'))throw Error('missing_history_date_basis');
  if(release.index_name!=='RONI'||release.dataset_version!=='ERSSTv6')throw Error('index_migration_requires_review');let last=-Infinity;const seen=new Set();
  for(const r of release.observations||[]){if(!iso(r.season_start)||!iso(r.season_end)||!iso(r.mid_month)||Date.parse(r.season_end)>now||typeof r.value_c!=='number'||!Number.isFinite(r.value_c)||r.series_id!==release.series_id||r.index_name!==release.index_name||seen.has(r.mid_month)||Date.parse(r.mid_month)<=last)throw Error('invalid_observation');seen.add(r.mid_month);last=Date.parse(r.mid_month);}
  if(!seen.size)throw Error('empty_history');
  if(previous&&(previous.series_id!==release.series_id||previous.reference_period!==release.reference_period))throw Error('index_migration_requires_review');
  if(previous){const old=new Map(previous.observations.map(r=>[r.mid_month,r.value_c]));if(release.observations.some(r=>old.has(r.mid_month)&&Math.abs(r.value_c-old.get(r.mid_month))>1))throw Error('large_index_revision_requires_review');const a=release.observations.at(-1),b=release.observations.at(-2);if(Math.abs(a.value_c-b.value_c)>1.5)throw Error('large_index_change_requires_review');}
 }else throw Error('unknown_release_kind');return release;
}
