import { myProvider } from '@/lib/utils/registry';
import { searchCertifications } from '@/lib/tools/search-certifications';
import { searchFaq } from '@/lib/tools/search-faq';
import { DataStreamWriter } from 'ai';
// import { getWeather } from '../tools/get-weather';
import { systemPrompts } from '@/config/prompts';

export function kcAgent({
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
    system: systemPrompts.KC_AGENT,
    messages,
    tools: {
      searchCertifications: searchCertifications({ dataStream }),
      searchFaq: searchFaq({ dataStream }),
      // getWeather: getWeather,
    },
  };
}
