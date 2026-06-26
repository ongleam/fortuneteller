/**
 * 스크립트용 사주 Reference 유틸리티
 * lib/core/saju/reference.ts의 함수들을 server-only 의존성 없이 재사용
 */

const SAJU_MAKER_API_URL = "https://api.aifortunedoctor.com/order3/make";
const SAJU_API_URL = "https://api.aifortunedoctor.com/order3/free";

export function normalizeCalendarType(calendar: string): "solar" | "lunar" {
  const lowerCalendar = calendar.toLowerCase().trim();
  if (lowerCalendar === "양력" || lowerCalendar === "solar") {
    return "solar";
  }
  if (lowerCalendar === "음력" || lowerCalendar === "lunar") {
    return "lunar";
  }
  console.warn(`알 수 없는 달력 타입: ${calendar}, 기본값 'solar' 사용`);
  return "solar";
}

function normalizeBirthTime(
  hour: string | null | undefined,
  minute?: string | null | undefined,
): string {
  const h = parseInt(hour || "0") || 0;
  const m = parseInt(minute || "0") || 0;
  const totalMinutes = h * 60 + m;

  if (totalMinutes < 90) return "00";
  if (totalMinutes < 210) return "02";
  if (totalMinutes < 330) return "04";
  if (totalMinutes < 450) return "06";
  if (totalMinutes < 570) return "08";
  if (totalMinutes < 690) return "10";
  if (totalMinutes < 810) return "12";
  if (totalMinutes < 930) return "14";
  if (totalMinutes < 1050) return "16";
  if (totalMinutes < 1170) return "18";
  if (totalMinutes < 1290) return "20";
  if (totalMinutes < 1410) return "22";
  return "24";
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
  isLeapMonth?: boolean | null | undefined,
) {
  try {
    const normalizedBirthTime = normalizeBirthTime(birthTime || "0", birthMinute || "0");

    const userInfo = {
      name,
      gender,
      birthType: `${birthType}${isLeapMonth ? "윤달" : ""}`,
      birthYear,
      birthMonth,
      birthDay,
      birthTime: normalizedBirthTime,
    };

    console.log(`  요청 정보:`, JSON.stringify(userInfo, null, 2));

    const makeOrderResponse = await fetch(SAJU_MAKER_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userInfo, slug: "moongirl" }),
    });

    if (!makeOrderResponse.ok) {
      throw new Error(
        `주문 생성 실패: ${makeOrderResponse.status} ${makeOrderResponse.statusText}`,
      );
    }

    const makeOrderData = await makeOrderResponse.json();
    if (!makeOrderData.order3Id) {
      throw new Error("order3Id를 받지 못했습니다.");
    }

    const freeOrderResponse = await fetch(SAJU_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order3Id: makeOrderData.order3Id }),
    });

    if (!freeOrderResponse.ok) {
      throw new Error(
        `사주 결과 조회 실패: ${freeOrderResponse.status} ${freeOrderResponse.statusText}`,
      );
    }

    const sajuResult = await freeOrderResponse.json();
    return {
      saju: sajuResult?.saju ?? null,
      sinsals: sajuResult?.sinsals ?? null,
    };
  } catch (error) {
    console.error("[ERROR] getReferenceSajuData 실패:", error);
    throw error;
  }
}
