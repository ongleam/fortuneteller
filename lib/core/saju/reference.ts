import type { BirthInput, FourPillars, TenStars, FiveElements } from '@/lib/shared/types/saju';
import { normalizeCalendarType } from './calendar';

const SAJU_MAKER_API_URL = 'https://api.aifortunedoctor.com/order3/make';
const SAJU_API_URL = 'https://api.aifortunedoctor.com/order3/free';

export function getToday() {
  return new Date().toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}
/**
 * birthTime normalization 함수
 * 시간과 분을 받아서 API 규격에 맞는 시간 코드로 변환
 */
function normalizeBirthTime(hour: string | number, minute?: string | number): string {
  // hour와 minute를 숫자로 변환
  const h = parseInt(String(hour)) || 0;
  const m = parseInt(String(minute || 0)) || 0;

  // 전체 분으로 변환
  const totalMinutes = h * 60 + m;

  // API 규칙에 따른 매핑
  if (totalMinutes < 90) return '00'; // 00:00 ~ 01:29
  if (totalMinutes < 210) return '02'; // 01:30 ~ 03:29
  if (totalMinutes < 330) return '04'; // 03:30 ~ 05:29
  if (totalMinutes < 450) return '06'; // 05:30 ~ 07:29
  if (totalMinutes < 570) return '08'; // 07:30 ~ 09:29
  if (totalMinutes < 690) return '10'; // 09:30 ~ 11:29
  if (totalMinutes < 810) return '12'; // 11:30 ~ 13:29
  if (totalMinutes < 930) return '14'; // 13:30 ~ 15:29
  if (totalMinutes < 1050) return '16'; // 15:30 ~ 17:29
  if (totalMinutes < 1170) return '18'; // 17:30 ~ 19:29
  if (totalMinutes < 1290) return '20'; // 19:30 ~ 21:29
  if (totalMinutes < 1410) return '22'; // 21:30 ~ 23:29
  return '24'; // 23:30 ~ 24:00
}

export async function getReferenceSajuData(
  name: string,
  gender: string,
  birthType: string,
  birthYear: string,
  birthMonth: string,
  birthDay: string,
  birthTime: string | null | undefined,
  birthMinute?: string | null | undefined,
  isLeapMonth?: boolean | null | undefined
) {
  try {
    // birthTime normalization
    const normalizedBirthTime = normalizeBirthTime(birthTime || '0', birthMinute || '0');

    // 1단계: order3Id 생성
    console.log('[INFO] 사주 주문 생성 시작...');
    console.log(`[INFO] 시간 정규화: ${birthTime}:${birthMinute || '00'} → ${normalizedBirthTime}`);

    const userInfo = {
      name,
      gender,
      birthType: `${birthType}${isLeapMonth ? '윤달' : ''}`,
      birthYear,
      birthMonth,
      birthDay,
      birthTime: normalizedBirthTime,
    };
    console.log('userInfo', userInfo);

    const makeOrderResponse = await fetch(SAJU_MAKER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userInfo,
        slug: 'moongirl',
      }),
    });

    if (!makeOrderResponse.ok) {
      throw new Error(
        `주문 생성 실패: ${makeOrderResponse.status} ${makeOrderResponse.statusText}`
      );
    }

    const makeOrderData = await makeOrderResponse.json();

    if (!makeOrderData.order3Id) {
      throw new Error('order3Id를 받지 못했습니다.');
    }

    console.log(`[INFO] 주문 생성 완료 - order3Id: ${makeOrderData.order3Id}`);

    // 2단계: 사주 결과 조회
    console.log('[INFO] 사주 결과 조회 시작...');

    const freeOrderPayload = {
      order3Id: makeOrderData.order3Id,
    };

    const freeOrderResponse = await fetch(SAJU_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(freeOrderPayload),
    });

    if (!freeOrderResponse.ok) {
      throw new Error(
        `사주 결과 조회 실패: ${freeOrderResponse.status} ${freeOrderResponse.statusText}`
      );
    }

    const sajuResult = await freeOrderResponse.json();

    const output = {
      saju: sajuResult?.saju ?? null,
      sinsals: sajuResult?.sinsals ?? null,
    };

    console.log('[INFO] 사주 결과 조회 완료:', JSON.stringify(output, null, 2));
    return output;
  } catch (error) {
    console.error('[ERROR] fetchSaju 실패:', error);
    throw error;
  }
}

/**
 * Reference API를 사용한 정확한 사주 팔자 계산
 * @param birthInput 생년월일 정보
 * @returns 사주 팔자 정보
 */
