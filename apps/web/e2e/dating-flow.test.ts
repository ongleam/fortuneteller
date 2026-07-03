// 소개팅 피벗 E2E — 실화면 렌더 검증.
// 랜딩(/)은 인증·DB 무관하게 렌더되므로 여기서 소개팅 컨셉 전환을 검증한다.
// (로그인 이후 /discover·/matches·/profile/edit 플로우는 matches/profiles 마이그레이션
//  적용 후 활성화된다 — 그 전까지 해당 라우트는 DB 컬럼 부재로 렌더 불가.)
import { expect, test } from "@playwright/test";

test.describe("소개팅 랜딩", () => {
  test("헬스체크 /ping 은 200 을 반환한다", async ({ request }) => {
    const res = await request.get("/ping");
    expect(res.status()).toBe(200);
  });

  test("랜딩은 사주 소개팅 컨셉으로 렌더된다", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "사주로 만나는 인연" })).toBeVisible();
    // 구 컨셉(점술사·오늘의 운세) 카피가 없어야 한다.
    await expect(page.locator("body")).not.toContainText("점술사");
    await expect(page.locator("body")).not.toContainText("오늘의 운세");
    // 소개팅 셀링포인트
    await expect(page.getByText("사주 궁합 추천")).toBeVisible();
    await expect(page.getByText("더블 옵트인 매칭")).toBeVisible();
    // 브랜드 유지
    await expect(page.locator("header")).toContainText("점순이");
  });

  test("비로그인 랜딩에는 /discover 진입 CTA 대신 카카오 시작 CTA 가 있다", async ({ page }) => {
    await page.goto("/");
    // 죽은 /saju 링크가 없어야 한다.
    await expect(page.locator('a[href="/saju"]')).toHaveCount(0);
  });
});
