import { myProvider } from '@/lib/utils/registry';
import { getSaju } from '@/lib/tools/saju';
import { updateUserProfile } from '@/lib/tools/profile';
import { getHarmony } from '@/lib/tools/harmony';
import { systemPrompts } from '@/config/prompts';
import { modelConfig } from '@/config/models';
import { getTodayFortune, getYearFortune } from '@/lib/tools/fortune';

export function baseAgent({
  messages,
  model,
  kakao_user_id,
}: {
  messages: any[];
  model: string;
  kakao_user_id: string;
}) {
  return {
    model: myProvider.languageModel(model),
    maxTokens: (modelConfig[model as keyof typeof modelConfig] as any)?.maxTokens,
    temperature: (modelConfig[model as keyof typeof modelConfig] as any)?.temperature,
    system: systemPrompts.BASE_AGENT,
    messages,
    tools: {
      // updateUserProfile: updateUserProfile(kakao_user_id),
      getSaju: getSaju(kakao_user_id),
      getHarmony: getHarmony(kakao_user_id),
      getTodayFortune: getTodayFortune(kakao_user_id),
      getYearFortune: getYearFortune(kakao_user_id),
    },
  };
}
