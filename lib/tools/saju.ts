import { formattingErrorMessage } from '@/lib/utils';
import { tool } from 'ai';
import { z } from 'zod';
import { tools } from '@/config/prompts';
import { testSajuResult } from './test';
import { createServerClient } from '@/lib/supabase/server';
import { updateProfileSaju } from '@/lib/db/queries';

const GET_SAJU_PROMPTS = tools.getSaju;
const UPDATE_SAJU_PROFILE_PROMPTS = tools.updateSajuProfile;

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
  birthTime: string | null | undefined
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
      birthTime: birthTime || '',
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

    // console.log('[INFO] 사주 결과 조회 완료 -->', JSON.stringify(output, null, 2));

    return output;
  } catch (error) {
    console.error('[ERROR] fetchSaju 실패:', error);
    throw error;
  }
}

export const getSaju = () =>
  tool({
    description: GET_SAJU_PROMPTS.description,
    parameters: z.object({
      name: z.string().describe(GET_SAJU_PROMPTS.parameters.name.description),
      gender: z.enum(['남성', '여성']).describe(GET_SAJU_PROMPTS.parameters.gender.description),
      birthType: z
        .enum(['양력', '음력'])
        .default('양력')
        .describe(GET_SAJU_PROMPTS.parameters.birthType.description),
      birthYear: z.string().describe(GET_SAJU_PROMPTS.parameters.birthYear.description),
      birthMonth: z.string().describe(GET_SAJU_PROMPTS.parameters.birthMonth.description),
      birthDay: z.string().describe(GET_SAJU_PROMPTS.parameters.birthDay.description),
      birthTime: z
        .enum(['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22', '24'])
        .nullable()
        .optional()
        .describe(GET_SAJU_PROMPTS.parameters.birthTime.description),
    }),
    execute: async ({ name, gender, birthType, birthYear, birthMonth, birthDay, birthTime }) => {
      console.log(
        `[INFO] getSaju 호출: \nname: ${name}\ngender: ${gender}\nbirthType: ${birthType}\nbirthYear: ${birthYear}\nbirthMonth: ${birthMonth}\nbirthDay: ${birthDay}\nbirthTime: ${birthTime}`
      );

      try {
        const result = await fetchSaju(
          name,
          gender,
          birthType,
          birthYear,
          birthMonth,
          birthDay,
          birthTime
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

export const updateSajuProfile = () =>
  tool({
    description: UPDATE_SAJU_PROFILE_PROMPTS.description,
    parameters: z.object({
      gender: z
        .enum(['남성', '여성'])
        .describe(UPDATE_SAJU_PROFILE_PROMPTS.parameters.gender.description),
      birthType: z
        .enum(['양력', '음력'])
        .default('양력')
        .describe(UPDATE_SAJU_PROFILE_PROMPTS.parameters.birthType.description),
      birthYear: z.string().describe(UPDATE_SAJU_PROFILE_PROMPTS.parameters.birthYear.description),
      birthMonth: z
        .string()
        .describe(UPDATE_SAJU_PROFILE_PROMPTS.parameters.birthMonth.description),
      birthDay: z.string().describe(UPDATE_SAJU_PROFILE_PROMPTS.parameters.birthDay.description),
      birthTime: z
        .enum(['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22', '24'])
        .nullable()
        .optional()
        .describe(UPDATE_SAJU_PROFILE_PROMPTS.parameters.birthTime.description),
    }),
    execute: async ({ gender, birthType, birthYear, birthMonth, birthDay, birthTime }) => {
      console.log(
        `[INFO] updateSajuProfile 호출: \ngender: ${gender}\nbirthType: ${birthType}\nbirthYear: ${birthYear}\nbirthMonth: ${birthMonth}\nbirthDay: ${birthDay}\nbirthTime: ${birthTime}`
      );

      try {
        // 현재 로그인된 사용자 정보 가져오기
        const supabase = await createServerClient();
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error('사용자 인증 정보를 가져올 수 없습니다.');
        }

        // 사주 정보를 프로필에 업데이트
        const updatedProfile = await updateProfileSaju({
          id: user.id,
          gender,
          birth_type: birthType,
          birth_year: parseInt(birthYear),
          birth_month: parseInt(birthMonth),
          birth_day: parseInt(birthDay),
          birth_time: birthTime || null,
        });

        console.log(`[INFO] 프로필 사주 정보 업데이트 완료: ${user.id}`);

        return {
          success: true,
          message: '사주 정보가 프로필에 저장되었습니다.',
          profile: {
            gender: updatedProfile.gender,
            birthType: updatedProfile.birth_type,
            birthYear: updatedProfile.birth_year,
            birthMonth: updatedProfile.birth_month,
            birthDay: updatedProfile.birth_day,
            birthTime: updatedProfile.birth_time,
          },
        };
      } catch (error) {
        console.error('[ERROR] updateSajuProfile 실행 실패:', formattingErrorMessage(error));

        return {
          success: false,
          error: formattingErrorMessage(error),
          message: '사주 정보를 프로필에 저장하는 중 오류가 발생했습니다.',
        };
      }
    },
  });
