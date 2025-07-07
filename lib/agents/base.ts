import { myProvider } from '@/lib/utils/registry';
import { getSaju, updateSajuProfile, getUserSaju } from '@/lib/tools/saju';
import { systemPrompts } from '@/config/prompts';
import { modelConfig } from '@/config/models';

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
      getSaju: getSaju(),
      updateSajuProfile: updateSajuProfile(kakao_user_id),
      getUserSaju: getUserSaju(kakao_user_id),
    },
  };
}
