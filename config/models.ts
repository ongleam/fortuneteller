export const modelConfig = {
  'chat-model': {
    provider: 'google',
    // model: 'gemini-2.5-flash',
    model: 'gemini-2.5-flash-lite-preview-06-17',
    temperature: 1.0,
    // maxTokens: 1024,
  },
  'slack-model': {
    provider: 'google',
    model: 'gemini-2.0-flash-lite',
    temperature: 0.0,
  },
};

export const DEFAULT_CHAT_MODEL = 'default-model';

export const chatModels: Array<any> = [
  {
    id: 'chat-model',
    name: '일반 모델',
    description: '일반적인 채팅 모델',
  },
  {
    id: 'chat-model-reasoning',
    name: '추론 모델',
    description: '좀 더 복잡한 문제를 풀때 유용한 모델',
  },
];
