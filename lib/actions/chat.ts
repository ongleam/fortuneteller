'use server';

import { generateObject, generateText, type UIMessage } from 'ai';
import { cookies } from 'next/headers';
import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  updateChatVisiblityById,
} from '@/lib/db/queries';
import type { VisibilityType } from '@/components/chat/visibility-selector';
import { myProvider } from '@/lib/utils/registry';
import { z } from 'zod';

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set('chat-model', model);
}

export async function generateTitleFromUserMessage({ message }: { message: UIMessage }) {
  const { text: title } = await generateText({
    model: myProvider.languageModel('title-model'),
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 40 characters long and written in Korean
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });

  return title;
}

export async function generateRecommandQuestions({
  userUtterance,
  questions,
}: {
  userUtterance: string;
  questions: string[];
}) {
  const { object } = await generateObject({
    model: myProvider.languageModel('chat-model'),
    system: `
    # Core Identity:
    당신은 질문 생성 어시스턴트입니다. 
    # Output:
    - 최대 3개의 질문을 생성합니다.
    - 질문은 핵심만 요약해서 최대한 간결하게 작성합니다. (최대 30자 이내)
    - 주어진 FAQ 질문을 참고하여 질문을 생성합니다.
    - 만약 주어진 FAQ 질문이 없다면, empty array를 반환합니다.
    `,
    prompt: `
    - FAQ 질문: ${questions.length > 0 ? questions.join(', ') : '없음'}
    `,
    output: 'object',
    schema: z.array(
      z.object({
        messageText: z.string(),
      })
    ),
  });

  return object;
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chat_id,
    timestamp: message.created_at,
  });
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisiblityById({ chat_id: chatId, visibility });
}
