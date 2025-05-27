'use client';

import React, { useState } from 'react';
import { WIZARD_CONFIG } from '../../lib/wizard-config';
import { generateApiKey } from '../../lib/setup-utils';

export default function ApiPage() {
  const [apiKey, setApiKey] = useState<string>('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('prediction');
  const [copiedTimeout, setCopiedTimeout] = useState<NodeJS.Timeout | null>(null);

  const generateNewApiKey = () => {
    const newKey = generateApiKey();
    setApiKey(newKey);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    if (copiedTimeout) clearTimeout(copiedTimeout);
    const button = document.getElementById('copyButton');
    if (button) {
      button.textContent = 'Copied!';
      setCopiedTimeout(setTimeout(() => {
        button.textContent = 'Copy';
      }, 2000));
    }
  };

  const endpoints = {
    prediction: {
      method: 'POST',
      url: '/api/predict',
      description: 'Generate predictions using your trained model',
      request: `{
  "modelId": "your-model-id",
  "input": "Your input text or data array",
  "maxTokens": 100,
  "temperature": 0.7
}`,
      response: `{
  "prediction": "Model's prediction or output",
  "confidence": 0.95,
  "processingTime": "0.123s"
}`
    },
    training: {
      method: 'POST',
      url: '/api/training',
      description: 'Add new training data to your model',
      request: `{
  "type": "ADD_TRAINING_DATA",
  "input": [/* your input data */],
  "output": [/* expected output */]
}`,
      response: `{
  "message": "Training data added successfully",
  "dataId": "unique-data-id"
}`
    },
    models: {
      method: 'GET',
      url: '/api/models',
      description: 'List all your trained models',
      request: 'No request body needed',
      response: `{
  "models": [
    {
      "id": "model-id",
      "name": "Model Name",
      "type": "NeuralNetwork",
      "status": "trained"
    }
  ]
}`
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="z-10 max-w-5xl w-full">
        <h1 className="text-4xl font-bold mb-8">SintrixAI API</h1>
        
        {/* API Key Section */}
        <div className="bg-white/20 p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-4">API Key Management</h2>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={apiKey}
              readOnly
              placeholder="Generate an API key to get started"
              className="flex-1 p-2 rounded bg-black/50 text-white font-mono"
            />
            <button
              onClick={() => generateNewApiKey()}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Generate Key
            </button>
            {apiKey && (
              <button
                id="copyButton"
                onClick={() => copyToClipboard(apiKey)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Copy
              </button>
            )}
          </div>
        </div>

        {/* API Documentation */}
        <div className="bg-white/20 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">API Documentation</h2>
          
          {/* Endpoint Selection */}
          <div className="flex space-x-2 mb-6">
            {Object.entries(endpoints).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setSelectedEndpoint(key)}
                className={`px-4 py-2 rounded ${
                  selectedEndpoint === key
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {value.method} {value.url}
              </button>
            ))}
          </div>

          {/* Selected Endpoint Details */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-2">Description</h3>
              <p>{endpoints[selectedEndpoint as keyof typeof endpoints].description}</p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2">Request</h3>
              <pre className="bg-black/50 p-4 rounded font-mono text-sm">
                {endpoints[selectedEndpoint as keyof typeof endpoints].request}
              </pre>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2">Response</h3>
              <pre className="bg-black/50 p-4 rounded font-mono text-sm">
                {endpoints[selectedEndpoint as keyof typeof endpoints].response}
              </pre>
            </div>
          </div>
        </div>

        {/* Rate Limits */}
        <div className="bg-white/20 p-6 rounded-lg shadow-lg mt-8">
          <h2 className="text-2xl font-bold mb-4">Rate Limits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(WIZARD_CONFIG.HOSTING_OPTIONS).map(([tier, details]) => (
              <div key={tier} className="p-4 bg-white/10 rounded">
                <h3 className="text-xl font-bold mb-2 capitalize">{tier}</h3>
                <ul className="space-y-2">
                  <li>Requests: {details.requests}</li>
                  <li>Latency: {details.latency}</li>
                  <li>Max Tokens: {details.maxTokens}</li>
                  <li className="font-bold text-green-400">{details.price}</li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
