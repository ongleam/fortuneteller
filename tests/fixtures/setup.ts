const { config } = require('dotenv');
const { resolve } = require('path');

// 테스트용 환경 변수 로드 (프로젝트 루트의 .env.local 파일 사용)
config({ path: resolve(__dirname, '../../.env.local') });

// 기본 환경 변수 설정
if (!process.env.NODE_ENV) {
  (process.env as any).NODE_ENV = 'test';
}

// 통합 테스트에서만 필요한 환경 변수들 (단위 테스트에서는 검증하지 않음)
const integrationRequiredVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];

// 환경 변수가 없으면 더미 값으로 설정 (단위 테스트 시 실제로 사용되지 않음)
integrationRequiredVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.warn(`Warning: Missing environment variable: ${envVar}, using dummy value for testing`);
    process.env[envVar] = `test_${envVar.toLowerCase()}`;
  }
});

console.log('✅ 테스트 환경 설정 완료');
