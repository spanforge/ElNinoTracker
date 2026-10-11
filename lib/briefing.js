export const finite = value => typeof value === 'number' && Number.isFinite(value);

// A complete total is never inferred from a partial series.
export function completeTotal(values, expected = 14) {
  const valid = Array.isArray(values) ? values.filter(finite) : [];
  return { value: values?.length === expected && valid.length === expected ? valid.reduce((a,b)=>a+b,0) : null, validDays: valid.length, expectedDays: expected };
}

export function feedUsable(feed, maxAgeHours = 36, now = Date.now()) {
  return !!feed?.data && !['stale','unavailable','outside coverage'].includes(feed.status) && Number.isFinite(Date.parse(feed.fetchedAt)) && now-Date.parse(feed.fetchedAt) <= maxAgeHours*3600000;
}

export function makeBriefing(data, now = Date.now()) {
  const weatherOK = feedUsable(data?.weather,36,now), airOK = feedUsable(data?.air,36,now), seasonalOK = feedUsable(data?.seasonal,45*24,now);
  const daily = data?.weather?.data?.daily, maximums = daily?.temperature_2m_max?.filter(finite) || [];
  const rain = completeTotal(daily?.precipitation_sum);
  const monthly = data?.seasonal?.data?.monthly;
  const monthIndex = monthly?.time?.findIndex(date => date.slice(0,7)>=new Date(now).toISOString().slice(0,7)) ?? -1;
  return {
    weatherOK, airOK, seasonalOK,
    temperature: weatherOK && finite(data.weather.data.current?.temperature_2m) ? data.weather.data.current.temperature_2m : null,
    maxTemperature: weatherOK && maximums.length === 14 ? Math.max(...maximums) : null,
    hotDays: weatherOK && maximums.length === 14 ? maximums.filter(v=>v>=35).length : null,
    rain: {...rain,value:weatherOK?rain.value:null},
    airQuality: airOK && finite(data.air.data.current?.us_aqi) ? data.air.data.current.us_aqi : null,
    month: monthIndex>=0 ? monthly.time[monthIndex] : null,
    temperatureAnomaly: seasonalOK && monthIndex>=0 && finite(monthly.temperature_2m_anomaly?.[monthIndex]) ? monthly.temperature_2m_anomaly[monthIndex] : null,
    rainfallAnomaly: seasonalOK && monthIndex>=0 && finite(monthly.precipitation_anomaly?.[monthIndex]) ? monthly.precipitation_anomaly[monthIndex] : null,
  };
}
