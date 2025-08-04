'use server';

import { getSajuPillars, getSajuPillarsReference } from '@/lib/core/saju/pillars';
import type { BirthInput, SajuPillars } from '@/lib/shared/types/saju';

export async function calculateSajuAction(birthInput: BirthInput): Promise<{
  local?: SajuPillars;
  reference?: SajuPillars;
  error?: string;
}> {
  try {
    // 로컬 계산 (데이터베이스 기반)
    const localResult = await getSajuPillars(birthInput);

    // Reference API 계산 (선택사항)
    const referenceResult = await getSajuPillarsReference(birthInput);

    console.log('[DEBUG] birthInput:', birthInput);
    console.log('[DEBUG] localResult:', localResult);
    console.log('[DEBUG] referenceResult:', referenceResult);

    return {
      local: localResult,
      reference: referenceResult,
    };
  } catch (error) {
    return {
      error: (error as Error).message,
    };
  }
}
