import {countries} from './catalog.js';

const NOAA={name:'NOAA: how El Niño affects weather',url:'https://www.noaa.gov/understanding-el-nino',checked:'2026-10-11'};
const WHO={name:'WHO: regional patterns and health context',url:'https://www.who.int/news-room/fact-sheets/detail/el-nino-southern-oscillation-(enso)',checked:'2026-10-11'};
const BOM={name:'Australian Bureau of Meteorology: ENSO',url:'https://www.bom.gov.au/climate/enso/',checked:'2026-10-11'};
const CPC={name:'NOAA: seasonal temperature and rainfall maps',url:'https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/ensocycle/elninosfc.shtml',checked:'2026-10-11'};
const groups=[
 {codes:'IND PAK BGD LKA NPL BTN',pattern:'dry',season:'Monsoon season; timing varies locally',text:'Parts of South Asia can receive less rain during El Niño. Local forecasts matter more than a regional pattern.',sources:[WHO,CPC]},
 {codes:'IDN MYS PHL TLS BRN PNG',pattern:'dry',season:'Check local wet and dry seasons',text:'Drier conditions can occur in parts of this region. Water supplies, crops and fire conditions are useful things to monitor.',sources:[NOAA,WHO]},
 {codes:'AUS',pattern:'dry',season:'Mainly winter and spring in eastern Australia',text:'El Niño often brings less rain to eastern Australia. The effect varies by season and other climate drivers.',sources:[BOM,NOAA]},
 {codes:'PER ECU',pattern:'wet',season:'Often the coastal rainy season; inland effects differ',text:'Some Pacific coastal areas can receive more rain. A coastal pattern does not describe every inland or mountain location.',sources:[NOAA,WHO]},
 {codes:'KEN SOM UGA TZA RWA BDI',pattern:'wet',season:'Especially the October–December short rains',text:'Parts of equatorial East Africa can have wetter short rains. Flood preparedness should follow local warnings.',sources:[WHO,CPC]},
 {codes:'ZAF ZWE ZMB BWA NAM SWZ LSO MWI MOZ',pattern:'dry',season:'Southern African rainy season',text:'Southern Africa can be drier during El Niño. Farmers and water users should check local rainfall outlooks.',sources:[WHO,CPC]},
 {codes:'USA CAN',pattern:'mixed',season:'Strongest connections usually in northern winter',text:'Winter patterns can differ sharply between north and south. Northern areas may be warmer; southern US areas may be wetter.',sources:[NOAA,CPC]},
 {codes:'BRA',pattern:'mixed',season:'Depends on region and season',text:'Northern Brazil can be drier, while some southern areas may be wetter. One national label would hide these differences.',sources:[WHO,CPC]},
 {codes:'CHL',pattern:'wet',season:'Depends on latitude and the local rainy season',text:'Some parts of Chile can receive more rain during El Niño. Mountain and coastal conditions still need local interpretation.',sources:[NOAA,CPC]},
];

export function countryEvidence(iso) {
  const country=countries.find(c=>c.iso3===iso), group=groups.find(g=>g.codes.split(' ').includes(iso));
  return {
    iso, country:country?.name, coverage:group?'Regional evidence':'Local direction not established', pattern:group?.pattern||'unknown',
    climate:group?.text||'There is no single reliable El Niño effect shown here for this country. Use the local forecast and your weather service.',
    season:group?.season||'Depends on season and location',
    economy:'Changing rainfall can affect farming, water supply and electricity. These are possible links, not measured losses.',
    health:'Heat, smoke or unsafe water can affect health. Local health services are the right source for health alerts.',
    nature:'Changing rain and ocean warmth can affect rivers, forests and sea life. Check local conditions.',
    confidence:group?'Regional pattern only; local outcomes uncertain':'Insufficient country-specific evidence',
    sources:group?.sources||[CPC,NOAA], author:'Sriram Advisory editorial draft',
    contentVersion:'2026-10-11-v3', reviewStatus:'Awaiting independent scientific review', reviewer:null, reviewedAt:null,
  };
}

export const countryEvidenceCoverage={countries:countries.length,regionalCountries:groups.reduce((n,g)=>n+g.codes.split(' ').length,0)};
