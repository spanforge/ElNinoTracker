import Dashboard from '../components/enso/dashboard';
import {publicSnapshot} from '../lib/enso/releases.mjs';
import {impactSnapshot} from '../lib/enso/impacts.mjs';
import {siteConfig} from '../lib/enso/config';
import type {Snapshot,ImpactCard} from '../lib/enso/types';
export const dynamic='force-dynamic';
export default async function Home({searchParams}:{searchParams:Promise<{region?:string;area?:string;season?:string}>}){const params=await searchParams,now=Date.now(),snapshot=await publicSnapshot(now) as Snapshot;const region=params.region==='global'?'global':'india';const impacts={india:impactSnapshot('india',snapshot.assessment?.phase,now),global:impactSnapshot('global',snapshot.assessment?.phase,now)} as {india:{cards:ImpactCard[]};global:{cards:ImpactCard[]}};return <Dashboard snapshot={snapshot} initialRegion={region} initialArea={typeof params.area==='string'?params.area:undefined} initialSeason={typeof params.season==='string'?params.season:undefined} impacts={impacts} config={siteConfig} now={now}/>}
