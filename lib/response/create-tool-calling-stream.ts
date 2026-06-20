import { smoothStream, stepCountIs, streamText, type UIMessage } from 'ai';
import { baseAgent } from '../interfaces/agents/base';
import { generateUUID } from '@/lib/shared/utils';
import { saveMessages } from '../infra/db/queries';
import { isProductionEnvironment } from '../shared/constants';

const MAX_STEPS = 5;

interface BaseStreamConfig {
  message: any;
  messages: UIMessage[];
  model: string;
  userId: string;
  chatId: string;
}

export async function createToolCallingStream(streamConfig: BaseStreamConfig) {
  const { messages, model, userId, chatId } = streamConfig;

  // Select the agent based on the model
  const agentConfig = await baseAgent({ messages, model, kakao_user_id: userId });

  const result = streamText({
    ...agentConfig,
    stopWhen: stepCountIs(MAX_STEPS),
    experimental_transform: smoothStream({ chunking: 'word' }),
    experimental_telemetry: {
      isEnabled: isProductionEnvironment,
      functionId: 'stream-text',
    },
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    generateMessageId: generateUUID,
    sendReasoning: false,
    onFinish: async ({ responseMessage }) => {
      if (!userId) return;
      try {
        await saveMessages({
          messages: [
            {
              id: responseMessage.id,
              chat_id: chatId,
              role: responseMessage.role,
              parts: responseMessage.parts,
              attachments: [],
              created_at: new Date(),
            },
          ],
        });
      } catch (_) {
        console.error('Failed to save chat:', _);
      }
    },
    onError: (error) => {
      console.error('[ERROR] Failed to process chat request: ', error);
      return 'Oops, an error occurred!';
    },
  });
}
