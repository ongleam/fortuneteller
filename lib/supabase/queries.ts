import { createClient } from '@/lib/supabase/client';
import { getEmbedding } from '@/lib/utils/embedding';
import {
  Chat,
  DBMessage,
  Faq,
  KcCertification,
  KcCertificationDetail,
  Profile,
  Vote,
} from '../db/schema';

export const runtime = 'edge';

// 클라이언트 측에서 사용할 Supabase 인스턴스 생성
const supabase = createClient();

const DEFAULT_MATCH_THRESHOLD = 0.7;
const DEFAULT_MATCH_COUNT = 5;
const DEFAULT_CATEGORY_SIMILARITY_THRESHOLD = 0.5;

// 프로필 쿼리

export const getProfileByUserId = async (userId: string): Promise<Profile | null> => {
  try {
    console.log(`[DB Query] 프로필 조회 시작: ${userId}`);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error(`[DB Query] 프로필 조회 실패: ${error.message}`);
      throw error;
    }

    console.log(`[DB Query] 프로필 조회 성공: ${JSON.stringify(data)}`);
    return data;
  } catch (error) {
    console.error('프로필 조회 오류:', error);
    throw error;
  }
};

export const createProfile = async (
  id: string,
  name: string,
  avatar_url: string
): Promise<Profile[] | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert({ user_id: id, name, avatar_url })
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('프로필 생성 오류:', error);
    throw error;
  }
};

// 채팅 쿼리

export const saveChat = async ({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}): Promise<Chat[] | null> => {
  try {
    const { data, error } = await supabase
      .from('chats')
      .insert({
        id,
        created_at: new Date(),
        updated_at: new Date(),
        user_id: userId,
        title,
      })
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('채팅 저장 오류:', error);
    throw error;
  }
};

export const deleteChatById = async ({ id }: { id: string }): Promise<Chat[] | null> => {
  try {
    // 트랜잭션 처리를 위해 순차적으로 삭제
    const { error: voteError } = await supabase.from('votes').delete().eq('chat_id', id);

    if (voteError) throw voteError;

    const { error: messageError } = await supabase.from('messages').delete().eq('chat_id', id);

    if (messageError) throw messageError;

    const { data, error } = await supabase.from('chats').delete().eq('id', id).select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('채팅 삭제 오류:', error);
    throw error;
  }
};

export const getChatsByUserId = async ({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}): Promise<{ chats: Chat[]; hasMore: boolean }> => {
  try {
    const extendedLimit = limit + 1;
    let query = supabase
      .from('chats')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(extendedLimit);

    if (startingAfter) {
      // 시작 지점 찾기
      const { data: selectedChat } = await supabase
        .from('chats')
        .select('created_at')
        .eq('id', startingAfter)
        .single();

      if (!selectedChat) {
        throw new Error(`Chat with id ${startingAfter} not found`);
      }

      query = query.gt('created_at', selectedChat.created_at);
    } else if (endingBefore) {
      // 종료 지점 찾기
      const { data: selectedChat } = await supabase
        .from('chats')
        .select('created_at')
        .eq('id', endingBefore)
        .single();

      if (!selectedChat) {
        throw new Error(`Chat with id ${endingBefore} not found`);
      }

      query = query.lt('created_at', selectedChat.created_at);
    }

    const { data, error } = await query;

    if (error) throw error;

    const hasMore = data && data.length > limit;

    return {
      chats: hasMore ? data.slice(0, limit) : data,
      hasMore,
    };
  } catch (error) {
    console.error('사용자별 채팅 조회 오류:', error);
    throw error;
  }
};

export const getChatById = async ({ id }: { id: string }): Promise<Chat | null> => {
  try {
    const { data, error } = await supabase.from('chats').select('*').eq('id', id).single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('채팅 조회 오류:', error);
    throw error;
  }
};

export const updateChatVisiblityById = async ({
  chat_id,
  visibility,
}: {
  chat_id: string;
  visibility: 'private' | 'public';
}): Promise<Chat[] | null> => {
  try {
    const { data, error } = await supabase
      .from('chats')
      .update({ visibility })
      .eq('id', chat_id)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('채팅 가시성 업데이트 오류:', error);
    throw error;
  }
};

// 메시지 & 투표 쿼리

export const saveMessages = async ({
  messages,
}: {
  messages: Array<any>;
}): Promise<DBMessage[] | null> => {
  try {
    const { data, error } = await supabase.from('messages').insert(messages).select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('메시지 저장 오류:', error);
    throw error;
  }
};

export const getMessagesByChatId = async ({ id }: { id: string }): Promise<DBMessage[] | null> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('채팅별 메시지 조회 오류:', error);
    throw error;
  }
};