export async function getReferenceFourPillars(
  birthInput: BirthInput
): Promise<FourPillars | undefined> {
  try {
    // Year padding 수정: 4자리로 정규화
    let normalizedYear = birthInput.year;
    if (normalizedYear.length <= 2) {
      const year = parseInt(normalizedYear);
      // 현재 연도 기준으로 세기 판단
      if (year <= 30) {
        normalizedYear = `20${normalizedYear.padStart(2, '0')}`;
      } else {
        normalizedYear = `19${normalizedYear.padStart(2, '0')}`;
      }
    }
    normalizedYear = normalizedYear.padStart(4, '0');

    const normalizedCalendar = normalizeCalendarType(birthInput.calendar);
    const koreanCalendar = normalizedCalendar === 'solar' ? '양력' : '음력';

    const result = await getReferenceSajuData(
      birthInput.name || '테스트',
      birthInput.gender,
      koreanCalendar,
      normalizedYear,
      birthInput.month.padStart(2, '0'),
      birthInput.day.padStart(2, '0'),
      birthInput.hour.padStart(2, '0'),
      birthInput.minute?.padStart(2, '0')
    );

    const sajuData = result.saju.fortuneList.saju;

    return {
      year: {
        sky: sajuData.yearSky?.chinese || '甲',
        ground: sajuData.yearGround?.chinese || '子',
      },
      month: {
        sky: sajuData.monthSky?.chinese || '甲',
        ground: sajuData.monthGround?.chinese || '子',
      },
      day: {
        sky: sajuData.daySky?.chinese || '甲',
        ground: sajuData.dayGround?.chinese || '子',
      },
      time: {
        sky: sajuData.timeSky?.chinese || '甲',
        ground: sajuData.timeGround?.chinese || '子',
      },
    };
  } catch (error) {
    console.warn('Reference API 호출 실패, 백업 계산 사용:', error);
  }
}

/**
 * Reference API를 사용한 정확한 십성 분석
 * @param birthInput 생년월일 정보
 * @returns 각 기둥 천간의 십성 정보
 */
export async function getReferenceTenStars(birthInput: BirthInput): Promise<TenStars | undefined> {
  try {
    const normalizedCalendar = normalizeCalendarType(birthInput.calendar);
    const koreanCalendar = normalizedCalendar === 'solar' ? '양력' : '음력';
    const result = await getReferenceSajuData(
      birthInput.name || '테스트',
      birthInput.gender,
      koreanCalendar,
      birthInput.year,
      birthInput.month,
      birthInput.day,
      birthInput.hour,
      birthInput.minute,
      birthInput.isLeapMonth
    );

    const storedUnse = result.saju?.fortuneList?.storedUnse;
    if (!storedUnse) {
      throw new Error('API 응답에서 storedUnse 정보를 찾을 수 없습니다.');
    }

    return {
      yearSky: storedUnse.manseYearSkyRelation,
      yearGround: storedUnse.manseYearGroundRelation,
      monthSky: storedUnse.manseMonthSkyRelation,
      monthGround: storedUnse.manseMonthGroundRelation,
      daySky: storedUnse.manseDaySkyRelation,
      dayGround: storedUnse.manseDayGroundRelation,
      timeSky: storedUnse.manseTimeSkyRelation,
      timeGround: storedUnse.manseTimeGroundRelation,
    };
  } catch (error) {
    console.warn('[WARNING] 십성 Reference API 호출 실패, 백업 계산을 사용합니다.', error);
    return undefined;
  }
}

/**
 * Reference API를 사용한 정확한 오행 분석
 * @param birthInput 생년월일 정보
 * @returns 오행 분석 결과
 */
export async function getFiveElementsReference(
  birthInput: BirthInput
): Promise<FiveElements | undefined> {
  try {
    const normalizedCalendar = normalizeCalendarType(birthInput.calendar);
    const koreanCalendar = normalizedCalendar === 'solar' ? '양력' : '음력';
    const result = await getReferenceSajuData(
      birthInput.name || '테스트',
      birthInput.gender,
      koreanCalendar,
      birthInput.year.padStart(4, '20'),
      birthInput.month.padStart(2, '0'),
      birthInput.day.padStart(2, '0'),
      birthInput.hour.padStart(2, '0')
    );

    const unse = result.saju.fortuneList.storedUnse;
    return {
      wood: unse.fiveTreeNum || 0,
      fire: unse.fiveFireNum || 0,
      earth: unse.fiveSoilNum || 0,
      metal: unse.fiveIronNum || 0,
      water: unse.fiveWaterNum || 0,
    };
  } catch (error) {
    console.warn('Reference API 호출 실패, 백업 계산 사용:', error);
  }
}
