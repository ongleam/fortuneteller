/**
 * Supabase 쿼리 함수들 테스트
 */

import {
  getProfileByUserId,
  createProfile,
  saveChat,
  deleteChatById,
  getChatsByUserId,
  saveMessages,
  getMessagesByChatId,
  voteMessage,
  getVotesByChatId,
} from "@/lib/infra/supabase/queries";
import { createClient } from "@/lib/infra/supabase/client";

// 모킹 설정
// PostgREST 빌더는 메서드 체이닝이 가능한 동시에 thenable(await 가능)이다.
// 따라서 mock 은 모든 빌더 메서드에서 자기 자신을 반환하면서, await 시점에
// 미리 설정한 결과로 resolve 되는 단일 인스턴스여야 한다.
// queries.ts 는 모듈 로드 시점에 createClient() 를 한 번 호출해 보관하므로,
// createClient 는 항상 같은 인스턴스를 돌려줘야 테스트와 구현이 동일 mock 을 공유한다.
jest.mock("@/lib/infra/supabase/client", () => {
  type QueryResult = { data: any; error: any };

  let defaultResult: QueryResult = { data: null, error: null };
  let resultQueue: QueryResult[] = [];

  const mock: any = {
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
    // 빌더를 await 하면 다음 결과(큐 우선, 없으면 기본값)로 resolve 된다.
    then: (resolve: (value: QueryResult) => unknown) =>
      resolve(resultQueue.length > 0 ? (resultQueue.shift() as QueryResult) : defaultResult),
    // 단일 await 함수용: 기본 결과 설정 + 큐 초기화
    __setResult: (result: QueryResult) => {
      defaultResult = result;
      resultQueue = [];
    },
    // 다중 await 함수용: await 순서대로 소비되는 결과 시퀀스 설정
    __setResults: (results: QueryResult[]) => {
      resultQueue = [...results];
    },
  };

  return {
    createClient: jest.fn(() => mock),
  };
});

