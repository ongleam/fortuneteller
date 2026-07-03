// DB 클라이언트 — drizzle 인스턴스(값) + 타입. 쿼리는 모듈 infra 가 소유한다(ongleam 패턴).
import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.POSTGRES_URL!);
export const db = drizzle(client);

/** UoW/repository 가 트랜잭션(tx)을 타이핑할 때 사용. */
export type DbClient = typeof db;
