import {publicSnapshot} from '../../../lib/enso/releases.mjs';
import {impactSnapshot} from '../../../lib/enso/impacts.mjs';
export const dynamic='force-dynamic';
export async function GET(request:Request){const region=new URL(request.url).searchParams.get('region')||'india';if(!['india','global'].includes(region))return Response.json({error:'Choose region=india or global.'},{status:400});const s=await publicSnapshot();return Response.json(impactSnapshot(region,s.assessment?.phase),{headers:{'Cache-Control':'public, max-age=0, s-maxage=3600, stale-while-revalidate=60'}})}
