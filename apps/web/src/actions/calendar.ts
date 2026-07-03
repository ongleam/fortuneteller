"use server";

import {
  convertSolarToLunar,
  convertLunarToSolar,
} from "@fortuneteller/modules/fortune/application/handlers";

export async function convertSolarToLunarAction(
  year: number,
  month: number,
  day: number,
): Promise<{ year: number; month: number; day: number; isLeapMonth: boolean } | null> {
  try {
    return convertSolarToLunar(year, month, day);
  } catch (error) {
    console.error("Solar to lunar conversion error:", error);
    return null;
  }
}

export async function convertLunarToSolarAction(
  year: number,
  month: number,
  day: number,
  isLeapMonth = false,
): Promise<{ year: number; month: number; day: number } | null> {
  try {
    return convertLunarToSolar(year, month, day, isLeapMonth);
  } catch (error) {
    console.error("Lunar to solar conversion error:", error);
    return null;
  }
}
