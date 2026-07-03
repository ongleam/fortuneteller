// chat outbound adapter — Vercel AI SDK 실행 클라이언트. domain/ports.ts 의 AiClient 구현.
// application(handlers)은 이 구현이 아니라 AiClient 계약에만 의존하고, 어댑터(app)가 주입한다.
import { convertToModelMessages, generateObject, generateText, type LanguageModel } from "ai";
import type { z } from "zod";
import type { AiClient } from "@fortuneteller/modules/chat/domain/ports";

export const aiClient = {
  async generateText({ model, system, prompt }) {
    const { text } = await generateText({ model, system, prompt });
    return text;
  },

  async generateObjectArray<T>({
    model,
    system,
    prompt,
    schema,
  }: {
    model: LanguageModel;
    system: string;
    prompt: string;
    schema: z.ZodType<T>;
  }): Promise<T[]> {
    const { object } = await generateObject({ model, system, prompt, output: "array", schema });
    return object as T[];
  },

  async toModelMessages(messages) {
    return convertToModelMessages(messages);
  },
} satisfies AiClient;
