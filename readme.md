# NYISO Electricity Models using Tensorflow.js

This module is a collection of Tensorflow.js models that I've created
in [Julia](https://julialang.org/) using [Flux](https://fluxml.ai/Flux.jl/stable/) but have exported to [Tensorflow.js](https://www.tensorflow.org/js) so that they
can be used in browsers and via AWS Lambda functions.

The models included are:

- Electricity demand for each NYISO zone.
- Wind power generation (coming soon)
- Solar power generation (coming soon)

The models make forecasts at the ~1 minute, 5 minutes, 15 minutes
and 1 hour ahead of time horizons. Each model produces 225 guesses
about what the true value will be to form a probablity distribution.

## Microprediction.org Prediction Bot

A simple [Microprediction.org](http://microprediction.com) prediction
robot is included in [`src/bot/bot.ts`](https://github.com/rustyconover/nyiso-electricity-models/blob/master/src/bot/bot.ts) that submits the
predictions from the models as part of the electicity prediction competition.

## Examples

### Utilize a model to generate predictions.

This example shows how to use a model to generate predictions:

```js
import * as models from "@rustyconover/nyiso-electricity-models";
import moment from "moment";

async function exampleModelUsage() {
  // Load a model that predicts the overall electicity load/demand
  // for the entire state of New York an hour ahead.
  //
  // 12 forecast intervals ahead is an hour since each forecast
  // interval is five minutes.
  const model = models.getModel("electricity-load-nyiso-overall.json", 12);
  const target_time = moment.utc().format("YYYY-MM-DDTHH:mm:ss");

  // Obtain the regressors of the model.
  const regressors = await model.regressors(target_time, undefined);

  // Using the regressors retrieve the predictions.
  const predicted_values = await model.predict(regressors);

  // The 225 predicted values form a non-parameteric probablity distribution
  // which express the model's prediction of the electricity demand
  // an hour from the current time.

  console.log(predicted_values);
}

exampleModelUsage().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

## Model Data Sources

The models use data from these sources:

1. [High Resolution Rapid Refresh](https://rapidrefresh.noaa.gov/hrrr/) forecast products from NCEP/NOAA:

   - Temperature
   - Surface Pressure
   - 2 Meter Dewpoint Temperature
   - 2 Meter Relative Humidity
   - 10 Meter U/V Wind Components
   - Downward Short-Wave Radiation Flux
   - Visible Beam Downward Solar Flux
   - Visible Diffuse Downward Solar Flux
   - Total Cloud Cover
   - Low Cloud Cover
   - High Cloud Cover
   - Middle Cloud Cover

2. Existing electicity demand forecasts from NYISO.

The models where trained the [continuous ranked probablity score](https://www.lokad.com/continuous-ranked-probability-score) used as the loss metric.

All of the code necessary to generate features, perform feature selection
and train/test these models is [open source](https://github.com/rustyconover/microprediction-nyiso-electricity).

These models are released under the MIT license and will be updated
from time to time.

If you have feedback email [rusty@conover.me](mailto:rusty@conover.me).
