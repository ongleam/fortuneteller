/**
 * Supabase 쿼리 함수들 테스트
 */

import {
  getProfileByUserId,
  createProfile,
  saveChat,
  deleteChatById,
  getChatsByUserId,
  getChatById,
  updateChatVisiblityById,
  saveMessages,
  getMessagesByChatId,
  voteMessage,
  getVotesByChatId,
  getMessageById,
  deleteMessagesByChatIdAfterTimestamp,
  getMessageCountByUserId,
  updateProfile,
} from '@/lib/infrastructure/supabase/queries';
import { createClient } from '@/lib/infrastructure/supabase/client';

// 모킹 설정
jest.mock('@/lib/infrastructure/supabase/client', () => {
  const createChainableMock = () => {
    const mock: Record<string, jest.Mock> = {
      from: jest.fn(() => mock),
      select: jest.fn(() => mock),
      insert: jest.fn(() => mock),
      update: jest.fn(() => mock),
      delete: jest.fn(() => mock),
      eq: jest.fn(() => mock),
      gt: jest.fn(() => mock),
      gte: jest.fn(() => mock),
      lt: jest.fn(() => mock),
      ilike: jest.fn(() => mock),
      in: jest.fn(() => mock),
      order: jest.fn(() => mock),
      limit: jest.fn(() => mock),
      single: jest.fn(() => mock),
      maybeSingle: jest.fn(() => mock),
      rpc: jest.fn(() => mock),
    };
    return mock;
  };

  return {
    createClient: jest.fn(() => createChainableMock()),
  };
});

