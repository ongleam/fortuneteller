"use server";

import { solarToLunar, lunarToSolar } from "@fortuneteller/saju/calendar";

export async function convertSolarToLunarAction(
  year: number,
  month: number,
  day: number,
): Promise<{
  year: number;
  month: number;
  day: number;
  isLeapMonth: boolean;
} | null> {
  try {
    const solarDate = new Date(year, month - 1, day);
    return solarToLunar(solarDate);
  } catch (error) {
    console.error("Solar to lunar conversion error:", error);
    return null;
  }
}

export async function convertLunarToSolarAction(
  year: number,
  month: number,
  day: number,
  isLeapMonth: boolean = false,
): Promise<{
  year: number;
  month: number;
  day: number;
} | null> {
  try {
    return lunarToSolar(year, month, day, isLeapMonth);
  } catch (error) {
    console.error("Lunar to solar conversion error:", error);
    return null;
  }
}