export const voteMessage = async ({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}): Promise<Vote[] | null> => {
  try {
    // 기존 투표 확인
    const { data: existingVote, error: selectError } = await supabase
      .from('votes')
      .select('*')
      .eq('message_id', messageId)
      .single();

    if (selectError && selectError.code !== 'PGRST116') throw selectError;

    if (existingVote) {
      // 기존 투표 업데이트
      const { data, error } = await supabase
        .from('votes')
        .update({ is_upvoted: type === 'up' })
        .eq('message_id', messageId)
        .eq('chat_id', chatId)
        .select();

      if (error) throw error;
      return data;
    } else {
      // 새 투표 추가
      const { data, error } = await supabase
        .from('votes')
        .insert({
          chat_id: chatId,
          message_id: messageId,
          is_upvoted: type === 'up',
        })
        .select();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('메시지 투표 오류:', error);
    throw error;
  }
};

export const getVotesByChatId = async ({ id }: { id: string }): Promise<Vote[] | null> => {
  try {
    const { data, error } = await supabase.from('votes').select('*').eq('chat_id', id);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('채팅별 투표 조회 오류:', error);
    throw error;
  }
};

export const getMessageById = async ({ id }: { id: string }): Promise<DBMessage[] | null> => {
  try {
    const { data, error } = await supabase.from('messages').select('*').eq('id', id);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('메시지 조회 오류:', error);
    throw error;
  }
};

export const deleteMessagesByChatIdAfterTimestamp = async ({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}): Promise<DBMessage[] | null> => {
  try {
    // 삭제할 메시지 ID 찾기
    const { data: messagesToDelete, error: selectError } = await supabase
      .from('messages')
      .select('id')
      .eq('chat_id', chatId)
      .gte('created_at', timestamp.toISOString());

    if (selectError) throw selectError;

    if (messagesToDelete && messagesToDelete.length > 0) {
      const messageIds = messagesToDelete.map((message) => message.id);

      // 투표 삭제
      const { error: voteError } = await supabase
        .from('votes')
        .delete()
        .eq('chat_id', chatId)
        .in('message_id', messageIds);

      if (voteError) throw voteError;

      // 메시지 삭제
      const { data, error } = await supabase
        .from('messages')
        .delete()
        .eq('chat_id', chatId)
        .in('id', messageIds)
        .select();

      if (error) throw error;
      return data;
    }

    return [];
  } catch (error) {
    console.error('특정 시간 이후 메시지 삭제 오류:', error);
    throw error;
  }
};

export const getMessageCountByUserId = async ({
  id,
  differenceInHours,
}: {
  id: string;
  differenceInHours: number;
}): Promise<number> => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - differenceInHours * 60 * 60 * 1000);

    // 먼저 사용자의 채팅 ID들을 가져옵니다
    const { data: chats, error: chatError } = await supabase
      .from('chats')
      .select('id')
      .eq('user_id', id);

    if (chatError) throw chatError;

    // 채팅이 없으면 0을 반환합니다
    if (!chats || chats.length === 0) {
      return 0;
    }

    // 채팅 ID 배열 추출
    const chatIds = chats.map((chat) => chat.id);

    // 이제 채팅 ID 배열로 메시지 수를 조회합니다
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'user')
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .in('chat_id', chatIds);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('사용자별 메시지 카운트 오류:', error);
    throw error;
  }
};

// 인증 쿼리

export const getCertificationsByCategory = async (category: string) => {
  try {
    const { data, error } = await supabase
      .from('kc_certifications')
      .select('category, factor, certifications, keywords, purchase_agency, detail_ids')
      .ilike('category', `%${category}%`);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`카테고리별 인증 조회 오류: ${category}`, error);
    throw error;
  }
};

export const getCertificationsBySimilarity = async (
  category: string,
  threshold: number = DEFAULT_CATEGORY_SIMILARITY_THRESHOLD,
  limit?: number
): Promise<KcCertification[] | null> => {
  try {
    // PostgreSQL similarity 함수 사용
    let query = supabase.rpc('get_certifications_by_similarity', {
      query_category: category,
      similarity_threshold: threshold,
      results_limit: limit,
    });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    console.log(
      `[INFO] 카테고리 "${category}"에 대해 ${data.length}개의 유사 인증 발견 (threshold: ${threshold})`
    );
    return data;
  } catch (error) {
    console.error(`카테고리 유사도별 인증 조회 오류: ${category}`, error);
    throw error;
  }
};

export const getCertificationsByVector = async (
  query: string,
  threshold = DEFAULT_MATCH_THRESHOLD,
  count = DEFAULT_MATCH_COUNT
): Promise<KcCertification[] | null> => {
  try {
    let queryEmbedding = await getEmbedding(query);

    const { data, error } = await supabase.rpc('get_certifications_by_vector', {
      query_embedding: queryEmbedding,
      threshold,
      results_limit: count,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`벡터 검색 인증 조회 오류: ${query}`, error);
    throw error;
  }
};

// 인증 상세 쿼리

export const getCertificationDetailsByIds = async (
  ids: string[]
): Promise<KcCertificationDetail[] | null> => {
  if (!ids || ids.length === 0) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('kc_certification_details')
      .select('*')
      .in('id', ids);

    if (error) {
      console.error('인증 상세 정보 조회 오류:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('인증 상세 정보 조회 실패:', error);
    throw error;
  }
};

export const getCertificationDetailById = async (
  id: string
): Promise<KcCertificationDetail | null> => {
  const { data, error } = await supabase
    .from('kc_certification_details')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};
// FAQ 쿼리

export const getFaqsByVector = async (
  query: string,
  threshold = DEFAULT_MATCH_THRESHOLD,
  count = DEFAULT_MATCH_COUNT
): Promise<Faq[] | null> => {
  try {
    let queryEmbedding = await getEmbedding(query);

    if (!queryEmbedding) {
      console.error('쿼리 임베딩이 null 또는 undefined입니다.');
      throw new Error('쿼리 임베딩 생성 실패 (결과가 null)');
    }

    const { data, error } = await supabase.rpc('get_faqs_by_vector', {
      query_embedding: queryEmbedding,
      threshold,
      results_limit: count,
    });

    if (error) throw error;
    // console.log('[INFO] 벡터 검색 FAQ:', data);
    return data;
  } catch (error) {
    console.error('FAQ 벡터 검색 오류:', error);
    throw error;
  }
};

export const updateProfile = async (data: Profile) => {
  const { data: updatedData, error } = await supabase
    .from('profiles')
    .update(data)
    .eq('user_id', data.user_id);
  return { updatedData, error };
};
