'use client';

import React from 'react';
import { WIZARD_CONFIG } from '../lib/wizard-config';

export default function SetupPreview() {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-6">Setup Wizard Preview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pre-trained Models */}
        <div className="bg-white/20 p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Pre-trained Models</h3>
          <div className="space-y-4">
            {WIZARD_CONFIG.PRETRAINED_MODELS.map((model) => (
              <div key={model.id} className="p-4 bg-white/10 rounded">
                <h4 className="font-bold">{model.name}</h4>
                <p className="text-sm text-gray-300">{model.description}</p>
                <div className="mt-2 text-sm">
                  <span className="bg-blue-500/20 px-2 py-1 rounded mr-2">
                    {model.trainingTime}
                  </span>
                  <span className="bg-purple-500/20 px-2 py-1 rounded">
                    {model.parameters} params
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Setup Process */}
        <div className="bg-white/20 p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Setup Process</h3>
          <div className="relative">
            {WIZARD_CONFIG.SETUP_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-start mb-6">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  {index + 1}
                </div>
                <div className="ml-4">
                  <h4 className="font-bold">{step.title}</h4>
                  <p className="text-sm text-gray-300">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* API Integration */}
        <div className="bg-white/20 p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">API Integration</h3>
          <div className="space-y-4">
            {WIZARD_CONFIG.API_TEMPLATES.slice(0, 2).map((template) => (
              <div key={template.id} className="p-4 bg-white/10 rounded">
                <h4 className="font-bold">{template.name}</h4>
                <pre className="mt-2 text-xs bg-black/50 p-2 rounded overflow-x-auto">
                  {template.example}
                </pre>
              </div>
            ))}
          </div>
        </div>

        {/* Hosting Options */}
        <div className="bg-white/20 p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Hosting Options</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(WIZARD_CONFIG.HOSTING_OPTIONS).map(([type, details]) => (
              <div key={type} className="p-4 bg-white/10 rounded">
                <h4 className="font-bold capitalize">{type}</h4>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• {details.requests} requests</li>
                  <li>• {details.latency} latency</li>
                  <li>• {details.maxTokens} max tokens</li>
                  <li className="font-bold text-green-400">{details.price}</li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
