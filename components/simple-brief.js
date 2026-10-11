'use client';
import {useState} from 'react';
import {CloudSun,CalendarDays,CheckCircle2,Info,MapPin,Printer} from 'lucide-react';
import {plain,countryName} from '../lib/plain-language';
import {makeBriefing} from '../lib/briefing';
import {countryEvidence} from '../lib/country-evidence';
import {useResource} from './hooks';
import {Source} from './ui';

export default function SimpleBrief({selected,data,language,units,point,loading}) {
 const p=plain[language]||plain.en, b=makeBriefing(data), evidence=countryEvidence(selected.iso3), [audience,setAudience]=useState('family');
 const review=useResource(`/api/reviews?iso=${selected.iso3}`);
 const fmt=v=>Intl.NumberFormat(language,{maximumFractionDigits:1}).format(v), temp=v=>units==='imperial'?v*9/5+32:v, rain=v=>units==='imperial'?v/25.4:v;
 const month=b.month?new Date(b.month.slice(0,7)+'-15T12:00:00Z').toLocaleDateString(language,{month:'long',year:'numeric',timeZone:'UTC'}):'';
 const published=review.data?.review;
 return <section className="simple-brief" lang={language} aria-busy={loading} aria-label={p.briefing}>
  <div className="brief-heading"><div><span className="eyebrow">{p.briefing}</span><h2>{countryName(selected,language)}</h2><p><MapPin size={16}/>{p.near} {point?.label||selected.capital||selected.name}</p></div><button onClick={()=>window.print()}><Printer size={16}/>{p.download}</button></div>
  <p className="point-explainer">{p.point} {p.chooseCity}</p>
  <div className="country-takeaway"><strong>{p.evidence}</strong><p>{language==='en'?evidence.climate:({dry:p.patternDry,wet:p.patternWet,mixed:p.patternMixed,unknown:p.limited})[evidence.pattern]}</p><small>{p.notCause}</small></div>
  <div className="brief-cards">
   <article><CloudSun size={25}/><h3>{p.now}</h3><dl className="plain-metrics"><div><dt>{p.temperature}</dt><dd>{b.temperature===null?p.unavailable:`${fmt(temp(b.temperature))} ${units==='imperial'?'°F':'°C'}`}</dd></div><div><dt>{p.rain}</dt><dd>{b.rain.value===null?p.incomplete:`${fmt(rain(b.rain.value))} ${units==='imperial'?'in':'mm'}`}</dd>{b.rain.value===null&&<small>{b.rain.validDays}/14 {p.days}</small>}</div><div><dt>{p.aqi}</dt><dd>{b.airQuality===null?p.unavailable:fmt(b.airQuality)}</dd><small>{p.aqiHelp}</small></div></dl><p className="brief-footnote">{p.current}</p>{(!b.weatherOK||!b.airOK)&&!loading&&<p className="data-gap" role="status">{p.stale}</p>}</article>
   <article><CalendarDays size={25}/><h3>{p.later}</h3>{month&&<span className="brief-month">{p.forecastMonth}: {month}</span>}<p>{b.temperatureAnomaly===null?p.noOutlook:b.temperatureAnomaly>.1?p.warmer:b.temperatureAnomaly<-.1?p.cooler:p.similar}</p>{b.rainfallAnomaly!==null&&<p>{b.rainfallAnomaly>0?p.moreRain:b.rainfallAnomaly<0?p.lessRain:p.normalRain}</p>}<p className="brief-footnote">{p.model}</p><p className="uncertainty"><Info size={16}/>{p.uncertain}</p></article>
   <article><CheckCircle2 size={25}/><h3>{p.actions}</h3><ul className="plain-actions"><li>{b.hotDays>0?p.heatAction:p.a1}</li><li>{b.airQuality>100?p.airAction:p.a2}</li><li>{p.a3}</li></ul><label className="field">{language==='en'?'Advice for':language==='hi'?'किसके लिए सलाह':language==='es'?'Consejos para':'Conseils pour'}<select value={audience} onChange={e=>setAudience(e.target.value)}>{['family','farm','business'].map(a=><option key={a} value={a}>{p[a]}</option>)}</select></label><p className="audience-tip">{p[audience+'Action']}</p></article>
  </div>
  <details className="simple-definition"><summary>{p.dailyLife}</summary><p><strong>{p.foodLabel}: </strong>{p.foodImpact}</p><p><strong>{p.healthLabel}: </strong>{p.healthImpact}</p><p><strong>{p.waterLabel}: </strong>{p.waterImpact}</p></details>
  <div className="brief-evidence"><details><summary>{p.sources}</summary><div lang="en"><p>{evidence.climate}</p><p><strong>Season:</strong> {evidence.season}</p><p><strong>Evidence strength:</strong> {evidence.confidence}</p><p><strong>Editorial author:</strong> {evidence.author}</p><p><strong>Scientific review:</strong> {published?`${published.reviewerName} · ${published.reviewedAt.slice(0,10)}`:evidence.reviewStatus}</p>{published&&<p>{published.note}</p>}<p><strong>Content version:</strong> {evidence.contentVersion}</p>{evidence.sources.map(s=><p key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.name} ↗</a> · source checked {s.checked}</p>)}<p>Published reviews apply to the regional text, not to the accuracy of a future weather forecast.</p></div></details>{!published&&<small>{p.pending}</small>}</div>
  <details className="simple-definition"><summary>{p.learn}</summary><p>{p.definition}</p><p>{p.notCause}</p><a href="https://www.noaa.gov/understanding-el-nino" lang="en" target="_blank" rel="noreferrer">NOAA: understanding El Niño ↗</a></details>
  <p className="brief-footnote">{p.noAlerts}</p><div className="brief-sources" lang="en"><Source id="weather" feed={data?.weather}/><Source id="air" feed={data?.air}/><Source id="seasonal" feed={data?.seasonal}/></div>
 </section>;
}
