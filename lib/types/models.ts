export type ModelProvider = 'openai' | 'anthropic' | 'google' | 'vertex' | 'xai' | 'togetherai';
export type ModelType = 'chat' | 'reasoning' | 'title' | 'artifact' | 'image';

export interface ModelConfig {
  provider: ModelProvider;
  modelName: string;
  version?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ModelRegistry {
  [key: string]: ModelConfig;
}

export interface EnvironmentConfig {
  defaultProvider: ModelProvider;
  models: ModelRegistry;
}
