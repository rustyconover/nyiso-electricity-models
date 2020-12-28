export type ModelRegressors = { [name: string]: number };

export abstract class ModelParent {
  // Return the regressor inputs for a model at a particular time.
  abstract regressors(time: string): Promise<ModelRegressors>;

  // Return the predictions for the model with the passed regressors.
  abstract predict(regressors: ModelRegressors): Promise<Float32Array>;
}
