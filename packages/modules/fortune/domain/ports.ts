// fortune 도메인 포트 — 외부 I/O 계약. infra/ 가 구현하고(weather-client) application 이 소비한다.

/** 위경도 → 현재 날씨 조회 클라이언트. */
export interface WeatherClient {
  fetchWeather(latitude: number, longitude: number): Promise<unknown>;
}
