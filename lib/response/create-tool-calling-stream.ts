import {
  appendClientMessage,
  appendResponseMessages,
  createDataStreamResponse,
  DataStreamWriter,
  smoothStream,
  streamText,
  UIMessage,
} from 'ai';
import { baseAgent } from '../agents/base';
import { generateUUID, getTrailingMessageId } from '@/lib/utils';
import { saveMessages } from '../db/queries';
import { isProductionEnvironment } from '../constants';

const MAX_STEPS = 5;

interface BaseStreamConfig {
  message: any;
  messages: any[];
  model: string;
  userId: string;
  chatId: string;
}

export function createToolCallingStream(modelConfig: BaseStreamConfig) {
  return createDataStreamResponse({
    execute: (dataStream: DataStreamWriter) => {
      const { messages, model, userId, chatId, message } = modelConfig;

      // Select the agent based on the model
      const agentConfig = baseAgent({ messages, model, dataStream });

      const result = streamText({
        ...agentConfig,
        maxSteps: MAX_STEPS,
        experimental_transform: smoothStream({ chunking: 'word' }),
        experimental_generateMessageId: generateUUID,
        onFinish: async ({ response }) => {
          if (userId) {
            try {
              const assistantId = getTrailingMessageId({
                messages: response.messages.filter((message) => message.role === 'assistant'),
              });

              if (!assistantId) {
                throw new Error('No assistant message found!');
              }

              const [, assistantMessage] = appendResponseMessages({
                messages: [message],
                responseMessages: response.messages,
              });
              // console.log('response', response.messages);
              // console.log('assistantMessage', assistantMessage);

              await saveMessages({
                messages: [
                  {
                    id: assistantId,
                    chat_id: chatId,
                    role: assistantMessage.role,
                    parts: assistantMessage.parts,
                    attachments: assistantMessage.experimental_attachments ?? [],
                    created_at: new Date(),
                  },
                ],
              });
            } catch (_) {
              console.error('Failed to save chat:', _);
            }
          }
        },
        experimental_telemetry: {
          isEnabled: isProductionEnvironment,
          functionId: 'stream-text',
        },
      });

      result.consumeStream();

      result.mergeIntoDataStream(dataStream, {
        sendReasoning: false,
      });
    },
    onError: (error) => {
      console.error('[ERROR] Failed to process chat request: ', error);
      return 'Oops, an error occurred!';
    },
  });
}
