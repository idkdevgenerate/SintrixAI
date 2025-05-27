'use client';

import React, { useState } from 'react';
import { WIZARD_CONFIG } from '../lib/wizard-config';

interface ModelTrainingConfig {
  modelId: string;
  hostingType: 'free' | 'pro';
  isCustom: boolean;
}

export default function ModelSelector() {
  const [selectedModel, setSelectedModel] = useState<ModelTrainingConfig | null>(null);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isTraining, setIsTraining] = useState(false);

  const startTraining = async () => {
    if (!selectedModel) return;
    
    setShowTerminal(true);
    setIsTraining(true);
    setTerminalOutput([]);

    // Simulate terminal output
    const addOutput = (text: string, delay: number = 500) => {
      return new Promise<void>(resolve => {
        setTimeout(() => {
          setTerminalOutput(prev => [...prev, text]);
          resolve();
        }, delay);
      });
    };

    try {
      await addOutput('> Initializing SintrixAI Training Environment...');
      await addOutput('> Connecting to cloud infrastructure...');
      
      if (selectedModel.isCustom) {
        await addOutput('> Preparing custom model architecture...');
      } else {
        // Check if it's a brain.js model
        const brainJsModel = WIZARD_CONFIG.BRAINJS_MODELS.find(m => m.id === selectedModel.modelId);
        if (brainJsModel) {
          await addOutput(`> Loading Brain.js model: ${brainJsModel.name}`);
          await addOutput('> Initializing neural network configuration...');
          await addOutput(`> Network type: ${brainJsModel.type}`);
          await addOutput(`> Hidden layers: [${brainJsModel.config.hiddenLayers.join(', ')}]`);
          await addOutput(`> Activation function: ${brainJsModel.config.activation || 'default'}`);
          await addOutput('> Loading pre-trained weights...');
        } else {
          const model = WIZARD_CONFIG.PRETRAINED_MODELS.find(m => m.id === selectedModel.modelId);
          await addOutput(`> Loading pre-trained model: ${model?.name}`);
        }
      }

      await addOutput(`> Selected hosting tier: ${selectedModel.hostingType.toUpperCase()}`);
      await addOutput('> Configuring training parameters...');
      await addOutput('> Starting training process...');
      
      // Add more detailed output based on the model
      for (let i = 0; i < 3; i++) {
        await addOutput(`> Training epoch ${i + 1}/3 - Loss: ${(0.1 / (i + 1)).toFixed(4)}`);
      }

      await addOutput('> Optimizing model weights...');
      await addOutput('> Validating model performance...');
      await addOutput('✓ Training completed successfully!');
      await addOutput('> Deploying to cloud infrastructure...');
      await addOutput('✓ Model deployed and ready for use!');
      
      // Add API information
      await addOutput('\n> Your API endpoint is ready:');
      await addOutput('  https://api.sintrixai.com/v1/generate');
      await addOutput('\n> Example usage:');
      await addOutput(`  POST /v1/generate
  {
    "prompt": "Your input here",
    "model": "${selectedModel.modelId}",
    "max_tokens": 100
  }`);
    } catch (error) {
      await addOutput('× Error during training. Please try again.');
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="space-y-6">
      {!showTerminal ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-white/20 p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4">Pre-trained Models</h2>
                <div className="space-y-4">
                  {WIZARD_CONFIG.PRETRAINED_MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModel({
                        modelId: model.id,
                        hostingType: 'free',
                        isCustom: false
                      })}
                      className={`w-full p-4 rounded transition-all ${
                        selectedModel?.modelId === model.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      <h3 className="font-bold">{model.name}</h3>
                      <p className="text-sm">{model.description}</p>
                      <div className="mt-2 text-xs">
                        <span className="bg-blue-500/20 px-2 py-1 rounded mr-2">
                          Training: {model.trainingTime}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white/20 p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4">Brain.js Models</h2>
                <div className="space-y-4">
                  {WIZARD_CONFIG.BRAINJS_MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModel({
                        modelId: model.id,
                        hostingType: 'free',
                        isCustom: false
                      })}
                      className={`w-full p-4 rounded transition-all ${
                        selectedModel?.modelId === model.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      <h3 className="font-bold">{model.name}</h3>
                      <p className="text-sm">{model.description}</p>
                      <div className="mt-2 text-xs">
                        <span className="bg-purple-500/20 px-2 py-1 rounded mr-2">
                          Type: {model.type}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white/20 p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4">Custom Model</h2>
                <button
                  onClick={() => setSelectedModel({
                    modelId: 'custom',
                    hostingType: 'free',
                    isCustom: true
                  })}
                  className={`w-full p-4 rounded transition-all ${
                    selectedModel?.isCustom
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <h3 className="font-bold">Create Custom Model</h3>
                  <p className="text-sm">Design and train your own AI model</p>
                </button>
              </div>

              <div className="bg-white/20 p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4">Hosting Options</h2>
                <div className="space-y-4">
                  {Object.entries(WIZARD_CONFIG.HOSTING_OPTIONS).map(([type, details]) => (
                    <button
                      key={type}
                      onClick={() => setSelectedModel(prev => 
                        prev ? { ...prev, hostingType: type as 'free' | 'pro' } : null
                      )}
                      disabled={!selectedModel}
                      className={`w-full p-4 rounded transition-all ${
                        selectedModel?.hostingType === type
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 hover:bg-white/20'
                      } disabled:opacity-50`}
                    >
                      <h3 className="font-bold capitalize">{type}</h3>
                      <p className="text-sm">{details.requests} • {details.latency}</p>
                      <p className="font-bold text-green-400">{details.price}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={startTraining}
              disabled={!selectedModel}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-200 ease-in-out transform hover:scale-105 disabled:opacity-50"
            >
              Start Training
            </button>
          </div>
        </>
      ) : (
        <div className="bg-black/90 p-6 rounded-lg shadow-lg font-mono">
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            {!isTraining && (
              <button
                onClick={() => setShowTerminal(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            )}
          </div>
          <div className="overflow-auto max-h-96 text-green-400 text-sm">
            {terminalOutput.map((line, i) => (
              <pre key={i} className="mb-1">{line}</pre>
            ))}
            {isTraining && (
              <span className="inline-block animate-pulse">▋</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
