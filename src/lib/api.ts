import { API_CONFIG } from './config';

export interface TrainingData {
  input: number[];
  output: number[];
}

export async function fetchTrainingData(): Promise<TrainingData[]> {
  try {
    const response = await fetch('/api/training');
    if (!response.ok) {
      throw new Error('Failed to fetch training data');
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching training data:', error);
    return [];
  }
}

export async function saveTrainingData(data: TrainingData) {
  try {
    const response = await fetch('/api/training', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'ADD_TRAINING_DATA',
        ...data
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to save training data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error saving training data:', error);
    throw error;
  }
}

export async function saveModel(model: any) {
  try {
    const response = await fetch('/api/training', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'SAVE_MODEL',
        model
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to save model');
    }
    return await response.json();
  } catch (error) {
    console.error('Error saving model:', error);
    throw error;
  }
}

export async function clearTrainingData() {
  try {
    const response = await fetch('/api/training', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'CLEAR_DATA' }),
    });
    if (!response.ok) {
      throw new Error('Failed to clear training data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error clearing training data:', error);
    throw error;
  }
}

export async function makePrediction(input: number[], modelState: any) {
  try {
    const response = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, modelState }),
    });
    if (!response.ok) {
      throw new Error('Failed to make prediction');
    }
    return await response.json();
  } catch (error) {
    console.error('Error making prediction:', error);
    throw error;
  }
}
