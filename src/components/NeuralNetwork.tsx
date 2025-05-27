'use client';

import React, { useState, useEffect } from 'react';
import * as brain from 'brain.js';
import { API_CONFIG } from '../lib/config';
import { TrainingData, TrainingResult, NetworkPrediction, TrainingWorkerMessage } from '../lib/types';
import { fetchTrainingData, saveTrainingData, clearTrainingData, makePrediction } from '../lib/api';

// Web Worker for training to prevent UI blocking
const createTrainingWorker = (net: brain.NeuralNetwork, data: TrainingData[], options: TrainingWorkerMessage['options']): Promise<TrainingResult> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      URL.createObjectURL(
        new Blob([
          `
            importScripts('https://unpkg.com/brain.js@2.0.0-beta.23/dist/brain-browser.js');

            onmessage = function(e) {
              const { net, data, options } = e.data;
              const network = new brain.NeuralNetwork(net.options);
              network.weights = net.weights;
              network.biases = net.biases;
              
              const result = network.train(data, {
                ...options,
                callback: (stats) => {
                  postMessage({ type: 'progress', data: stats });
                }
              });
              
              postMessage({ type: 'complete', data: result });
            }
          `],
          { type: 'application/javascript' }
        )
      )
    );

    worker.onmessage = (e) => {
      if (e.data.type === 'progress') {
        console.log('Training progress:', e.data.data);
      } else if (e.data.type === 'complete') {
        resolve(e.data.data as TrainingResult);
        worker.terminate();
      }
    };

    worker.onerror = (e) => {
      reject(e.error);
      worker.terminate();
    };

    worker.postMessage({ net: net.toJSON(), data, options });
  });
};

interface TestPredictionProps {
  onPredict: (input: number[]) => Promise<number[]>;
  isNetworkTrained: boolean;
}

