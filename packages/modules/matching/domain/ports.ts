// matching 도메인 포트 — 영속성 계약. infra(@fortuneteller/db)가 tx 바인딩으로 구현한다.

/** 궁합 계산에 필요한 사주 프로필 최소 형태(profiles 컬럼). */
export interface SajuProfile {
  gender: string | null;
  birth_type: string | null;
  birth_year: number | null;
  birth_month: number | null;
  birth_day: number | null;
  birth_time: string | null;
}

/** matches 테이블 한 행(관계 상태). */
export interface MatchRow {
  user_a_id: string;
  user_b_id: string;
  a_liked_at: Date | null;
  b_liked_at: Date | null;
  matched_at: Date | null;
  score: number;
}

/** 어느 쪽이 좋아요를 눌렀는가 — canonical 정렬 기준. */
export type LikeSide = "a" | "b";

/** 매칭 영속성 포트. 모든 인자는 canonical 정렬(user_a_id < user_b_id)을 전제한다. */
export interface MatchRepository {
  getMatch(args: { userAId: string; userBId: string }): Promise<MatchRow | null>;
  /** 두 유저의 사주 프로필을 tx 안에서 함께 읽는다(궁합 점수용). */
  getSajuProfiles(args: {
    userAId: string;
    userBId: string;
  }): Promise<{ a: SajuProfile | null; b: SajuProfile | null }>;
  /** 해당 쪽 *_liked_at 을 세팅하며 행을 upsert(최초 생성 시 score 기록). */
  upsertLike(args: {
    userAId: string;
    userBId: string;
    side: LikeSide;
    likedAt: Date;
    score: number;
  }): Promise<void>;
  /** 양쪽 좋아요가 모두 찼을 때 matched_at 을 세팅한다. */
  updateMatchedAt(args: { userAId: string; userBId: string; matchedAt: Date }): Promise<void>;
}

/** matching 모듈 UoW 가 제공하는 repo 번들. */
export interface MatchingRepos {
  matchRepo: MatchRepository;
}
