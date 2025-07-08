const HARMONY_API_URL = 'https://api.aifortunedoctor.com/harmony/manse';

// 궁합 API 요청 타입
interface HarmonyPayload {
  uuid: string;
  ip: string;
  ipCity: string;
  ipLatitude: string;
  ipLongitude: string;
  productCode: string;
  serviceName: string;
  servicePrice: number;
  name1: string;
  birthday1: string;
  time1: string;
  birthdayType1: 'SOLAR' | 'LUNAR';
  gender1: 'MALE' | 'FEMALE';
  name2: string;
  birthday2: string;
  time2: string;
  birthdayType2: 'SOLAR' | 'LUNAR';
  gender2: 'MALE' | 'FEMALE';
}

// 궁합 API 응답 타입
interface HarmonyResponse {
  success: boolean;
  data?: any;
  message?: string;
  harmony?: {
    compatibility: number;
    analysis: string;
    advice: string;
  };
}

// 궁합 결과 출력 타입
export interface HarmonyOutput {
  compatibility: number | null;
  analysis: string | null;
  advice: string | null;
  rawData?: any;
}

/**
 * 생년월일을 YYYYMMDD 형식으로 변환
 */
function formatBirthday(year: string, month: string, day: string): string {
  const formattedMonth = month.padStart(2, '0');
  const formattedDay = day.padStart(2, '0');
  return `${year}${formattedMonth}${formattedDay}`;
}

/**
 * 성별을 API 형식으로 변환
 */
function formatGender(gender: string): 'MALE' | 'FEMALE' {
  return gender === '남성' ? 'MALE' : 'FEMALE';
}

/**
 * 생일 타입을 API 형식으로 변환
 */
function formatBirthType(birthType: string): 'SOLAR' | 'LUNAR' {
  return birthType === '양력' ? 'SOLAR' : 'LUNAR';
}

/**
 * 생시를 API 형식으로 변환 (시간대)
 */
function formatBirthTime(birthTime: string | null | undefined): string {
  if (!birthTime) return '12'; // 기본값: 12시 (정오)
  return birthTime.padStart(2, '0');
}

/**
 * 연애 궁합을 조회하는 함수
 */
export async function fetchHarmony(
  // 첫 번째 사람 정보
  name1: string,
  gender1: string,
  birthType1: string,
  birthYear1: string,
  birthMonth1: string,
  birthDay1: string,
  birthTime1: string | null | undefined,
  // 두 번째 사람 정보
  name2: string,
  gender2: string,
  birthType2: string,
  birthYear2: string,
  birthMonth2: string,
  birthDay2: string,
  birthTime2: string | null | undefined
): Promise<any> {
  try {
    console.log('[INFO] 궁합 조회 시작...');

    const payload: HarmonyPayload = {
      uuid: `xx`,
      ip: 'xx',
      ipCity: 'xx',
      ipLatitude: 'xx',
      ipLongitude: 'xx',
      productCode: '30',
      serviceName: '(AI 궁합) 인공지능이 봐주는 우리 궁합',
      servicePrice: 8900,
      name1,
      birthday1: formatBirthday(birthYear1, birthMonth1, birthDay1),
      time1: formatBirthTime(birthTime1),
      birthdayType1: formatBirthType(birthType1),
      gender1: formatGender(gender1),
      name2,
      birthday2: formatBirthday(birthYear2, birthMonth2, birthDay2),
      time2: formatBirthTime(birthTime2),
      birthdayType2: formatBirthType(birthType2),
      gender2: formatGender(gender2),
    };

    console.log('[INFO] 궁합 API 호출 - payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(HARMONY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const harmonyResult: HarmonyResponse = await response.json();

    console.log('[INFO] 궁합 조회 완료', JSON.stringify(harmonyResult, null, 2));
    return harmonyResult;
  } catch (error) {
    console.error('[ERROR] fetchHarmony 실패:', error);
    throw error;
  }
}