const TestPrediction: React.FC<TestPredictionProps> = ({ onPredict, isNetworkTrained }) => {
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState('');
  const [isPredicting, setIsPredicting] = useState(false);

  const handleTest = async () => {
    if (!isNetworkTrained) {
      alert('Please train the network first');
      return;
    }

    try {
      setIsPredicting(true);
      const input = JSON.parse(`[${testInput}]`);
      const prediction = await onPredict(input);
      setTestResult(`Prediction for [${testInput}]: [${prediction.map(n => n.toFixed(4))}]`);
    } catch (error) {
      setTestResult('Error making prediction. Please check input format.');
      console.error('Prediction error:', error);
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="bg-white/30 p-6 rounded-lg shadow mt-6">
      <h2 className="text-2xl font-bold mb-4">Test Prediction</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Test Input (comma-separated numbers):
          </label>
          <input
            type="text"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            className="w-full p-2 border rounded text-black"
            placeholder="0,1"
            disabled={!isNetworkTrained}
          />
        </div>
        <button
          onClick={handleTest}
          disabled={!isNetworkTrained || isPredicting}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isPredicting ? 'Predicting...' : 'Make Prediction'}
        </button>
        {testResult && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <pre className="whitespace-pre-wrap">{testResult}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default function NeuralNetwork() {
  const [trainingData, setTrainingData] = useState<TrainingData[]>([]);
  const [inputData, setInputData] = useState('');
  const [outputData, setOutputData] = useState('');
  const [isTraining, setIsTraining] = useState(false);
  const [autoTrain, setAutoTrain] = useState(false);
  const [network, setNetwork] = useState<brain.NeuralNetwork | null>(null);
  const [trainingProgress, setTrainingProgress] = useState('');
  const [prediction, setPrediction] = useState('');

  useEffect(() => {
    // Initialize network
    const net = new brain.NeuralNetwork({
      hiddenLayers: [8, 8]
    });
    setNetwork(net);
    loadTrainingData();
  }, []);

  const loadTrainingData = async () => {
    try {
      const data = await fetchTrainingData();
      setTrainingData(data);
    } catch (error) {
      console.error('Error loading training data:', error);
    }
  };

  const handleAddTrainingData = async () => {
    try {
      const input = JSON.parse(`[${inputData}]`);
      const output = JSON.parse(`[${outputData}]`);
      
      await saveTrainingData({ input, output });
      await loadTrainingData();
      
      setInputData('');
      setOutputData('');
    } catch (error) {
      alert('Please enter valid numbers separated by commas');
    }
  };

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to clear all training data?')) {
      return;
    }

    try {
      await clearTrainingData();
      setTrainingData([]);
      setPrediction('');
      setTrainingProgress('');
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('Failed to clear training data');
    }
  };

  const processBatch = async (batch: TrainingData[], net: brain.NeuralNetwork) => {
    const batchSize = API_CONFIG.BATCH_SIZE;
    const chunks: TrainingData[][] = [];
    
    for (let i = 0; i < batch.length; i += batchSize) {
      chunks.push(batch.slice(i, i + batchSize));
    }

    let totalError = 0;
    let iteration = 0;

    for (const chunk of chunks) {
      const result = await createTrainingWorker(net, chunk, {
        iterations: Math.min(1000, API_CONFIG.MAX_ITERATIONS / chunks.length),
        errorThresh: API_CONFIG.ERROR_THRESHOLD,
        log: true,
        logPeriod: 100,
        batchSize: chunk.length
      });

      totalError += result.error;
      iteration++;
      
      setTrainingProgress(
        `Processing batch ${iteration}/${chunks.length}\n` +
        `Current error: ${result.error.toFixed(6)}\n` +
        `Average error: ${(totalError / iteration).toFixed(6)}`
      );
    }

    return { error: totalError / chunks.length, iterations: iteration };
  };

  const handlePrediction = async (input: number[]): Promise<number[]> => {
    if (!network) {
      throw new Error('Network not initialized');
    }

    const result = await makePrediction(input, network.toJSON());
    return result.prediction;
  };

  const trainNetwork = async () => {
    if (!network || trainingData.length === 0) {
      alert('Please add training data first');
      return;
    }

    setIsTraining(true);
    
    try {
      const result = await processBatch(trainingData, network);

      // Save network state
      await api.saveModel(network.toJSON());

      // Test predictions with first few items
      const predictions = trainingData.slice(0, 3).map(data => {
        const predicted = network.run(data.input) as number[];
        return {
          input: data.input,
          expected: data.output,
          predicted
        };
      });

      setPrediction(
        `Network trained successfully!\n\n` +
        `Average Error: ${result.error.toFixed(6)}\n` +
        `Batches Processed: ${result.iterations}\n\n` +
        `Sample Predictions:\n` +
        predictions.map(p => 
          `Input: [${p.input}] → Expected: [${p.expected}] → Got: [${p.predicted.map(n => n.toFixed(4))}]`
        ).join('\n')
      );

      if (autoTrain) {
        setTimeout(() => trainNetwork(), 5000);
      }
    } catch (error) {
      console.error('Training error:', error);
      setPrediction('Error during training. Check console for details.');
    }

    setIsTraining(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/30 p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Add Training Data</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Input (comma-separated numbers):
            </label>
            <input
              type="text"
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              className="w-full p-2 border rounded text-black"
              placeholder="0,1"
              disabled={isTraining}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Expected Output (comma-separated numbers):
            </label>
            <input
              type="text"
              value={outputData}
              onChange={(e) => setOutputData(e.target.value)}
              className="w-full p-2 border rounded text-black"
              placeholder="1"
              disabled={isTraining}
            />
          </div>
          <button
            onClick={handleAddTrainingData}
            disabled={isTraining}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Add Data
          </button>
        </div>
      </div>

      <div className="bg-white/30 p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Training Data ({trainingData.length} items)</h2>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {trainingData.map((data, index) => (
            <div key={index} className="bg-gray-100 p-2 rounded">
              Input: [{data.input.join(', ')}] ➔ Output: [{data.output.join(', ')}]
            </div>
          ))}
        </div>
        {trainingData.length > 0 && (
          <div className="mt-4">
            <button
              onClick={handleClearData}
              disabled={isTraining}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              Clear All Data
            </button>
          </div>
        )}
      </div>

      <div className="bg-white/30 p-6 rounded-lg shadow">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => trainNetwork()}
            disabled={isTraining || trainingData.length === 0}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {isTraining ? 'Training...' : 'Train Network'}
          </button>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoTrain}
              onChange={(e) => setAutoTrain(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600"
              disabled={isTraining}
            />
            <span>Auto-train every 5 seconds</span>
          </label>
        </div>

        {trainingProgress && (
          <div className="mb-4 p-4 bg-blue-100 rounded">
            <pre className="whitespace-pre-wrap">{trainingProgress}</pre>
          </div>
        )}
        
        {prediction && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <pre className="whitespace-pre-wrap">{prediction}</pre>
          </div>
        )}
      </div>

      <TestPrediction 
        onPredict={handlePrediction}
        isNetworkTrained={network !== null && !isTraining}
      />

      <div className="bg-white/30 p-6 rounded-lg shadow mt-6">
        <h2 className="text-2xl font-bold mb-4">API Integration</h2>
        <p className="mb-4">Connected to: {API_CONFIG.BASE_URL}</p>
        <div className="space-y-2">
          <p>Batch Size: {API_CONFIG.BATCH_SIZE}</p>
          <p>Max Iterations: {API_CONFIG.MAX_ITERATIONS}</p>
          <p>Error Threshold: {API_CONFIG.ERROR_THRESHOLD}</p>
        </div>
      </div>
    </div>
  );
}
