/*

  This is a prediction robot that utilizes all of the models
  in this package and submits their predictions to
  microprediction.org to accumulate credit.

  Copyright 2020 Rusty Conover <rusty@conover.me>

  You are free to use adapt this code as you wish.

  TODO:

  Future improvements would track performance of the prediction
  and not submit models that are performing poorly.

  Reduce calls to load the latest values on each prediction stream,
  across model lag_intervals.

*/
import * as models from "../";
import * as _ from "lodash";
import { MicroWriterConfig, MicroWriter } from 'microprediction';
import moment from "moment";
import { EventBridgeHandler } from "aws-lambda";

const write_key = process.env.MICROPREDICTION_WRITE_KEY;
if (write_key == null) {
    throw new Error("No MICROPREDICTON_WRITE_KEY defined in the envionment");
}

interface ScheduledEventDetails {
    "id": string,
    "detail-type": "Scheduled Event",
    "source": string,
    "account": string,
    "time": string,
    "region": string,
    "resources": string[],
    "detail": {}
}

type ScheduledEventHandler = EventBridgeHandler<"Scheduled Event", ScheduledEventDetails, string>;

export const handler: ScheduledEventHandler = async () => {
    const config = await MicroWriterConfig.create({
        write_key: write_key,
    });
    const writer = new MicroWriter(config);

    // Store all of the write promises so they can be
    // sent asynchronously.
    const writes: any[] = [];

    // Store the time of this model run.
    const now_utc = moment.utc();

    // Group all of the models by their forecast horizon or
    // lag_interval, a lag interval is a multiple of the stream
    // update time (in this case 5 minutes), so there are forecasts
    // for 5 minutes, 15 minutes and an hour in the future.
    const models_by_lag = _.groupBy(models.available_models, "lag_interval");

    for (const lag_interval of Object.keys(models_by_lag)) {
        // Get the actual time that the lag_interval corresponds to.
        // ideally, this would be five minutes from the last update
        // of the stream, but alas, its something for the reader to
        // improve on.
        const target_time = now_utc.add(parseInt(lag_interval, 10) * 5, 'minutes')
            .format("YYYY-MM-DDTHH:mm:ss");

        // Get the actual model instances.
        const models_for_lag = models_by_lag[lag_interval].map(record => models.getModel(record.stream_name, record.lag_interval));

        // Get all of the weather information in one API call
        // for the many models at the same target time.
        const weather = await models.getWeatherForModels(models_for_lag, target_time);

        // For each model now create the predictions using the
        // weather data.
        for (const record of models_by_lag[lag_interval]) {
            const model = models.getModel(record.stream_name, record.lag_interval);

            const regressors = await model.regressors(target_time, weather);

            // Some of the generation streams are integer based streams
            // so produce integer points.
            const needs_rounding = record.stream_name.match(/fueltype/);
            const points = (await model.predict(regressors)).map(v => {
                if (needs_rounding) {
                    return Math.round(v);
                } else {
                    return v;
                }
            })

            // Note in the log that the forecasting was successful.
            console.log(`Forecasted ${record.stream_name} ${lag_interval}`);

            // Microprediction.org functions on the aspect of delay horizons
            // map the model's forecast interval to the delay horizons expressed
            // in seconds.
            let delays: number[] = [];
            if (record.lag_interval === 1) {
                delays = [70, 310];
            } else if (record.lag_interval === 3) {
                delays = [910];
            } else if (record.lag_interval === 12) {
                delays = [3555];
            }
            delays.forEach(d => {
                writes.push(writer.submit(record.stream_name, Array.from(points), d))
            });
        }
    }

    // Wait for all predictions to have been sent.
    const write_results = await Promise.all(writes);

    for (const write_result of write_results) {

        // Ignore the typechecking here, a future version of the
        // microprediction client will have better typings.

        // @ts-ignore
        if (write_result.error != null) {
            // @ts-ignore
            console.error(`Failed to send prediction: ${write_result.error}`)
        }
    }
    return "Ok";
};
