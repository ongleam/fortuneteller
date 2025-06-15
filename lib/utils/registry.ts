import { customProvider, extractReasoningMiddleware, wrapLanguageModel } from 'ai';
import { vertex } from '@ai-sdk/google-vertex/edge';
import { google } from '@ai-sdk/google';
import { isTestEnvironment } from '../constants';
import { environments } from '../../config/environments';
import type { ModelConfig } from '../types/models';

const getModelProvider = (config: ModelConfig) => {
  const { provider, modelName } = config;

  switch (provider) {
    case 'vertex':
      return vertex(modelName);
    case 'google':
      return google(modelName);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
};

const createModelRegistry = (environment: string) => {
  const envConfig = environments[environment];
  const registry: any = {};

  Object.entries(envConfig.models).forEach(([key, config]) => {
    const model = getModelProvider(config);

    if (key.includes('reasoning')) {
      registry[key] = wrapLanguageModel({
        model,
        middleware: extractReasoningMiddleware({ tagName: 'think' }),
      });
    } else {
      registry[key] = model;
    }
  });

  return registry;
};

const currentEnvironment = isTestEnvironment ? 'test' : process.env.NODE_ENV || 'development';
const modelRegistry = createModelRegistry(currentEnvironment);

export const myProvider = customProvider({
  languageModels: modelRegistry,
});
