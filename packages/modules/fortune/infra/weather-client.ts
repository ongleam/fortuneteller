// fortune outbound adapter — 현재 날씨 조회(open-meteo). domain/ports.ts 의 WeatherClient 구현.
// (구 application/handlers.ts::fetchWeather 에서 추출.)
import type { WeatherClient } from "../domain/ports";

async function fetchWeather(latitude: number, longitude: number): Promise<unknown> {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`,
  );
  return response.json();
}

/** WeatherClient 포트 구현체. */
export const weatherClient = {
  fetchWeather,
} satisfies WeatherClient;
