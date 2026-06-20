import { tool } from 'ai';
import { z } from 'zod';

export const getWeather = tool({
  description:
    'Get the current weather at a location. If user only provides a `city` or `location` name, ALWAYSpredict the latitude and longitude from the city name.',
  inputSchema: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  execute: async ({ latitude, longitude }) => {
    console.log(`[INFO] getWeather calling : '${latitude}, ${longitude}'`);

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`
    );

    const weatherData = await response.json();
    return weatherData;
  },
});
