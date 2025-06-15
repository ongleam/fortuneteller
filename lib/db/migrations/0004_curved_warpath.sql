ALTER TABLE "profiles" ADD COLUMN "user_kakao_id" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_kakao_id_unique" UNIQUE("user_kakao_id");