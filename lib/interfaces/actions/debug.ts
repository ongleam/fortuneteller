'use server';

import { getSajuPillars, getSajuPillarsReference } from '@/lib/core/saju/pillars';
import { getPillarsTenStar } from '@/lib/core/saju/ten-stars';
import { getFiveElements, getFiveElementsReference } from '@/lib/core/saju/five-elements';
import type { BirthInput, SajuPillars, PillarsTenStar, FiveElements } from '@/lib/shared/types/saju';

export async function calculateSajuAction(birthInput: BirthInput): Promise<{
  local?: SajuPillars;
  localTenStars?: PillarsTenStar;
  localFiveElements?: FiveElements;
  reference?: SajuPillars;
  referenceTenStars?: PillarsTenStar;
  referenceFiveElements?: FiveElements;
  error?: string;
}> {
  try {
    // 로컬 계산 (데이터베이스 기반)
    const localResult = await getSajuPillars(birthInput);
    console.log('[DEBUG] After getSajuPillars:', localResult);
    
    let localTenStars: PillarsTenStar | undefined;
    let localFiveElements: FiveElements | undefined;
    
    if (localResult) {
      try {
        localTenStars = getPillarsTenStar(localResult);
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
    const referenceResult = await getSajuPillarsReference(birthInput);
    let referenceTenStars: PillarsTenStar | undefined;
    let referenceFiveElements: FiveElements | undefined;
    
    if (referenceResult) {
      try {
        referenceTenStars = getPillarsTenStar(referenceResult);
      } catch (error) {
        console.error('[ERROR] Reference getPillarsTenStar failed:', error);
        referenceTenStars = undefined;
      }
      
      try {
        referenceFiveElements = getFiveElements(referenceResult);
      } catch (error) {
        console.error('[ERROR] Reference getFiveElements failed:', error);
        referenceFiveElements = undefined;
      }
    }
    
    // Reference API에서 오행 데이터도 가져오기 시도
    try {
      const refFiveElementsFromAPI = await getFiveElementsReference(birthInput);
      if (refFiveElementsFromAPI) {
        referenceFiveElements = refFiveElementsFromAPI;
      }
    } catch (error) {
      console.warn('[WARN] Reference API getFiveElementsReference failed:', error);
    }

    console.log('[DEBUG] birthInput:', birthInput);
    console.log('[DEBUG] localResult:', localResult);
    console.log('[DEBUG] localTenStars:', localTenStars);
    console.log('[DEBUG] referenceResult:', referenceResult);
    console.log('[DEBUG] referenceTenStars:', referenceTenStars);

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
