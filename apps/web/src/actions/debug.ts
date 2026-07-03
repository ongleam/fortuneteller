"use server";

import { calculateSajuDebug } from "@fortuneteller/modules/fortune/application/handlers";
import type {
  BirthInput,
  FourPillars,
  TenStars,
  FiveElements,
} from "@fortuneteller/modules/fortune/domain/value-objects";

export async function calculateSajuAction(birthInput: BirthInput): Promise<{
  local?: FourPillars;
  localTenStars?: TenStars;
  localFiveElements?: FiveElements;
  error?: string;
}> {
  try {
    return await calculateSajuDebug(birthInput);
  } catch (error) {
    return { error: (error as Error).message };
  }
}
