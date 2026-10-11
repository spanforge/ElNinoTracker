import {publicSnapshot} from '../../../lib/enso/releases.mjs';
export const dynamic='force-dynamic';
export async function GET(){const s=await publicSnapshot(),r=s.assessment;return Response.json({provider:'NOAA CPC',release_id:r?.id||null,bundle_id:r?.bundle_id||null,issued_at:r?.issued_at||null,fetched_at:r?.fetched_at||null,freshness:s.freshness.assessment,assessment:r,previous_assessment:s.previous},{headers:{'Cache-Control':'public, max-age=0, s-maxage=3600, stale-while-revalidate=60','X-Content-Type-Options':'nosniff'}})}
