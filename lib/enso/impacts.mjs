import content from '../../data/impact-content.json' with {type:'json'};
const inDate=(value,now)=>typeof value==='string'&&Number.isFinite(Date.parse(value))&&Date.parse(value)<=now;
function publishable(card,now){
 if(card.evidence_type==='source_link')return true;
 const verified=card.review_state==='source_verified'&&inDate(card.source_checked_at,now)&&card.sources?.length>0&&card.sources.every(s=>typeof s.url==='string'&&s.url.startsWith('https://'));
 const approved=card.review_state==='approved'&&(!card.review_due_at||Date.parse(card.review_due_at)>=now);
 if(card.evidence_type==='official_guidance')return verified||approved;
 if(card.evidence_type==='official_outlook')return (verified||approved)&&inDate(card.issued_at,now)&&inDate(card.valid_from,now)&&Date.parse(card.valid_until)>=now;
 return approved;
}
export function selectImpactCards(cards,region,phase,now){
 const month=new Date(now).getUTCMonth()+1;
 const eligible=cards.filter(c=>c.region===region&&c.applicable_months.includes(month)&&(c.phase==='all'||c.phase===phase)&&publishable(c,now));
 const topics=[...new Set(cards.filter(c=>c.region===region).map(c=>c.topic||c.id))];
 return topics.map(topic=>eligible.filter(c=>(c.topic||c.id)===topic).sort((a,b)=>(b.evidence_type==='official_outlook'?1:0)-(a.evidence_type==='official_outlook'?1:0)||Date.parse(b.issued_at||'1970-01-01')-Date.parse(a.issued_at||'1970-01-01'))[0]).filter(Boolean);
}
export function impactSnapshot(region='india',phase='unknown',now=Date.now()){
 const cards=selectImpactCards(content.cards,region,phase,now);
 return {provider:content.provider,release_id:content.content_version,issued_at:cards.find(c=>c.evidence_type==='official_outlook')?.issued_at||null,fetched_at:content.source_checked_at,region,cards,freshness:{state:'source_verified',check_failed:false},note:'Dated IMD outlooks and general official precautions are shown separately. Summaries are source-verified, not independently scientifically reviewed. Local conditions and other climate influences matter.'};
}