describe("Supabase Queries", () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = createClient();
    jest.clearAllMocks();
    mockClient.__setResult({ data: null, error: null });
  });

  describe("Profile 관련 쿼리", () => {
    test("getProfileByUserId - 프로필 조회", async () => {
      const mockProfile = {
        user_id: "test-user-id",
        name: "테스트 사용자",
        email: "test@example.com",
      };

      mockClient.__setResult({ data: mockProfile, error: null });

      const result = await getProfileByUserId("test-user-id");

      expect(mockClient.from).toHaveBeenCalledWith("profiles");
      expect(mockClient.select).toHaveBeenCalled();
      expect(mockClient.eq).toHaveBeenCalledWith("user_id", "test-user-id");
      expect(result).toEqual(mockProfile);
    });

    test("createProfile - 프로필 생성", async () => {
      const newProfile = {
        user_id: "new-user-id",
        name: "새 사용자",
        email: "new@example.com",
      };

      mockClient.__setResult({ data: [newProfile], error: null });

      const result = await createProfile(newProfile.user_id, newProfile.name, newProfile.email);

      expect(mockClient.from).toHaveBeenCalledWith("profiles");
      expect(mockClient.insert).toHaveBeenCalledWith({
        user_id: newProfile.user_id,
        name: newProfile.name,
        avatar_url: newProfile.email,
      });
      expect(result).toEqual([newProfile]);
    });

    test.skip("updateProfile - 프로필 업데이트 (함수 미구현)", async () => {
      // updateProfile 함수가 export되지 않음
    });
  });

  describe("Chat 관련 쿼리", () => {
    test("saveChat - 채팅 저장", async () => {
      const chatData = {
        user_id: "test-user",
        title: "테스트 채팅",
        channel: "web",
      };

      mockClient.__setResult({ data: [{ id: "chat-id", ...chatData }], error: null });

      const result = await saveChat({
        id: "chat-id",
        userId: chatData.user_id,
        title: chatData.title,
      });

      expect(mockClient.from).toHaveBeenCalledWith("chats");
      expect(mockClient.insert).toHaveBeenCalled();
      expect(result).toEqual([{ id: "chat-id", ...chatData }]);
    });

    test("getChatsByUserId - 사용자별 채팅 조회", async () => {
      const mockChats = [
        { id: "chat1", title: "채팅 1" },
        { id: "chat2", title: "채팅 2" },
      ];

      mockClient.__setResult({ data: mockChats, error: null });

      const result = await getChatsByUserId({
        id: "test-user",
        limit: 10,
        startingAfter: null,
        endingBefore: null,
      });

      expect(mockClient.from).toHaveBeenCalledWith("chats");
      expect(mockClient.select).toHaveBeenCalled();
      expect(mockClient.eq).toHaveBeenCalledWith("user_id", "test-user");
      expect(mockClient.order).toHaveBeenCalledWith("created_at", { ascending: false });
      // 구현은 페이지네이션 메타와 함께 { chats, hasMore } 를 반환한다.
      expect(result).toEqual({ chats: mockChats, hasMore: false });
    });

    test("deleteChatById - 채팅 삭제", async () => {
      // votes/messages/chats 순으로 3회 await 하며, 마지막 chats 삭제는 data[0] 을 반환한다.
      mockClient.__setResult({ data: [{ id: "chat-id" }], error: null });

      await deleteChatById({ id: "chat-id" });

      expect(mockClient.from).toHaveBeenCalledWith("chats");
      expect(mockClient.delete).toHaveBeenCalled();
      expect(mockClient.eq).toHaveBeenCalledWith("id", "chat-id");
    });
  });

  describe("Message 관련 쿼리", () => {
    test("saveMessages - 메시지 저장", async () => {
      const messages = [
        {
          chat_id: "chat-id",
          role: "user",
          parts: [{ type: "text", text: "테스트 메시지" }],
          attachments: [],
        },
      ];

      mockClient.__setResult({ data: messages, error: null });

      const result = await saveMessages({ messages });

      expect(mockClient.from).toHaveBeenCalledWith("messages");
      expect(mockClient.insert).toHaveBeenCalledWith(messages);
      expect(result).toEqual(messages);
    });

    test("getMessagesByChatId - 채팅별 메시지 조회", async () => {
      const mockMessages = [
        { id: "msg1", content: "메시지 1" },
        { id: "msg2", content: "메시지 2" },
      ];

      mockClient.__setResult({ data: mockMessages, error: null });

      const result = await getMessagesByChatId({ id: "chat-id" });

      expect(mockClient.from).toHaveBeenCalledWith("messages");
      expect(mockClient.select).toHaveBeenCalled();
      expect(mockClient.eq).toHaveBeenCalledWith("chat_id", "chat-id");
      // 구현은 오래된 순(created_at ascending)으로 조회한다.
      expect(mockClient.order).toHaveBeenCalledWith("created_at", { ascending: true });
      expect(result).toEqual(mockMessages);
    });
  });

  describe("Vote 관련 쿼리", () => {
    test("voteMessage - 메시지 투표", async () => {
      const voteData = {
        message_id: "msg-id",
        is_upvoted: true,
      };

      // 1) 기존 투표 조회 → 없음, 2) 새 투표 insert 결과
      mockClient.__setResults([
        { data: null, error: null },
        { data: [voteData], error: null },
      ]);

      const result = await voteMessage({
        chatId: "chat-id",
        messageId: voteData.message_id,
        type: voteData.is_upvoted ? "up" : "down",
      });

      expect(mockClient.from).toHaveBeenCalledWith("votes");
      expect(mockClient.insert).toHaveBeenCalled();
      expect(result).toEqual([voteData]);
    });

    test("getVotesByChatId - 채팅별 투표 조회", async () => {
      const mockVotes = [
        { message_id: "msg1", is_upvoted: true },
        { message_id: "msg2", is_upvoted: false },
      ];

      mockClient.__setResult({ data: mockVotes, error: null });

      const result = await getVotesByChatId({ id: "chat-id" });

      expect(mockClient.from).toHaveBeenCalledWith("votes");
      expect(mockClient.select).toHaveBeenCalled();
      expect(mockClient.eq).toHaveBeenCalledWith("chat_id", "chat-id");
      expect(result).toEqual(mockVotes);
    });
  });

  describe("에러 처리", () => {
    test("쿼리 에러 시 예외 발생", async () => {
      const mockError = new Error("Database connection failed");

      mockClient.__setResult({ data: null, error: mockError });

      await expect(getProfileByUserId("invalid-id")).rejects.toThrow();
    });
  });
});
