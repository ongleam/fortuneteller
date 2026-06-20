import { myProvider } from '@/lib/shared/utils/registry';
import { getSaju } from '@/lib/interfaces/tools/saju';
import { updateUserProfile } from '@/lib/interfaces/tools/profile';
import { getHarmony } from '@/lib/interfaces/tools/harmony';
import { systemPrompts } from '@/config/prompts';
import { modelConfig } from '@/config/models';
import { getTodayFortune, getYearFortune } from '@/lib/interfaces/tools/fortune';
import { convertToModelMessages, type UIMessage } from 'ai';

export async function baseAgent({
  messages,
  model,
  kakao_user_id,
}: {
  messages: UIMessage[];
  model: string;
  kakao_user_id: string;
}) {
  return {
    model: myProvider.languageModel(model),
    maxOutputTokens: (modelConfig[model as keyof typeof modelConfig] as any)?.maxTokens,
    temperature: (modelConfig[model as keyof typeof modelConfig] as any)?.temperature,
    system: systemPrompts.BASE_AGENT,
    messages: await convertToModelMessages(messages),
    tools: {
      // updateUserProfile: updateUserProfile(kakao_user_id),
      getSaju: getSaju(),
      // getHarmony: getHarmony(kakao_user_id),
      // getTodayFortune: getTodayFortune(kakao_user_id),
      // getYearFortune: getYearFortune(kakao_user_id),
    },
  };
}
