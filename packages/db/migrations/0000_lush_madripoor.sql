-- 소개팅 피벗 마이그레이션 (add-only, 멱등).
-- dev=prod 공유 DB: profiles/chats/messages/votes 는 이미 존재할 수 있으므로 IF NOT EXISTS 로 보호한다.
-- 신규 = profiles 소개팅 컬럼 7종 + matches 테이블. 파괴적 변경(drop) 없음.

CREATE TABLE IF NOT EXISTS "chats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"user_id" uuid NOT NULL,
	"visibility" varchar DEFAULT 'private' NOT NULL,
	"channel" varchar DEFAULT 'web' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "matches" (
	"user_a_id" uuid NOT NULL,
	"user_b_id" uuid NOT NULL,
	"a_liked_at" timestamp with time zone,
	"b_liked_at" timestamp with time zone,
	"matched_at" timestamp with time zone,
	"score" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "matches_user_a_id_user_b_id_pk" PRIMARY KEY("user_a_id","user_b_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chat_id" uuid NOT NULL,
	"role" varchar NOT NULL,
	"parts" json NOT NULL,
	"attachments" json,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"user_kakao_id" text,
	"name" text NOT NULL,
	"avatar_url" text,
	"theme" varchar DEFAULT 'system' NOT NULL,
	"gender" varchar,
	"birth_type" varchar,
	"birth_year" integer,
	"birth_month" integer,
	"birth_day" integer,
	"birth_time" varchar,
	"bio" text,
	"region" varchar(40),
	"photo_urls" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"pref_gender" varchar DEFAULT '무관' NOT NULL,
	"pref_age_min" integer,
	"pref_age_max" integer,
	"status" varchar DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_user_kakao_id_unique" UNIQUE("user_kakao_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "votes" (
	"chat_id" uuid NOT NULL,
	"message_id" uuid NOT NULL,
	"is_upvoted" boolean NOT NULL,
	CONSTRAINT "votes_chat_id_message_id_pk" PRIMARY KEY("chat_id","message_id")
);
--> statement-breakpoint
-- 기존 profiles 테이블에 소개팅 컬럼 추가 (이미 있으면 무시).
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "bio" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "region" varchar(40);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "photo_urls" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "pref_gender" varchar DEFAULT '무관' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "pref_age_min" integer;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "pref_age_max" integer;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "status" varchar DEFAULT 'draft' NOT NULL;--> statement-breakpoint
-- FK 제약 (이미 있으면 무시).
DO $$ BEGIN
	ALTER TABLE "chats" ADD CONSTRAINT "chats_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "matches" ADD CONSTRAINT "matches_user_a_id_profiles_user_id_fk" FOREIGN KEY ("user_a_id") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "matches" ADD CONSTRAINT "matches_user_b_id_profiles_user_id_fk" FOREIGN KEY ("user_b_id") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "votes" ADD CONSTRAINT "votes_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "votes" ADD CONSTRAINT "votes_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
