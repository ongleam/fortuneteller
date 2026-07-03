// fortune outbound adapter — GeoNames REST API 로 도시 좌표 동적 조회.
// (구 domain/time-correction.ts::fetchLongitudeByGeoNamesId 에서 추출 — domain 을 순수하게 유지.)
// 로컬 매핑(domain/time-correction.ts::getLongitudeByGeoNamesId)에 없을 때의 fallback.
// ponytail: 현재 호출처 없음(미사용). 로컬 매핑 miss 시 seam 으로 남겨둔다.

/**
 * GeoNames ID(=forceteller locationId)로 longitude(degrees E) 조회.
 * 무료 계정 필요 — username 을 환경변수 GEONAMES_USERNAME 에 둔다.
 *
 * @returns longitudeE 또는 호출 실패 시 null
 */
export async function fetchLongitudeByGeoNamesId(id: number): Promise<number | null> {
  const username = process.env.GEONAMES_USERNAME;
  if (!username) return null;
  try {
    const res = await fetch(
      `http://api.geonames.org/getJSON?geonameId=${id}&username=${encodeURIComponent(username)}`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { lng?: number | string };
    if (data.lng === undefined) return null;
    const lng = typeof data.lng === "string" ? Number(data.lng) : data.lng;
    return Number.isFinite(lng) ? lng : null;
  } catch {
    return null;
  }
}
