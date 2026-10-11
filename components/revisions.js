'use client';
import {useState} from 'react';
import {useResource} from './hooks';
import {Heading,Empty} from './ui';
import {timestamp} from '../lib/client-utils';
export default function Revisions(){const [source,setSource]=useState('enso'),feed=useResource(`/api/revisions?source=${source}`);return <section className="panel"><Heading eyebrow="RETRIEVAL SNAPSHOTS · PROVIDER VALUES CAN CHANGE" title="Source revision history"/><label className="field">Dataset<select value={source} onChange={e=>setSource(e.target.value)}><option value="enso">NOAA ENSO advisory</option><option value="roni">NOAA RONI</option><option value="outlook">NOAA probabilities</option><option value="food">FAO food prices</option></select></label>{feed.data?.revisions?.length?<div className="table-scroll"><table><thead><tr><th>Retrieved</th><th>Snapshot summary</th></tr></thead><tbody>{feed.data.revisions.map(r=><tr key={r.fetchedAt}><td>{timestamp(r.fetchedAt)}</td><td><code>{typeof r.summary==='string'?r.summary:JSON.stringify(r.summary)}</code></td></tr>)}</tbody></table></div>:<Empty>No revision snapshots captured yet. New core-source refreshes create dated snapshots.</Empty>}</section>}
