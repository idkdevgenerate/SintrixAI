export const WIZARD_CONFIG = {
  PRETRAINED_MODELS: [
    {
      id: 'gpt-sintrix',
      name: 'GPT SintrixAI',
      description: 'General-purpose language model for text generation and conversation',
      trainingTime: '3-5 seconds',
      parameters: '125M',
      useCase: 'Chatbots, Content Generation, Q&A'
    },
    {
      id: 'sintrix-coder',
      name: 'SintrixCoder',
      description: 'Code generation and completion model',
      trainingTime: '4-6 seconds',
      parameters: '80M',
      useCase: 'Code Generation, Documentation, Bug Fixing'
    },
    {
      id: 'sintrix-vision',
      name: 'SintrixVision',
      description: 'Image recognition and processing model',
      trainingTime: '4-7 seconds',
      parameters: '100M',
      useCase: 'Image Analysis, Object Detection, Visual Search'
    }
  ],

  BRAINJS_MODELS: [
    {
      id: 'xor-model',
      name: 'XOR Neural Network',
      description: 'Pre-trained model for XOR operations (logical exclusive OR)',
      type: 'NeuralNetwork',
      config: {
        hiddenLayers: [3],
        activation: 'sigmoid'
      },
      trainingData: [
        { input: [0, 0], output: [0] },
        { input: [0, 1], output: [1] },
        { input: [1, 0], output: [1] },
        { input: [1, 1], output: [0] }
      ]
    },
    {
      id: 'number-predictor',
      name: 'Number Sequence Predictor',
      description: 'Predicts the next number in a sequence',
      type: 'NeuralNetwork',
      config: {
        hiddenLayers: [4, 4],
        activation: 'relu'
      },
      trainingData: [
        { input: [1, 2], output: [3] },
        { input: [2, 3], output: [4] },
        { input: [3, 4], output: [5] },
        { input: [4, 5], output: [6] }
      ]
    },
    {
      id: 'color-classifier',
      name: 'Color Classifier',
      description: 'Classifies RGB colors into basic color names',
      type: 'NeuralNetwork',
      config: {
        hiddenLayers: [5],
        activation: 'sigmoid'
      },
      trainingData: [
        { input: [1, 0, 0], output: [1, 0, 0, 0] }, // Red
        { input: [0, 1, 0], output: [0, 1, 0, 0] }, // Green
        { input: [0, 0, 1], output: [0, 0, 1, 0] }, // Blue
        { input: [1, 1, 0], output: [0, 0, 0, 1] }  // Yellow
      ]
    },
    {
      id: 'sentiment-analyzer',
      name: 'Simple Sentiment Analyzer',
      description: 'Analyzes text sentiment (positive/negative)',
      type: 'RNNTimeStep',
      config: {
        inputSize: 2,
        hiddenLayers: [4],
        outputSize: 1
      },
      trainingData: [
        { input: [[1, 0], [0, 1]], output: [[1]] }, // Positive
        { input: [[0, 1], [1, 0]], output: [[0]] }  // Negative
      ]
    }
  ],
  
  SETUP_STEPS: [
    {
      id: 'welcome',
      title: 'Welcome to SintrixAI',
      description: 'Let\'s set up your personal AI environment'
    },
    {
      id: 'model-selection',
      title: 'Choose Your Base Model',
      description: 'Select a pre-trained model to start with'
    },
    {
      id: 'customization',
      title: 'Customize Your AI',
      description: 'Configure model parameters and behavior'
    },
    {
      id: 'api-setup',
      title: 'API Configuration',
      description: 'Set up your free API endpoint'
    },
    {
      id: 'training',
      title: 'Quick Training',
      description: 'Fine-tune your model (3-5 seconds)'
    },
    {
      id: 'deployment',
      title: 'Deployment',
      description: 'Deploy your AI to the cloud'
    }
  ],

  API_TEMPLATES: [
    {
      id: 'rest-api',
      name: 'REST API',
      example: `fetch('https://api.sintrixai.com/v1/generate', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' },
  body: JSON.stringify({ prompt: 'Your input here' })
})`
    },
    {
      id: 'python-sdk',
      name: 'Python SDK',
      example: `import sintrixai

ai = sintrixai.Client('YOUR_API_KEY')
response = ai.generate('Your input here')`
    },
    {
      id: 'node-sdk',
      name: 'Node.js SDK',
      example: `const sintrixai = require('sintrixai');

const ai = new sintrixai.Client('YOUR_API_KEY');
const response = await ai.generate('Your input here');`
    }
  ],

  HOSTING_OPTIONS: {
    free: {
      requests: '1000/day',
      latency: '~500ms',
      maxTokens: 1000,
      price: 'Free'
    },
    pro: {
      requests: 'Unlimited',
      latency: '~100ms',
      maxTokens: 4000,
      price: '$10/month'
    }
  }
};
