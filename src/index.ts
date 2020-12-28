// This is the collection of models.
import m1 from "./crpsregression_electricity_load_nyiso_capitl_json_lag_1";
import m2 from "./crpsregression_electricity_load_nyiso_capitl_json_lag_12";
import m3 from "./crpsregression_electricity_load_nyiso_capitl_json_lag_3";
import m4 from "./crpsregression_electricity_load_nyiso_centrl_json_lag_1";
import m5 from "./crpsregression_electricity_load_nyiso_centrl_json_lag_12";
import m6 from "./crpsregression_electricity_load_nyiso_centrl_json_lag_3";
import m7 from "./crpsregression_electricity_load_nyiso_dunwod_json_lag_1";
import m8 from "./crpsregression_electricity_load_nyiso_dunwod_json_lag_12";
import m9 from "./crpsregression_electricity_load_nyiso_dunwod_json_lag_3";
import m10 from "./crpsregression_electricity_load_nyiso_genese_json_lag_1";
import m11 from "./crpsregression_electricity_load_nyiso_genese_json_lag_12";
import m12 from "./crpsregression_electricity_load_nyiso_genese_json_lag_3";
import m13 from "./crpsregression_electricity_load_nyiso_hud_valley_json_lag_1";
import m14 from "./crpsregression_electricity_load_nyiso_hud_valley_json_lag_12";
import m15 from "./crpsregression_electricity_load_nyiso_hud_valley_json_lag_3";
import m16 from "./crpsregression_electricity_load_nyiso_longil_json_lag_1";
import m17 from "./crpsregression_electricity_load_nyiso_longil_json_lag_12";
import m18 from "./crpsregression_electricity_load_nyiso_longil_json_lag_3";
import m19 from "./crpsregression_electricity_load_nyiso_mhk_valley_json_lag_1";
import m20 from "./crpsregression_electricity_load_nyiso_mhk_valley_json_lag_12";
import m21 from "./crpsregression_electricity_load_nyiso_mhk_valley_json_lag_3";
import m22 from "./crpsregression_electricity_load_nyiso_millwd_json_lag_1";
import m23 from "./crpsregression_electricity_load_nyiso_millwd_json_lag_12";
import m24 from "./crpsregression_electricity_load_nyiso_millwd_json_lag_3";
import m25 from "./crpsregression_electricity_load_nyiso_north_json_lag_1";
import m26 from "./crpsregression_electricity_load_nyiso_north_json_lag_12";
import m27 from "./crpsregression_electricity_load_nyiso_north_json_lag_3";
import m28 from "./crpsregression_electricity_load_nyiso_nyc_json_lag_1";
import m29 from "./crpsregression_electricity_load_nyiso_nyc_json_lag_12";
import m30 from "./crpsregression_electricity_load_nyiso_nyc_json_lag_3";
import m31 from "./crpsregression_electricity_load_nyiso_overall_json_lag_1";
import m32 from "./crpsregression_electricity_load_nyiso_overall_json_lag_12";
import m33 from "./crpsregression_electricity_load_nyiso_overall_json_lag_3";
import m34 from "./crpsregression_electricity_load_nyiso_west_json_lag_1";
import m35 from "./crpsregression_electricity_load_nyiso_west_json_lag_12";
import m36 from "./crpsregression_electricity_load_nyiso_west_json_lag_3";

import { ModelParent, WeatherData } from "./model-parent";
import * as qs from 'querystring';
const bent = require('bent');
const getJSON = bent('json');

export const available_models: Array<{ stream_name: string, lag_interval: number }> = [];

const model_lookups: { [key: string]: ModelParent } = {};
for (const i of [
  m1,
  m2,
  m3,
  m4,
  m5,
  m6,
  m7,
  m8,
  m9,
  m10,
  m11,
  m12,
  m13,
  m14,
  m15,
  m16,
  m17,
  m18,
  m19,
  m20,
  m21,
  m22,
  m23,
  m24,
  m25,
  m26,
  m27,
  m28,
  m29,
  m30,
  m31,
  m32,
  m33,
  m34,
  m35,
  m36,
]) {
  model_lookups[i.stream_name + "|" + i.lag_interval] = new i.model();
  available_models.push({ stream_name: i.stream_name, lag_interval: i.lag_interval });
}

export async function getWeatherForModels(models: Array<ModelParent>,
  time: string): Promise<WeatherData> {

  const h3_indexes = new Set<string>();
  const weather_products = new Set<string>();
  for (const model of models) {
    model.weather_h3_indexes().forEach(i => h3_indexes.add(i));
    model.weather_forecast_products().forEach(i => weather_products.add(i));
  }

  const url_parameters = qs.encode({
    time: time,
    products: Array.from(weather_products).join(","),
    h3_indexes: Array.from(h3_indexes).join(","),
  });

  const weather_data = await getJSON(`https://api.ionized.cloud/weather?` + url_parameters);

  return weather_data;
}

export function getModel(
  stream_name: string,
  lag_interval: number
): ModelParent {
  const lookup_key = `${stream_name}|${lag_interval}`;
  const m = model_lookups[lookup_key];
  if (m == null) {
    throw new Error(`Unknown stream name and lag interval`);
  }
  return m;
}
