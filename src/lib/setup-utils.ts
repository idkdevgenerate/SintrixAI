import { WIZARD_CONFIG } from './wizard-config';

export interface SetupConfig {
  modelId: string;
  apiKey?: string;
  customization: {
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
  };
  hosting: {
    type: 'free' | 'pro';
    region: string;
    customDomain?: string;
  };
  training: {
    epochs: number;
    batchSize: number;
    learningRate: number;
  };
}

export const DEFAULT_SETUP_CONFIG: SetupConfig = {
  modelId: 'gpt-sintrix',
  customization: {
    temperature: 0.7,
    maxTokens: 1000,
    topP: 0.9,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0
  },
  hosting: {
    type: 'free',
    region: 'auto'
  },
  training: {
    epochs: 1,
    batchSize: 32,
    learningRate: 0.0001
  }
};

export const buildExecutable = async (config: SetupConfig): Promise<Buffer> => {
  // This function would be implemented in the actual desktop app
  // to create the executable with the specified configuration
  throw new Error('This function should be implemented in the desktop app');
};

export const validateConfig = (config: SetupConfig): string[] => {
  const errors: string[] = [];
  
  if (!WIZARD_CONFIG.PRETRAINED_MODELS.find(m => m.id === config.modelId)) {
    errors.push('Invalid model selected');
  }

  if (config.customization.temperature < 0 || config.customization.temperature > 1) {
    errors.push('Temperature must be between 0 and 1');
  }

  if (config.customization.maxTokens < 1 || config.customization.maxTokens > 4000) {
    errors.push('Max tokens must be between 1 and 4000');
  }

  return errors;
};

export const estimateSetupTime = (config: SetupConfig): number => {
  const model = WIZARD_CONFIG.PRETRAINED_MODELS.find(m => m.id === config.modelId);
  if (!model) return 0;
  
  // Extract the lower bound of training time (e.g., "3-5 seconds" -> 3)
  const baseTrainingTime = parseInt(model.trainingTime.split('-')[0]);
  
  // Add additional time for customization and deployment
  return baseTrainingTime + 2; // 2 seconds for setup and deployment
};

export const generateApiKey = (): string => {
  // Generate a secure API key
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const length = 32;
  return 'sk_' + Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join('');
};
