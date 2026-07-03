// profile 도메인 값 객체 — 사주 프로필 입력·결과의 원시 타입.

export interface UpsertProfileResult {
  success: boolean;
  skipped?: boolean;
  error?: string;
}
