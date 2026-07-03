// 헬스체크 엔드포인트 — playwright webServer 준비 확인(playwright.config.ts 의 webServer.url)용.
export const dynamic = "force-dynamic";

export function GET() {
  return new Response("pong", { status: 200 });
}