describe('Supabase Queries', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = createClient();
    jest.clearAllMocks();
  });

  describe('Profile 관련 쿼리', () => {
    test('getProfileByUserId - 프로필 조회', async () => {
      const mockProfile = {
        user_id: 'test-user-id',
        name: '테스트 사용자',
        email: 'test@example.com'
      };

      mockClient.single.mockResolvedValue({
        data: mockProfile,
        error: null
      });

      const result = await getProfileByUserId('test-user-id');

      expect(mockClient.from).toHaveBeenCalledWith('profiles');
      expect(mockClient.select).toHaveBeenCalled();
      expect(mockClient.eq).toHaveBeenCalledWith('user_id', 'test-user-id');
      expect(result).toEqual(mockProfile);
    });

    test('createProfile - 프로필 생성', async () => {
      const newProfile = {
        user_id: 'new-user-id',
        name: '새 사용자',
        email: 'new@example.com'
      };

      mockClient.select.mockResolvedValue({
        data: [newProfile],
        error: null
      });

      const result = await createProfile(newProfile);

      expect(mockClient.from).toHaveBeenCalledWith('profiles');
      expect(mockClient.insert).toHaveBeenCalledWith(newProfile);
      expect(result).toEqual([newProfile]);
    });

    test('updateProfile - 프로필 업데이트', async () => {
      const updateData = {
        name: '업데이트된 이름',
        birth_year: 1990
      };

      mockClient.select.mockResolvedValue({
        data: [{ user_id: 'test-user', ...updateData }],
        error: null
      });

      const result = await updateProfile('test-user', updateData);

      expect(mockClient.from).toHaveBeenCalledWith('profiles');
      expect(mockClient.update).toHaveBeenCalledWith(updateData);
      expect(mockClient.eq).toHaveBeenCalledWith('user_id', 'test-user');
    });
  });

  describe('Chat 관련 쿼리', () => {
    test('saveChat - 채팅 저장', async () => {
      const chatData = {
        user_id: 'test-user',
        title: '테스트 채팅',
        channel: 'web'
      };

      mockClient.select.mockResolvedValue({
        data: [{ id: 'chat-id', ...chatData }],
        error: null
      });

      const result = await saveChat(chatData);

      expect(mockClient.from).toHaveBeenCalledWith('chats');
      expect(mockClient.insert).toHaveBeenCalledWith(chatData);
      expect(result).toEqual([{ id: 'chat-id', ...chatData }]);
    });

    test('getChatsByUserId - 사용자별 채팅 조회', async () => {
      const mockChats = [
        { id: 'chat1', title: '채팅 1' },
        { id: 'chat2', title: '채팅 2' }
      ];

      mockClient.order.mockResolvedValue({
        data: mockChats,
        error: null
      });

      const result = await getChatsByUserId('test-user');

      expect(mockClient.from).toHaveBeenCalledWith('chats');
      expect(mockClient.select).toHaveBeenCalled();
      expect(mockClient.eq).toHaveBeenCalledWith('user_id', 'test-user');
      expect(mockClient.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(mockChats);
    });

    test('deleteChatById - 채팅 삭제', async () => {
      mockClient.eq.mockResolvedValue({
        data: null,
        error: null
      });

      await deleteChatById('chat-id');

      expect(mockClient.from).toHaveBeenCalledWith('chats');
      expect(mockClient.delete).toHaveBeenCalled();
      expect(mockClient.eq).toHaveBeenCalledWith('id', 'chat-id');
    });
  });

  describe('Message 관련 쿼리', () => {
    test('saveMessages - 메시지 저장', async () => {
      const messages = [
        {
          chat_id: 'chat-id',
          role: 'user',
          parts: [{ type: 'text', text: '테스트 메시지' }],
          attachments: []
        }
      ];

      mockClient.select.mockResolvedValue({
        data: messages,
        error: null
      });

      const result = await saveMessages({ messages });

      expect(mockClient.from).toHaveBeenCalledWith('messages');
      expect(mockClient.insert).toHaveBeenCalledWith(messages);
      expect(result).toEqual(messages);
    });

    test('getMessagesByChatId - 채팅별 메시지 조회', async () => {
      const mockMessages = [
        { id: 'msg1', content: '메시지 1' },
        { id: 'msg2', content: '메시지 2' }
      ];

      mockClient.limit.mockResolvedValue({
        data: mockMessages,
        error: null
      });

      const result = await getMessagesByChatId({ id: 'chat-id', limit: 10 });

      expect(mockClient.from).toHaveBeenCalledWith('messages');
      expect(mockClient.select).toHaveBeenCalled();
      expect(mockClient.eq).toHaveBeenCalledWith('chat_id', 'chat-id');
      expect(mockClient.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(mockClient.limit).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockMessages);
    });
  });

  describe('Vote 관련 쿼리', () => {
    test('voteMessage - 메시지 투표', async () => {
      const voteData = {
        message_id: 'msg-id',
        is_upvoted: true
      };

      mockClient.select.mockResolvedValue({
        data: [voteData],
        error: null
      });

      const result = await voteMessage(voteData);

      expect(mockClient.from).toHaveBeenCalledWith('votes');
      expect(mockClient.insert).toHaveBeenCalledWith(voteData);
      expect(result).toEqual([voteData]);
    });

    test('getVotesByChatId - 채팅별 투표 조회', async () => {
      const mockVotes = [
        { message_id: 'msg1', is_upvoted: true },
        { message_id: 'msg2', is_upvoted: false }
      ];

      mockClient.eq.mockResolvedValue({
        data: mockVotes,
        error: null
      });

      const result = await getVotesByChatId('chat-id');

      expect(mockClient.from).toHaveBeenCalledWith('votes');
      expect(mockClient.select).toHaveBeenCalled();
      expect(mockClient.eq).toHaveBeenCalledWith('chat_id', 'chat-id');
      expect(result).toEqual(mockVotes);
    });
  });

  describe('에러 처리', () => {
    test('쿼리 에러 시 예외 발생', async () => {
      const mockError = new Error('Database connection failed');
      
      mockClient.single.mockResolvedValue({
        data: null,
        error: mockError
      });

      await expect(getProfileByUserId('invalid-id')).rejects.toThrow();
    });
  });
});