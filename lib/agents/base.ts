import { myProvider } from '@/lib/utils/registry';
import { getSaju } from '@/lib/tools/get-saju';
import { systemPrompts } from '@/config/prompts';
import { modelConfig } from '@/config/models';

export function baseAgent({ messages, model }: { messages: any[]; model: string }) {
  return {
    model: myProvider.languageModel(model),
    maxTokens: (modelConfig[model as keyof typeof modelConfig] as any)?.maxTokens,
    temperature: (modelConfig[model as keyof typeof modelConfig] as any)?.temperature,
    system: systemPrompts.BASE_AGENT,
    messages,
    tools: {
      getSaju: getSaju(),
    },
  };
}
