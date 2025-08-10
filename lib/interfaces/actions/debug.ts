'use server';

import { getFourPillars } from '@/lib/core/saju/four-pillars';
import {
  getReferenceFourPillars,
  getReferenceTenStars,
  getFiveElementsReference,
} from '@/lib/core/saju/reference';
import { getTenStars } from '@/lib/core/saju/ten-stars';
import { getFiveElements } from '@/lib/core/saju/five-elements';
import type { BirthInput, FourPillars, TenStars, FiveElements } from '@/lib/shared/types/saju';

export async function calculateSajuAction(birthInput: BirthInput): Promise<{
  local?: FourPillars;
  localTenStars?: TenStars;
  localFiveElements?: FiveElements;
  reference?: FourPillars;
  referenceTenStars?: TenStars;
  referenceFiveElements?: FiveElements;
  error?: string;
}> {
  try {
    // 로컬 계산 (데이터베이스 기반)
    const localResult = await getFourPillars(birthInput);
    console.log('[DEBUG] After getSajuPillars:', localResult);

    let localTenStars: TenStars | undefined;
    let localFiveElements: FiveElements | undefined;

    if (localResult) {
      try {
        localTenStars = getTenStars(localResult);
        console.log('[DEBUG] After getPillarsTenStar:', localTenStars);
      } catch (tenStarError) {
        console.error('[ERROR] getPillarsTenStar failed:', tenStarError);
        localTenStars = undefined;
      }

      try {
        localFiveElements = getFiveElements(localResult);
        console.log('[DEBUG] After getFiveElements:', localFiveElements);
      } catch (fiveElementsError) {
        console.error('[ERROR] getFiveElements failed:', fiveElementsError);
        localFiveElements = undefined;
      }
    }

    // Reference API 계산 (선택사항)
    let referenceResult: FourPillars | undefined;
    let referenceTenStars: TenStars | undefined;
    let referenceFiveElements: FiveElements | undefined;

    try {
      referenceResult = await getReferenceFourPillars(birthInput);
      console.log('[DEBUG] Reference Four Pillars:', referenceResult);
    } catch (error) {
      console.error('[ERROR] getReferenceFourPillars failed:', error);
      referenceResult = undefined;
    }

    try {
      referenceTenStars = await getReferenceTenStars(birthInput);
      console.log('[DEBUG] Reference Ten Stars:', referenceTenStars);
    } catch (error) {
      console.error('[ERROR] getReferenceTenStars failed:', error);
      referenceTenStars = undefined;
    }

    try {
      referenceFiveElements = await getFiveElementsReference(birthInput);
      console.log('[DEBUG] Reference Five Elements:', referenceFiveElements);
    } catch (error) {
      console.error('[ERROR] getFiveElementsReference failed:', error);
      referenceFiveElements = undefined;
    }

    console.log('[DEBUG] birthInput:', birthInput);
    console.log('[DEBUG] localResult:', localResult);
    console.log('[DEBUG] localTenStars:', localTenStars);
    console.log('[DEBUG] localFiveElements:', localFiveElements);
    console.log('[DEBUG] referenceResult:', referenceResult);
    console.log('[DEBUG] referenceTenStars:', referenceTenStars);
    console.log('[DEBUG] referenceFiveElements:', referenceFiveElements);

    return {
      local: localResult,
      localTenStars,
      localFiveElements,
      reference: referenceResult,
      referenceTenStars,
      referenceFiveElements,
    };
  } catch (error) {
    return {
      error: (error as Error).message,
    };
  }
}
