// profile 도메인 값 객체 — 사주 프로필 입력·결과의 원시 타입.
// enum 대신 as const/union: DB·zod 문자열 리터럴("남성"/"양력"/시각)과 직접 호환.

export type Gender = "남성" | "여성";
export type Calendar = "양력" | "음력";
export type BirthHour =
  | "00"
  | "02"
  | "04"
  | "06"
  | "08"
  | "10"
  | "12"
  | "14"
  | "16"
  | "18"
  | "20"
  | "22"
  | "24";

export interface UpdateSajuProfileInput {
  name: string;
  gender: Gender;
  calendar: Calendar;
  year: string;
  month: string;
  day: string;
  hour?: BirthHour | null;
}

export interface UpsertProfileResult {
  success: boolean;
  skipped?: boolean;
  error?: string;
}

/** 영속된 사주 프로필의 도메인 shape (뷰·repo 반환용). */
export interface SajuProfile {
  name: string | null;
  gender: string | null;
  birth_type: string | null;
  birth_year: number | null;
  birth_month: number | null;
  birth_day: number | null;
  birth_time: string | null;
}
