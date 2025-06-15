import { myProvider } from '@/lib/utils/registry';
import { searchFaq } from '@/lib/tools/search-faq';
import { DataStreamWriter } from 'ai';
import { systemPrompts } from '@/config/prompts';

export function baseAgent({
  messages,
  model,
  dataStream,
}: {
  messages: any[];
  model: string;
  dataStream?: DataStreamWriter;
}) {
  return {
    model: myProvider.languageModel(model),
    system: systemPrompts.BASE_AGENT,
    messages,
    tools: {
      // searchFaq: searchFaq({ dataStream }),
    },
  };
}
