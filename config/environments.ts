import { EnvironmentConfig, ModelConfig } from '../lib/types/models';

export const baseModels: { [key: string]: ModelConfig } = {
  'chat-model': {
    provider: 'google',
    // modelName: 'gemini-2.5-pro-preview-03-25',
    modelName: 'gemini-2.0-flash-lite',
    temperature: 0.0,
    // maxTokens: 2048,
  },
  'kakao-chat-model': {
    provider: 'google',
    modelName: 'gemini-2.0-flash-lite',
    temperature: 0.0,
    // maxTokens: 2048,
  },

  'chat-model-reasoning': {
    provider: 'vertex',
    modelName: 'gemini-2.0-flash-lite',
    // maxTokens: 2048,
    // temperature: 0.7,
  },
  'title-model': {
    provider: 'vertex',
    modelName: 'gemini-2.0-flash-lite',
    // maxTokens: 512,
    // temperature: 0.3,
  },
  'artifact-model': {
    provider: 'vertex',
    modelName: 'gemini-2.0-flash-lite',
    // maxTokens: 1024,
    // temperature: 0.5,
  },
};

export const environments: { [key: string]: EnvironmentConfig } = {
  development: {
    defaultProvider: 'vertex',
    models: {
      ...baseModels,
      'image-model': {
        provider: 'vertex',
        modelName: 'gemini-1.5-flash',
        // maxTokens: 1024,
      },
    },
  },
  production: {
    defaultProvider: 'vertex',
    models: {
      ...baseModels,
      'image-model': {
        provider: 'vertex',
        modelName: 'gemini-1.5-pro',
        // maxTokens: 2048,
      },
    },
  },
  test: {
    defaultProvider: 'vertex',
    models: {
      ...baseModels,
      'image-model': {
        provider: 'vertex',
        modelName: 'gemini-1.5-flash',
        // maxTokens: 1024,
      },
    },
  },
};
