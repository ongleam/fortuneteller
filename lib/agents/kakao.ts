import { myProvider } from '@/lib/utils/registry';
import { searchFaq } from '@/lib/tools/search-faq';
import { DataStreamWriter } from 'ai';
import { systemPrompts } from '@/config/prompts';

export function kakaoAgent({
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
    system: systemPrompts.KAKAO_AGENT,
    messages,
    tools: {
      // searchFaq: searchFaqBySupabase({ dataStream }),
      searchFaq: searchFaq({ dataStream }),
    },
  };
}
