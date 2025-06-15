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
  getCertificationsByCategory,
  getCertificationsBySimilarity,
  getCertificationsByVector,
  getCertificationDetailsByIds,
  getFaqsByVector,
  updateProfile,
} from '@/lib/supabase/queries';
import { createClient } from '@/lib/supabase/client';

// 모킹 설정을 파일 최상단으로 이동
jest.mock('@/lib/supabase/client', () => {
  // 메서드 체인을 지원하는 중첩된 모킹 함수 생성
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

// 테스트에서 사용할 mock 객체 가져오기
const mockSupabaseClient = createClient() as any;

describe('Supabase Queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Profile Queries', () => {
    describe('getProfileByUserId', () => {
      it('should return a profile when found', async () => {
        const mockProfile = { user_id: '123', name: 'Test User', avatar_url: 'url' };
        mockSupabaseClient.single.mockResolvedValueOnce({
          data: mockProfile,
          error: null,
        });

        const profile = await getProfileByUserId('123');

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
        expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
        expect(mockSupabaseClient.eq).toHaveBeenCalledWith('user_id', '123');
        expect(profile).toEqual(mockProfile);
      });

      it('should throw an error for database errors', async () => {
        const dbError = new Error('Database connection error');
        mockSupabaseClient.single.mockResolvedValueOnce({
          data: null,
          error: dbError,
        });

        await expect(getProfileByUserId('123')).rejects.toThrow('Database connection error');
      });
    });

    describe('createProfile', () => {
      it('should create a new profile', async () => {
        const newProfile = {
          user_id: '123',
          name: 'New User',
          avatar_url: 'https://example.com/avatar.jpg',
        };
        mockSupabaseClient.select.mockResolvedValueOnce({
          data: [newProfile],
          error: null,
        });

        const result = await createProfile(
          newProfile.user_id,
          newProfile.name,
          newProfile.avatar_url
        );

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
        expect(mockSupabaseClient.insert).toHaveBeenCalledWith(newProfile);
        expect(result).toEqual([newProfile]);
      });
    });

    describe('updateProfile', () => {
      it('should update profile data', async () => {
        const profileData = {
          user_id: 'user-123',
          name: 'Updated Name',
          avatar_url: 'new-avatar.jpg',
          theme: 'light' as const,
          created_at: new Date(),
          updated_at: new Date(),
        };

        mockSupabaseClient.update.mockResolvedValueOnce({
          data: profileData,
          error: null,
        });

        const result = await updateProfile(profileData);

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
        expect(mockSupabaseClient.update).toHaveBeenCalledWith(profileData);
        expect(mockSupabaseClient.eq).toHaveBeenCalledWith('user_id', profileData.user_id);
        expect(result).toEqual({ updatedData: profileData, error: null });
      });
    });
  });

  describe('Chat Queries', () => {
    describe('saveChat', () => {
      it('should save a new chat', async () => {
        const newChat = {
          id: 'chat-123',
          userId: 'user-123',
          title: 'Test Chat',
        };
        const mockResponse = [
          {
            id: newChat.id,
            user_id: newChat.userId,
            title: newChat.title,
            created_at: expect.any(Date),
            updated_at: expect.any(Date),
          },
        ];
        mockSupabaseClient.select.mockResolvedValueOnce({
          data: mockResponse,
          error: null,
        });

        const result = await saveChat(newChat);

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('chats');
        expect(mockSupabaseClient.insert).toHaveBeenCalled();
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getChatsByUserId', () => {
      it('should return paginated chats', async () => {
        const mockChats = [
          { id: 'chat-1', title: 'Chat 1' },
          { id: 'chat-2', title: 'Chat 2' },
        ];

        // 올바른 모킹 방법: limit() 메서드 결과에 mockResolvedValueOnce 적용
        mockSupabaseClient.limit.mockResolvedValueOnce({
          data: mockChats,
          error: null,
        });

        const result = await getChatsByUserId({
          id: 'user-123',
          limit: 10,
          startingAfter: null,
          endingBefore: null,
        });

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('chats');
        expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
        expect(mockSupabaseClient.eq).toHaveBeenCalledWith('user_id', 'user-123');
        expect(mockSupabaseClient.order).toHaveBeenCalled();
        expect(mockSupabaseClient.limit).toHaveBeenCalled();
        expect(result.chats).toEqual(mockChats);
      });
    });

    describe('deleteChatById', () => {
      it('should delete a chat and its related messages and votes', async () => {
        const chatId = 'chat-123';
        const mockDeletedChat = { id: chatId, title: 'Deleted Chat' };

        // Mock the delete operations
        mockSupabaseClient.delete.mockResolvedValueOnce({ error: null }); // votes
        mockSupabaseClient.delete.mockResolvedValueOnce({ error: null }); // messages
        mockSupabaseClient.select.mockResolvedValueOnce({
          data: [mockDeletedChat],
          error: null,
        });

        const result = await deleteChatById({ id: chatId });

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('votes');
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('messages');
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('chats');
        expect(result).toEqual([mockDeletedChat]);
      });

      it('should throw error when deletion fails', async () => {
        const chatId = 'chat-123';
        const error = new Error('Deletion failed');

        mockSupabaseClient.delete.mockResolvedValueOnce({ error });

        await expect(deleteChatById({ id: chatId })).rejects.toThrow('Deletion failed');
      });
    });

    describe('getChatById', () => {
      it('should return a chat by id', async () => {
        const chatId = 'chat-123';
        const mockChat = { id: chatId, title: 'Test Chat' };

        mockSupabaseClient.single.mockResolvedValueOnce({
          data: mockChat,
          error: null,
        });

        const result = await getChatById({ id: chatId });

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('chats');
        expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
        expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', chatId);
        expect(result).toEqual(mockChat);
      });
    });

    describe('updateChatVisiblityById', () => {
      it('should update chat visibility', async () => {
        const chatId = 'chat-123';
        const visibility = 'public';
        const mockUpdatedChat = { id: chatId, visibility };

        mockSupabaseClient.select.mockResolvedValueOnce({
          data: [mockUpdatedChat],
          error: null,
        });

        const result = await updateChatVisiblityById({ chat_id: chatId, visibility });

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('chats');
        expect(mockSupabaseClient.update).toHaveBeenCalledWith({ visibility });
        expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', chatId);
        expect(result).toEqual([mockUpdatedChat]);
      });
    });
  });

  describe('Message Queries', () => {
    describe('saveMessages', () => {
      it('should save multiple messages', async () => {
        const messages = [
          { id: 'msg-1', content: 'Hello', role: 'user' },
          { id: 'msg-2', content: 'Hi', role: 'assistant' },
        ];
        mockSupabaseClient.select.mockResolvedValueOnce({
          data: messages,
          error: null,
        });

        const result = await saveMessages({ messages });

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('messages');
        expect(mockSupabaseClient.insert).toHaveBeenCalledWith(messages);
        expect(result).toEqual(messages);
      });
    });

    describe('getMessagesByChatId', () => {
      it('should return messages for a chat', async () => {
        const mockMessages = [
          { id: 'msg-1', content: 'Hello' },
          { id: 'msg-2', content: 'Hi' },
        ];
        // 올바른 모킹 방법
        mockSupabaseClient.order.mockResolvedValueOnce({
          data: mockMessages,
          error: null,
        });

        const result = await getMessagesByChatId({ id: 'chat-123' });

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('messages');
        expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
        expect(mockSupabaseClient.eq).toHaveBeenCalledWith('chat_id', 'chat-123');
        expect(mockSupabaseClient.order).toHaveBeenCalled();
        expect(result).toEqual(mockMessages);
      });
    });

    describe('voteMessage', () => {
      it('should create a new vote', async () => {
        const voteData = {
          chatId: 'chat-123',
          messageId: 'msg-123',
          type: 'up' as const,
        };
        const mockVote = { ...voteData, is_upvoted: true };

        mockSupabaseClient.single.mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST116' },
        });
        mockSupabaseClient.select.mockResolvedValueOnce({
          data: [mockVote],
          error: null,
        });

        const result = await voteMessage(voteData);

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('votes');
        expect(mockSupabaseClient.insert).toHaveBeenCalled();
        expect(result).toEqual([mockVote]);
      });

      it('should update existing vote', async () => {
        const voteData = {
          chatId: 'chat-123',
          messageId: 'msg-123',
          type: 'down' as const,
        };
        const mockVote = { ...voteData, is_upvoted: false };

        mockSupabaseClient.single.mockResolvedValueOnce({
          data: { ...voteData, is_upvoted: true },
          error: null,
        });
        mockSupabaseClient.select.mockResolvedValueOnce({
          data: [mockVote],
          error: null,
        });

        const result = await voteMessage(voteData);

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('votes');
        expect(mockSupabaseClient.update).toHaveBeenCalled();
        expect(result).toEqual([mockVote]);
      });
    });

    describe('getVotesByChatId', () => {
      it('should return votes for a chat', async () => {
        const chatId = 'chat-123';
        const mockVotes = [
          { message_id: 'msg-1', is_upvoted: true },
          { message_id: 'msg-2', is_upvoted: false },
        ];

        mockSupabaseClient.select.mockResolvedValueOnce({
          data: mockVotes,
          error: null,
        });

        const result = await getVotesByChatId({ id: chatId });

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('votes');
        expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
        expect(mockSupabaseClient.eq).toHaveBeenCalledWith('chat_id', chatId);
        expect(result).toEqual(mockVotes);
      });
    });

    describe('getMessageById', () => {
      it('should return a message by id', async () => {
        const messageId = 'msg-123';
        const mockMessage = { id: messageId, content: 'Test message' };

        mockSupabaseClient.select.mockResolvedValueOnce({
          data: [mockMessage],
          error: null,
        });

        const result = await getMessageById({ id: messageId });

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('messages');
        expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
        expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', messageId);
        expect(result).toEqual([mockMessage]);
      });
    });

    describe('deleteMessagesByChatIdAfterTimestamp', () => {
      it('should delete messages after timestamp', async () => {
        const chatId = 'chat-123';
        const timestamp = new Date();
        const mockMessages = [
          { id: 'msg-1', content: 'Message 1' },
          { id: 'msg-2', content: 'Message 2' },
        ];

        mockSupabaseClient.select.mockResolvedValueOnce({
          data: mockMessages,
          error: null,
        });
        mockSupabaseClient.delete.mockResolvedValueOnce({ error: null }); // votes
        mockSupabaseClient.select.mockResolvedValueOnce({
          data: mockMessages,
          error: null,
        });

        const result = await deleteMessagesByChatIdAfterTimestamp({
          chatId,
          timestamp,
        });

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('messages');
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('votes');
        expect(result).toEqual(mockMessages);
      });
    });

    describe('getMessageCountByUserId', () => {
      it('should return message count for user', async () => {
        const userId = 'user-123';
        const differenceInHours = 24;
        const mockCount = 5;

        mockSupabaseClient.select.mockResolvedValueOnce({
          data: [{ id: 'chat-1' }, { id: 'chat-2' }],
          error: null,
        });
        mockSupabaseClient.select.mockResolvedValueOnce({
          count: mockCount,
          error: null,
        });

        const result = await getMessageCountByUserId({
          id: userId,
          differenceInHours,
        });

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('chats');
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('messages');
        expect(result).toBe(mockCount);
      });
    });
  });

  describe('Certification Queries', () => {
    describe('getCertificationsByCategory', () => {
      it('should return certifications by category', async () => {
        const mockCertifications = [
          { category: 'IT', factor: 'factor1' },
          { category: 'IT', factor: 'factor2' },
        ];
        // 올바른 모킹 방법
        mockSupabaseClient.ilike.mockResolvedValueOnce({
          data: mockCertifications,
          error: null,
        });

        const result = await getCertificationsByCategory('IT');

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('kc_certifications');
        expect(mockSupabaseClient.select).toHaveBeenCalledWith(
          'category, factor, certifications, keywords, purchase_agency, detail_ids'
        );
        expect(mockSupabaseClient.ilike).toHaveBeenCalledWith('category', '%IT%');
        expect(result).toEqual(mockCertifications);
      });
    });

    describe('getCertificationsByVector', () => {
      it('should return certifications by vector similarity', async () => {
        const mockCertifications = [
          { category: 'IT', similarity: 0.8 },
          { category: 'IT', similarity: 0.7 },
        ];
        mockSupabaseClient.rpc.mockResolvedValueOnce({
          data: mockCertifications,
          error: null,
        });

        const result = await getCertificationsByVector('IT certification');

        expect(mockSupabaseClient.rpc).toHaveBeenCalledWith(
          'get_certifications_by_vector',
          expect.any(Object)
        );
        expect(result).toEqual(mockCertifications);
      });
    });

    describe('getCertificationsBySimilarity', () => {
      it('should return certifications by similarity', async () => {
        const category = 'IT';
        const mockCertifications = [
          { category: 'IT', similarity: 0.8 },
          { category: 'IT', similarity: 0.7 },
        ];

        mockSupabaseClient.rpc.mockResolvedValueOnce({
          data: mockCertifications,
          error: null,
        });

        const result = await getCertificationsBySimilarity(category);

        expect(mockSupabaseClient.rpc).toHaveBeenCalledWith(
          'get_certifications_by_similarity',
          expect.any(Object)
        );
        expect(result).toEqual(mockCertifications);
      });
    });

    describe('getCertificationDetailsByIds', () => {
      it('should return certification details by ids', async () => {
        const ids = ['cert-1', 'cert-2'];
        const mockDetails = [
          { id: 'cert-1', title: 'Cert 1' },
          { id: 'cert-2', title: 'Cert 2' },
        ];

        // 수정된 모킹 방식: in() 메서드에서 결과를 반환하도록 변경
        mockSupabaseClient.in.mockResolvedValueOnce({
          data: mockDetails,
          error: null,
        });

        const result = await getCertificationDetailsByIds(ids);

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('kc_certification_details');
        expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
        expect(mockSupabaseClient.in).toHaveBeenCalledWith('id', ids);
        expect(result).toEqual(mockDetails);
      });

      it('should return empty array for empty ids', async () => {
        const result = await getCertificationDetailsByIds([]);
        expect(result).toEqual([]);
      });
    });
  });

  describe('FAQ Queries', () => {
    describe('getFaqsByVector', () => {
      it('should return FAQs by vector similarity', async () => {
        const mockFaqs = [
          { question: 'Q1', answer: 'A1' },
          { question: 'Q2', answer: 'A2' },
        ];
        mockSupabaseClient.rpc.mockResolvedValueOnce({
          data: mockFaqs,
          error: null,
        });

        const result = await getFaqsByVector('test question');

        expect(mockSupabaseClient.rpc).toHaveBeenCalledWith(
          'get_faqs_by_vector',
          expect.any(Object)
        );
        expect(result).toEqual(mockFaqs);
      });
    });
  });
});
