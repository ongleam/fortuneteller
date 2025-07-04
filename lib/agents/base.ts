import { myProvider } from '@/lib/utils/registry';
import { getSaju } from '@/lib/tools/get-saju';
import { systemPrompts } from '@/config/prompts';

export function baseAgent({ messages, model }: { messages: any[]; model: string }) {
  return {
    model: myProvider.languageModel(model),
    system: systemPrompts.BASE_AGENT,
    messages,
    tools: {
      getSaju: getSaju(),
    },
  };
}
