import * as models from "../src";
import moment from "moment";

async function simpleTest() {
    const model = models.getModel("electricity-load-nyiso-overall.json", 12);
    const target_time = moment.utc().format("YYYY-MM-DDTHH:mm:ss");
    console.log(target_time);
    const weather = await models.getWeatherForModels([model], target_time);
    const stream_data = await models.getStreamValuesForModels([model], target_time);
    const regressors = await model.regressors(target_time, weather, stream_data);
    const points = await model.predict(regressors);
    console.log(points);
}

simpleTest().catch(e => {
    console.error(e)
    process.exit(1);
});


