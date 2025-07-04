import { google } from '@ai-sdk/google';
import { modelConfig } from '@/config/models';
import { customProvider, extractReasoningMiddleware, wrapLanguageModel } from 'ai';

const getModelProvider = (config: any) => {
  const { provider, model } = config;

  switch (provider) {
    case 'google':
      return google(model, { maxTokens: 1000 });
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
};

const createModelRegistry = () => {
  const registry: any = {};

  Object.entries(modelConfig).forEach(([key, config]) => {
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

const modelRegistry = createModelRegistry();
// console.log(JSON.stringify(modelRegistry, null, 2));

export const myProvider = customProvider({
  languageModels: modelRegistry,
});
