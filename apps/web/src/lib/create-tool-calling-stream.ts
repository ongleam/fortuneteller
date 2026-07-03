// AI SDK 어댑터 — baseAgent 로 스트리밍 응답을 만들고 완료 시 메시지를 저장한다.
import { smoothStream, stepCountIs, streamText, type UIMessage } from "ai";
import { baseAgent } from "@/agents/base";
import { generateUUID } from "@fortuneteller/shared/utils";
import { SaveMessages } from "@fortuneteller/modules/chat/domain/commands";
import { bus } from "@/bootstrap/bus";
import { isProductionEnvironment } from "@fortuneteller/shared/constants";

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

  const agentConfig = await baseAgent({ messages, model, kakao_user_id: userId });

  const result = streamText({
    ...agentConfig,
    stopWhen: stepCountIs(MAX_STEPS),
    experimental_transform: smoothStream({ chunking: "word" }),
    experimental_telemetry: {
      isEnabled: isProductionEnvironment,
      functionId: "stream-text",
    },
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    generateMessageId: generateUUID,
    sendReasoning: false,
    onFinish: async ({ responseMessage }) => {
      if (!userId) return;
      try {
        await bus.handle(
          SaveMessages({
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
          }),
        );
      } catch (_) {
        console.error("Failed to save chat:", _);
      }
    },
    onError: (error) => {
      console.error("[ERROR] Failed to process chat request: ", error);
      return "Oops, an error occurred!";
    },
  });
}
