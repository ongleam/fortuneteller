export const DEFAULT_CHAT_MODEL: string = 'chat-model';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
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
