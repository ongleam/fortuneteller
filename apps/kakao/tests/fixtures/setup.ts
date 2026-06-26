// kakao 통합 테스트 환경 설정.
// 이 테스트는 DB·LLM·HTTP 외부 의존성을 모두 jest.mock 으로 대체하므로
// 실제 .env 로드(dotenv)는 필요 없다. core import 시점에 참조될 수 있는
// 변수의 더미 값만 설정한다.

if (!process.env.NODE_ENV) {
  (process.env as any).NODE_ENV = "test";
}

const dummyVars: Record<string, string> = {
  NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "test_anon_key",
};

for (const [key, value] of Object.entries(dummyVars)) {
  if (!process.env[key]) process.env[key] = value;
}
