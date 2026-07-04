// 소개팅 피벗 E2E — 실화면 렌더 검증.
// 랜딩(/)은 인증·DB 무관하게 렌더된다. 상세 페이지는 미들웨어가 익명 세션을 부여하므로
// 로그인 없이도 렌더된다(DB 마이그레이션 적용 후 200). 더블옵트인 상태전이는
// matching/tests/integration/like-user.test.ts(인메모리 fake)로 결정적 검증.
import { expect, test } from "@playwright/test";

test.describe("소개팅 랜딩(조선풍)", () => {
  test("헬스체크 /ping 은 200 을 반환한다", async ({ request }) => {
    const res = await request.get("/ping");
    expect(res.status()).toBe(200);
  });

  test("랜딩은 사주 소개팅 컨셉으로 렌더된다", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "사주로 인연을 잇다" })).toBeVisible();
    // 구 컨셉(점술사·오늘의 운세) 카피가 없어야 한다.
    await expect(page.locator("body")).not.toContainText("점술사");
    await expect(page.locator("body")).not.toContainText("오늘의 운세");
    await expect(page.locator("header")).toContainText("점순이");
  });

  test("랜딩에 브랜드 모티프(세 가지 약속·오행·진행순서)가 보인다", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("점순이의 세 가지 약속")).toBeVisible();
    await expect(page.getByText("궁합으로 추천")).toBeVisible();
    await expect(page.getByText("서로 좋아요")).toBeVisible();
    await expect(page.getByText("간단한 시작")).toBeVisible();
    await expect(page.getByText("이렇게 이어집니다")).toBeVisible();
    // 오행 타일
    for (const el of ["木", "火", "土", "金", "水"]) {
      await expect(page.getByText(el, { exact: true }).first()).toBeVisible();
    }
  });

  test("죽은 /saju 링크가 없다", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('a[href="/saju"]')).toHaveCount(0);
  });
});

test.describe("소개팅 상세 페이지 (익명 세션)", () => {
  // 미들웨어가 익명 세션을 부여 → 로그인 없이도 아래 페이지가 200 으로 렌더된다.
  test("/profile/edit — 命式 프로필 편집 폼", async ({ page }) => {
    const res = await page.goto("/profile/edit");
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "프로필 적기" })).toBeVisible();
    await expect(page.getByTestId("profile-form")).toBeVisible();
    await expect(page.getByTestId("gender")).toBeVisible();
  });

  test("/discover — 宮合 궁합 추천 피드", async ({ page }) => {
    const res = await page.goto("/discover");
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "궁합 추천" })).toBeVisible();
  });

  test("/matches — 因緣 매칭 목록", async ({ page }) => {
    const res = await page.goto("/matches");
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "매칭 목록" })).toBeVisible();
  });
});
