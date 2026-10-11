export const siteConfig={
 name:process.env.ELNINO_SITE_NAME||'El Niño Explained',
 initiative:process.env.ELNINO_INITIATIVE===undefined?'Sriram Advisory':process.env.ELNINO_INITIATIVE,
 feedback:process.env.ELNINO_FEEDBACK_URL||'mailto:sriram@sriramadvisory.com',
 owner:process.env.ENSO_OPERATIONAL_OWNER||null,
 reviewer:process.env.ENSO_CONTENT_REVIEWER||null,
};
export type SiteConfig=typeof siteConfig;
