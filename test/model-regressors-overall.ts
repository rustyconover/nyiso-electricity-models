import * as models from "../src";
import moment from "moment";
import { ModelRegressors } from "../src/model-parent";

// Test that the regressors match the value generated from julia's
// regressors for a fixed point in time.

async function simpleTest() {
    const model = models.getModel("electricity-load-nyiso-overall.json", 1);
    const target_time = moment.utc("2020-12-29T03:00:00").format("YYYY-MM-DDTHH:mm:ss");
    console.log(target_time);

    const weather = await models.getWeatherForModels([model], target_time);
    const stream_data = await models.getStreamValuesForModels([model], target_time);

    const regressors = await model.regressors(target_time, weather, stream_data);

    const julia_regressors: ModelRegressors = { "hrrr_temperature_0_albany": 274.1836242675781, "hrrr_temperature_0_plattsburgth": 272.5703430175781, "hrrr_temperature_0_jfk": 277.353763156467, "hrrr_temperature_0_staten_island": 277.82685343424475, "hrrr_temperature_0_binghampton": 272.65758260091144, "hrrr_temperature_0_schenectady": 273.7331034342448, "hrrr_temperature_0_newburgh": 276.0221659342448, "hrrr_temperature_0_white_plains": 277.76825968424475, "hrrr_temperature_0_rome": 272.8984680175781, "sin_2016": 0.11196447610330686, "hrrr_temperature_0_islip": 276.2682596842448, "hrrr_temperature_0_buffalo": 269.95272148980035, "sin_288": 0.7071067811865325, "hrrr_temperature_0_elmira": 272.26305135091144, "cos_2016": 0.9937122098932427, "hrrr_temperature_0_poughkeepsie": 276.6801520453559, "hrrr_temperature_0_jamestown": 268.15367635091144, "hrrr_temperature_0_lga": 279.09942287868927, "hrrr_temperature_0_watertown": 271.4961242675781, "hrrr_temperature_0_syracuse": 272.20393676757817, "hrrr_temperature_0_fredonia": 270.6987284342448, "hrrr_temperature_0_nyc": 278.6432596842448, "hrrr_temperature_0_rochester": 272.2708638509115, "nyiso-overall": 16781.916666666668, "hrrr_temperature_0_canandaigua": 271.7903951009115, "hrrr_temperature_0_monticello": 273.6732076009115, "hrrr_temperature_0_utica": 272.34039510091145, "Demand_lag": 17754.3232, "hrrr_temperature_0_massena": 272.6458638509115, "cos_288": 0.7071067811865626 };

    for (const name of Object.keys(julia_regressors)) {
        console.log("name:" + name + " diff: " + (julia_regressors[name] - regressors[name]) + " julia: " + julia_regressors[name] + " js: " + regressors[name]);
    }
}

simpleTest().catch(e => {
    console.error(e)
    process.exit(1);
});
