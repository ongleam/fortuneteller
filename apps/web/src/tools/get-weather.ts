// AI SDK 어댑터 — 날씨 조회(fortune 모듈 handler).
import { tool } from "ai";
import { z } from "zod";
import { fetchWeather } from "@fortuneteller/modules/fortune/application/handlers";

export const getWeather = tool({
  description:
    "Get the current weather at a location. If user only provides a `city` or `location` name, ALWAYSpredict the latitude and longitude from the city name.",
  inputSchema: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  execute: async ({ latitude, longitude }) => fetchWeather(latitude, longitude),
});
