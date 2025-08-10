/**
 * 텍스트에서 불필요한 연속 개행, 공백 등을 정리합니다.
 * - 연속 개행을 한 줄로
 * - 앞뒤 공백/개행 제거
 * - 여러 연속 공백을 한 칸으로
 * - <br> 태그를 \n으로 변환
 */

export function normText(raw: string | undefined): string {
  if (!raw) return '';
  return raw
    .replace(/\n{2,}/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

/**
 * XML 스타일의 텍스트에서 XML 태그를 제거하고 내용만 추출합니다.
 * - <tag>content</tag> → content
 * - <tag attr="value">content</tag> → content
 * - 중첩된 태그도 처리
 */
export function removeXmlTags(text: string): string {
  if (!text) return '';

  // XML 태그 제거 (속성이 있는 경우도 처리)
  return (
    text
      .replace(/<[^>]+>([^<]*)<\/[^>]+>/g, '$1')
      // 남은 단일 태그 제거
      .replace(/<[^>]+>/g, '')
      // 연속된 공백 정리
      .trim()
  );
}

/**
 * XML 스타일의 텍스트를 전처리합니다.
 * - XML 태그 제거
 * - 불필요한 공백/개행 정리
 */
export function preprocessXmlText(text: string | undefined): string {
  if (!text) return '';
  return normText(removeXmlTags(text));
}
