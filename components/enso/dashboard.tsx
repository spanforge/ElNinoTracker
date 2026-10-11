'use client';
import {useState,useEffect} from 'react';
import Link from 'next/link';
import type {Snapshot,ImpactCard} from '../../lib/enso/types';
import type {SiteConfig} from '../../lib/enso/config';
import {PHASES,SUMMARIES} from '../../lib/enso/policy.mjs';
import {SiteHeader,SiteFooter} from './shell';
import {SourceNote,dateLabel} from './source';
import Pacific from './pacific';
import ForecastCard from './forecast';
import LazyHistory from './history-lazy';
import ExplanationSteps from './steps';
import RegionContext from './region-context';
import ShareView from './share';
import ImpactCardView from './impact-card';
import {normalizeArea} from '../../lib/enso/insights.mjs';
type Impacts={india:{cards:ImpactCard[]};global:{cards:ImpactCard[]}};
export default function Dashboard({snapshot,initialRegion,initialArea='world',initialSeason,impacts,config,now}:{snapshot:Snapshot;initialRegion:'india'|'global';initialArea?:string;initialSeason?:string;impacts:Impacts;config:SiteConfig;now:number}){
 const [region,setRegion]=useState(initialRegion);const a=snapshot.assessment,f=snapshot.freshness.assessment,phase=a?.phase||'unknown';
 const [area,setArea]=useState(normalizeArea(initialArea));
 useEffect(()=>{const url=new URL(location.href);url.searchParams.set('region',region);if(region==='global')url.searchParams.set('area',area);else url.searchParams.delete('area');history.replaceState(null,'',url.pathname+url.search+url.hash)},[region,area]);
 useEffect(()=>{if('serviceWorker'in navigator)navigator.serviceWorker.getRegistrations().then(regs=>Promise.all(regs.filter(r=>r.active?.scriptURL===location.origin+'/sw.js').map(r=>r.unregister()))).catch(()=>{});},[]);
 const headline=!a?'Current status unavailable':f.state==='archive'?'An older Pacific assessment':f.state==='overdue'?'Latest available assessment':phase==='el_nino'?'The Pacific is in an El Niño phase':phase==='la_nina'?'The Pacific is in a La Niña phase':'Neither El Niño nor La Niña is dominant';
 const previous=snapshot.previous,comparable=previous&&a&&previous.parser_version===a.parser_version&&Date.parse(previous.issued_at!)<Date.parse(a.issued_at!);
 return <><SiteHeader config={config} region={region} onRegion={setRegion}/><main id="main" className="dashboard-main"><section className={'hero card '+phase} aria-labelledby="status-heading"><div className="hero-copy"><span className="eyebrow">THE PACIFIC, EXPLAINED</span><p className="assessment-label">{f.state==='current'?'Official status':f.state==='archive'?'Archive summary':'Latest available information'}</p><h1 id="status-heading">{headline}</h1>{a&&<p className="hero-date">Issued {dateLabel(a.issued_at)} · NOAA</p>}<p className="hero-summary">{a?a.approved_plain_summary:SUMMARIES.unknown}</p>{a?.alert!=='none'&&a&&<div className="alert-label"><span className={'phase-dot '+(a.alert_phase==='el_nino'?'warm':a.alert_phase==='la_nina'?'cool':'neutral')} aria-hidden="true"/><strong>{a.alert_wording}</strong>{a.alert==='watch'&&<p>A watch means {PHASES[a.alert_phase||'unknown']} may develop. It does not mean that phase has started.</p>}</div>}{f.state==='archive'&&<p className="archive-notice">This assessment is more than 90 days old and may be outdated. Read the official source for the latest status.</p>}{comparable&&f.state==='current'&&<p className="what-changed">Since the previous update: {previous.phase===a!.phase?'the phase is unchanged.':`the phase changed from ${PHASES[previous.phase]} to ${PHASES[a!.phase]}.`} This does not describe local risk.</p>}<SourceNote release={a} freshness={f}/></div><Pacific phase={f.state==='archive'?'unknown':phase}/></section>
 <ForecastCard key={snapshot.outlook?.id||'none'} release={snapshot.outlook} previous={snapshot.previousOutlook} initialSeason={initialSeason} freshness={snapshot.freshness.outlook} now={now}/>
 <section className="impacts-section" aria-labelledby="impacts-heading"><div className="section-heading"><div><span className="eyebrow">EVERYDAY CONTEXT</span><h2 id="impacts-heading">What this could mean for {region==='india'?'India':'the world'}</h2></div><div className="region-switch" role="group" aria-label="Impact view"><button aria-pressed={region==='india'} onClick={()=>setRegion('india')}>India</button><button aria-pressed={region==='global'} onClick={()=>setRegion('global')}>Global</button></div></div><p className="section-intro">{region==='india'?'El Niño does not guarantee drought. The Indian Ocean, the season and other weather patterns also matter.':'There is no single worldwide impact. Effects differ by region and season.'}</p><RegionContext region={region} area={area} onArea={setArea} month={new Date(now).getUTCMonth()+1} phase={phase} freshness={f.state}/><ShareView/><div className={'impact-cards '+(region==='global'?'global-view':'')}>{(region==='india'?impacts.india.cards:[]).slice(0,3).map((card,i)=><ImpactCardView key={card.id} card={card} index={i}/>)}</div></section>
 <section className="card history-section" aria-labelledby="history-heading"><span className="eyebrow">OBSERVATIONS · NOT A FORECAST</span><h2 id="history-heading">How the ocean is changing</h2><LazyHistory/></section>
 <section className="learn-section" aria-labelledby="learn-heading"><span className="eyebrow">UNDERSTAND IN ONE MINUTE</span><h2 id="learn-heading">One ocean. A connected atmosphere.</h2><ExplanationSteps/><p>El Niño happens when part of the tropical Pacific stays unusually warm and the ocean and atmosphere act together. This can shift rainfall and temperature patterns around the world.</p><Link className="text-link" href="/understand">Understand El Niño, La Niña and neutral →</Link></section>
 <aside className="trust-strip"><span aria-hidden="true">✓</span><p>Official observations and outlooks from NOAA. India context links from IMD. We do not create climate forecasts.</p><Link href="/sources">How we use the evidence →</Link></aside></main><SiteFooter config={config}/></>;
}
