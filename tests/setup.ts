const { config } = require('dotenv');
const { resolve } = require('path');

// 테스트용 환경 변수 로드 (프로젝트 루트의 .env.test 파일 사용)
config({ path: resolve(__dirname, '../.env.local') });

// 환경 변수 검증
const requiredEnvVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
