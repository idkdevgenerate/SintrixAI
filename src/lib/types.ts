export interface TrainingResult {
  error: number;
  iterations: number;
}

export interface NetworkPrediction {
  input: number[];
  expected: number[];
  predicted: number[];
}

export interface TrainingWorkerMessage {
  net: any;
  data: TrainingData[];
  options: {
    iterations: number;
    errorThresh: number;
    log: boolean;
    logPeriod: number;
    batchSize: number;
  };
}
