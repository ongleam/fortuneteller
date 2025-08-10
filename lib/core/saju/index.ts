/**
 * getSajuInfo 메인 함수
 * fetchSaju를 대체하는 새로운 사주 계산 함수
 */

import { getFourPillars } from './four-pillars';
import { getTenStars } from './ten-stars';
import { getFiveElements } from './five-elements';

import type { BirthInput } from '@/lib/shared/types/saju';

/**
 * 사주 정보 계산 메인 함수
 *
 * @param birthInput - 생년월일시 정보
 * @param options - 계산 옵션 (출력 형식, 년도 등)
 * @returns 요청된 형식의 사주 정보
 */
export async function getSajuInfo(birthInput: BirthInput) {
  try {
    // 2. 사주 팔자 계산
    const pillars = await getFourPillars(birthInput);

    // 3. 십성 계산
    const tenStars = getTenStars(pillars);

    // 4. 오행 분석
    const fiveElements = getFiveElements(pillars);

    // // 5. 운세 계산
    // const fortune = calculateFortunes(pillars, options.targetYear);

    // // 6. 신살 계산
    // const sinsals = getTopThreeSinsals(pillars);

    return {
      pillars,
      tenStars,
      fiveElements,
    };
  } catch (error) {
    throw new Error(
      `getSaju 계산 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    );
  }
}
