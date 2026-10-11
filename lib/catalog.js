import countryData from '../data/countries.json' with {type:'json'};
import profiles from '../data/profiles.json' with {type:'json'};

export const countries = countryData;
export const detailedProfiles = profiles;
export const sources = [
 {id:'ocean',name:'NOAA CPC · Niño-region SST',url:'https://www.cpc.ncep.noaa.gov/data/indices/sstoi.indices',cadence:'Monthly',license:'US government public data',kind:'Ocean temperature indices'},
 {id:'soi',name:'NOAA CPC · Southern Oscillation Index',url:'https://www.cpc.ncep.noaa.gov/data/indices/soi',cadence:'Monthly',license:'US government public data',kind:'Atmospheric index'},
 {id:'marine',name:'NOAA Coral Reef Watch · ERDDAP',url:'https://coralreefwatch.noaa.gov/product/5km/',cadence:'Daily; mirror availability may lag',license:'NOAA public data; Coral Reef Watch attribution',kind:'Ocean heat-stress point data'},
 {id:'chirpsArchive',name:'CHIRPS v2 · NOAA ERDDAP archive',url:'https://coastwatch.pfeg.noaa.gov/erddap/griddap/chirps20GlobalMonthlyP05_Lon0360.html',cadence:'Archive mirror; check actual dates',license:'CHC public research data; attribution',kind:'Satellite / gauge rainfall archive'},
 {id:'enso',name:'NOAA CPC · ENSO advisory',url:'https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml',cadence:'Monthly',license:'US government public data',kind:'Official assessment'},
 {id:'roni',name:'NOAA CPC · RONI history',url:'https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso/roni/',cadence:'Monthly; recent values provisional',license:'US government public data',kind:'Observed index'},
 {id:'outlook',name:'NOAA CPC · ENSO probabilities',url:'https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso/roni/probabilities/',cadence:'Monthly',license:'US government public data',kind:'Forecast'},
 {id:'weather',name:'Open-Meteo · weather models',url:'https://open-meteo.com/en/docs',cadence:'Model-dependent, several updates daily',license:'CC BY 4.0; free hosted API for non-commercial use',kind:'Model analysis / forecast'},
 {id:'history',name:'Open-Meteo · ERA5 reanalysis',url:'https://open-meteo.com/en/docs/historical-weather-api',cadence:'Daily; publication delay',license:'CC BY 4.0; ECMWF / Copernicus attribution',kind:'Reanalysis'},
 {id:'seasonal',name:'Open-Meteo · ECMWF seasonal',url:'https://open-meteo.com/en/docs/seasonal-forecast-api',cadence:'SEAS5 monthly',license:'CC BY 4.0; ECMWF attribution',kind:'Ensemble forecast'},
 {id:'air',name:'Open-Meteo · CAMS air quality',url:'https://open-meteo.com/en/docs/air-quality-api',cadence:'Daily model runs',license:'CC BY 4.0; CAMS ENSEMBLE attribution',kind:'Model analysis / forecast'},
 {id:'flood',name:'Open-Meteo · Copernicus GloFAS',url:'https://open-meteo.com/en/docs/flood-api',cadence:'Daily',license:'CC BY 4.0; Copernicus Emergency Management attribution',kind:'River discharge forecast'},
 {id:'fires',name:'NASA FIRMS · NOAA-20 VIIRS',url:'https://firms.modaps.eosdis.nasa.gov/active_fire/',cadence:'Near real time, satellite overpasses',license:'NASA open data; acknowledge NASA FIRMS',kind:'Satellite detections'},
 {id:'hazards',name:'GDACS · disaster alerts',url:'https://www.gdacs.org/',cadence:'Event-dependent',license:'GDACS attribution; consult source terms',kind:'Reported hazards'},
 {id:'economy',name:'World Bank · development indicators',url:'https://datahelpdesk.worldbank.org/knowledgebase/articles/889392',cadence:'Annual; indicator-dependent lag',license:'CC BY 4.0, subject to dataset exceptions',kind:'National statistics'},
 {id:'food',name:'FAO · global food price index',url:'https://www.fao.org/worldfoodsituation/foodpricesindex/en/',cadence:'Monthly; values may be revised',license:'FAO attribution; dataset terms apply',kind:'Market index'},
 {id:'power',name:'NASA POWER · historical climate',url:'https://power.larc.nasa.gov/docs/services/api/',cadence:'Daily / monthly; publication delay',license:'NASA open data with acknowledgment',kind:'Gridded meteorology'},
 {id:'health',name:'WHO · ENSO health guidance',url:'https://www.who.int/news-room/fact-sheets/detail/el-nino-southern-oscillation-(enso)',cadence:'Reference guidance, editorial review',license:'Reference link; no full-text republication',kind:'Evidence guidance'},
 {id:'wmo',name:'WMO · seasonal climate updates',url:'https://wmo.int/publication-series/global-seasonal-climate-updates?page=0',cadence:'Periodic official bulletins',license:'Reference link',kind:'Official outlook reference'},
 {id:'chirps',name:'CHIRPS v3 · rainfall products',url:'https://chc.ucsb.edu/data/chirps3',cadence:'Pentad / monthly',license:'Public research data; cite CHC',kind:'Downloadable gridded data'},
 {id:'giews',name:'FAO GIEWS · country briefs / FPMA',url:'https://www.fao.org/giews/countrybrief/',cadence:'Country / market dependent',license:'Reference links; FAO terms apply',kind:'Food security reference'},
];
export function findCountry(value) {return countries.find(c=>c.iso3===value||c.name===value||c.iso2===value)}
export function getProfile(name) {return profiles[name] || {region:'Country coverage',type:'mixed',season:'Depends on season and location',climate:'Country-specific ENSO attribution has not been reviewed for this location. Use local observations and official outlooks; ENSO effects vary within countries.',economy:'Agriculture, water, energy, and trade can be exposed to weather variability. National indicators below describe exposure, not losses caused by ENSO.',health:'Heat, floods, smoke, and disruptions to food or water can affect health. Their connection to ENSO requires local evidence.',nature:'Rainfall and temperature variability can affect ecosystems. The monitoring indicators below do not establish ENSO attribution.',action:'Consult your national meteorological service and local emergency-management guidance.'}}
export const indicators = [
 ['SP.POP.TOTL','Population','people'],['NV.AGR.TOTL.ZS','Agriculture share of GDP','%'],['SL.AGR.EMPL.ZS','Employment in agriculture','%'],['AG.LND.IRIG.AG.ZS','Irrigated agricultural land','%'],['EG.ELC.HYRO.ZS','Hydropower share of electricity','%'],['SH.H2O.BASW.ZS','Basic drinking water access','%'],['SP.POP.65UP.TO.ZS','Population aged 65+','%'],['NY.GDP.MKTP.CD','GDP, current US dollars','USD'],['FP.CPI.TOTL.ZG','Consumer price inflation','%'],['AG.YLD.CREL.KG','Cereal yield','kg / hectare'],
];
export const eventWindows = {'2023–24':['2023-06-01','2024-05-31'],'2015–16':['2015-06-01','2016-05-31'],'1997–98':['1997-06-01','1998-05-31'],'2010–11':['2010-06-01','2011-05-31']};
export const preparedness = {
 households:['Check official heat and flood warnings.','Keep drinking water safe and plan for service interruptions.','Check on older adults and people with chronic illness.'],
 agriculture:['Align planting and irrigation decisions with local seasonal guidance.','Monitor rainfall, soil moisture, and crop-condition reports.','Review water reserves and livestock feed contingencies.'],
 business:['Review supplier dependence on water, crops, and transport corridors.','Check heat protection and business-continuity plans.','Use forecast ranges rather than a single expected outcome.'],
 government:['Coordinate meteorological, water, health, and disaster agencies.','Identify exposed communities and critical services.','Review locally validated preparedness thresholds and response plans.'],
};
