import { myProvider } from '@/lib/utils/registry';
import { searchCertificationsBySupabase } from '@/lib/tools/search-certifications';
import { searchFaqBySupabase } from '@/lib/tools/search-faq';
import { DataStreamWriter } from 'ai';
import { systemPrompts } from '@/config/prompts';

export function kakaoKcAgent({
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
    system: systemPrompts.KAKAO_KC_AGENT,
    messages,
    tools: {
      searchFaq: searchFaqBySupabase({ dataStream }),
    },
  };
}
