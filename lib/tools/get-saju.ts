import { formattingErrorMessage } from '@/lib/utils';
import { tool } from 'ai';
import { z } from 'zod';
import { tools } from '@/config/prompts';
import { testSajuResult } from './test';

const TOOL_PROMPTS = tools.getSaju;

const SAJU_MAKER_API_URL = 'https://api.aifortunedoctor.com/order3/make';
const SAJU_API_URL = 'https://api.aifortunedoctor.com/order3/free';

// 타입 정의
interface UserInfo {
  name: string;
  gender: string;
  birthType: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  birthTime: string;
}

interface Order3MakeResponse {
  statusCode: number;
  message: string;
  order3Id: number;
}

interface Order3FreePayload {
  order3Id: number;
}

interface SajuOutput {
  saju: any | null;
  sinsals: any | null;
  today: string;
}

async function fetchSaju(
  name: string,
  gender: string,
  birthType: string,
  birthYear: string,
  birthMonth: string,
  birthDay: string,
  birthTime: string
): Promise<SajuOutput> {
  try {
    // 1단계: order3Id 생성
    console.log('[INFO] 사주 주문 생성 시작...');

    const userInfo: UserInfo = {
      name,
      gender,
      birthType,
      birthYear,
      birthMonth,
      birthDay,
      birthTime,
    };

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

    const makeOrderData: Order3MakeResponse = await makeOrderResponse.json();

    if (!makeOrderData.order3Id) {
      throw new Error('order3Id를 받지 못했습니다.');
    }

    console.log(`[INFO] 주문 생성 완료 - order3Id: ${makeOrderData.order3Id}`);

    // 2단계: 사주 결과 조회
    console.log('[INFO] 사주 결과 조회 시작...');

    const freeOrderPayload: Order3FreePayload = {
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

    const output: SajuOutput = {
      saju: sajuResult?.saju ?? null,
      sinsals: sajuResult?.sinsals ?? null,
      today: new Date().toLocaleString('ko-KR', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
    };

    console.log('[INFO] 사주 결과 조회 완료 -->', JSON.stringify(output, null, 2));

    return output;
  } catch (error) {
    console.error('[ERROR] fetchSaju 실패:', error);
    throw error;
  }
}

export const getSaju = () =>
  tool({
    description: TOOL_PROMPTS.description,
    parameters: z.object({
      name: z.string().describe(TOOL_PROMPTS.parameters.name.description),
      gender: z.string().describe(TOOL_PROMPTS.parameters.gender.description),
      birthType: z.string().describe(TOOL_PROMPTS.parameters.birthType.description),
      birthYear: z.string().describe(TOOL_PROMPTS.parameters.birthYear.description),
      birthMonth: z.string().describe(TOOL_PROMPTS.parameters.birthMonth.description),
      birthDay: z.string().describe(TOOL_PROMPTS.parameters.birthDay.description),
      birthTime: z.string().optional().describe(TOOL_PROMPTS.parameters.birthTime.description),
    }),
    execute: async ({ name, gender, birthType, birthYear, birthMonth, birthDay, birthTime }) => {
      console.log(
        `[INFO] getSaju 호출: '${name}, ${gender}, ${birthType}, ${birthYear}, ${birthMonth}, ${birthDay}, ${birthTime}'`
      );

      try {
        // birthTime이 없는 경우 빈 문자열로 설정
        const formattedBirthTime = birthTime || '';

        const result = await fetchSaju(
          name,
          gender,
          birthType,
          birthYear,
          birthMonth,
          birthDay,
          formattedBirthTime
        );

        return result;
      } catch (error) {
        console.error('[ERROR] getSaju 실행 실패:', formattingErrorMessage(error));

        // API 호출 실패 시 테스트 결과로 대체 (개발용)
        console.log('[INFO] API 호출 실패로 테스트 결과 반환');

        const fallbackOutput: SajuOutput = {
          saju: testSajuResult?.saju ?? null,
          sinsals: testSajuResult?.sinsals ?? null,
          today: new Date().toLocaleString('ko-KR', {
            timeZone: 'Asia/Seoul',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          }),
        };

        return fallbackOutput;
      }
    },
  });
