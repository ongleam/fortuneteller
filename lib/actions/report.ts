'use server';

import { ReportFormData } from '@/lib/types/notion';
import { createReport } from '@/lib/notion/client';
import { createServerClient } from '@/lib/supabase/server';

export async function submitReport(
  formData: ReportFormData
): Promise<{ success: boolean; reportId?: string; error?: string }> {
  try {
    // 필수 필드 검증
    if (!formData.title || !formData.description || !formData.type) {
      return {
        success: false,
        error: '모든 필수 필드를 입력해주세요.',
      };
    }

    // 현재 사용자 정보 가져오기 (선택적)
    let userId: string | undefined;
    let userName: string | undefined;

    try {
      const supabase = await createServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        userId = user.id;
        userName = user.user_metadata?.name || user.email || undefined;
      }
    } catch (error) {
      console.error('세션 정보 조회 실패:', error);
      // 세션 정보가 없어도 계속 진행
    }

    // 노션에 리포트 생성
    const reportId = await createReport(formData, userId, userName, formData.chatId);

    return {
      success: true,
      reportId,
    };
  } catch (error: any) {
    console.error('리포트 제출 실패:', error);

    return {
      success: false,
      error: error.message || '리포트 제출 중 오류가 발생했습니다.',
    };
  }
}
