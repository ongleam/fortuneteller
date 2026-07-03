// profile 도메인 포트 — 영속성 계약. infra(@fortuneteller/db)가 tx 바인딩으로 구현한다.
import type {
  UpdateSajuProfileInput,
  SajuProfile,
} from "@fortuneteller/modules/profile/domain/value-objects";

/** Supabase 유저의 최소 형태(프로필 upsert 입력). */
export interface AuthUser {
  id: string;
  is_anonymous?: boolean;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}

/** 프로필 영속성 포트. */
export interface ProfileRepository {
  updateSajuProfile(kakaoUserId: string, input: UpdateSajuProfileInput): Promise<SajuProfile>;
  upsertProfile(args: { userId: string; name: string; avatarUrl: string | null }): Promise<void>;
}

/** profile 모듈 UoW 가 제공하는 repo 번들. */
export interface ProfileRepos {
  profileRepo: ProfileRepository;
}
