import { createGoogleGenerativeAI } from '@ai-sdk/google';

// Gemini API 키(GEMINI_API_KEY)를 명시적으로 주입한 Google Generative AI 프로바이더.
// SDK 기본 환경변수(GOOGLE_GENERATIVE_AI_API_KEY) 대신 GEMINI_API_KEY를 사용한다.
export const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});
