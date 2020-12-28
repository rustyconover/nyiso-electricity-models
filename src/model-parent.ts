export type ModelRegressors = { [name: string]: number };

export type WeatherData = {
  [product_name: string]: {
    [h3_index: string]: number
  }
};

export abstract class ModelParent {

  // Return the h3 indexes used by this model.
  abstract weather_h3_indexes(): string[];

  // Return the weather forecast products used by this model
  abstract weather_forecast_products(): string[];

  // Return the regressor inputs for a model at a particular time.
  abstract regressors(time: string, weather_data: WeatherData | undefined): Promise<ModelRegressors>;

  // Return the predictions for the model with the passed regressors.
  abstract predict(regressors: ModelRegressors): Promise<Float32Array>;
}
