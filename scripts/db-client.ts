/**
 * Database client for scripts
 * This file provides database access without server-only restrictions
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { solarTerm, type SolarTerm } from '@/lib/infra/db/schema';
import { eq, and, asc } from 'drizzle-orm';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Verify environment variable is loaded
if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

console.log('🔗 Connecting to database:', process.env.POSTGRES_URL.replace(/:[^:@]*@/, ':****@'));

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
export const db = drizzle(client);

// Solar Term functions for scripts
export async function getSolarTermsByYear(year: number): Promise<SolarTerm[]> {
  try {
    return await db
      .select()
      .from(solarTerm)
      .where(eq(solarTerm.year, year))
      .orderBy(asc(solarTerm.month), asc(solarTerm.day));
  } catch (error) {
    console.error('Failed to get solar terms by year from database');
    throw error;
  }
}

export async function getSolarTermByYearAndName(
  year: number,
  termName: string
): Promise<SolarTerm | null> {
  try {
    const [result] = await db
      .select()
      .from(solarTerm)
      .where(and(eq(solarTerm.year, year), eq(solarTerm.term_name, termName)))
      .limit(1);
    return result || null;
  } catch (error) {
    console.error('Failed to get solar term by year and name from database');
    throw error;
  }
}

export async function insertSolarTerms(solarTerms: Array<Omit<SolarTerm, 'id' | 'created_at'>>) {
  try {
    return await db.insert(solarTerm).values(solarTerms);
  } catch (error) {
    console.error('Failed to insert solar terms into database');
    throw error;
  }
}
