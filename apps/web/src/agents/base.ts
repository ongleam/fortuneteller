// inbound adapter — chat base agent 조립. provider(registry)·app tools·modelConfig 를
// 주입해 chat 모듈의 agent 팩토리(@fortuneteller/modules/chat/application/handlers)에 넘긴다.
import { myProvider } from "@/lib/registry";
import { modelConfig } from "@fortuneteller/config/models";
import { baseAgent as chatBaseAgent } from "@fortuneteller/modules/chat/application/handlers";
import { aiClient } from "@fortuneteller/modules/chat/infra/ai-client";
import type { UIMessage } from "ai";
import { getSaju } from "@/tools/saju";

export function baseAgent({
  messages,
  model,
}: {
  messages: UIMessage[];
  model: string;
  kakao_user_id: string;
}) {
  const config = modelConfig[model as keyof typeof modelConfig] as any;
  return chatBaseAgent({
    messages,
    model: myProvider.languageModel(model),
    aiClient,
    maxOutputTokens: config?.maxTokens,
    temperature: config?.temperature,
    tools: {
      getSaju: getSaju(),
    },
  });
}
