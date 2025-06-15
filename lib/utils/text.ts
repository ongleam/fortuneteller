export function normalizeText(text: string): string {
  if (!text) {
    return '';
  }

  let processedText = text.trim();
  processedText = processedText.replace(/\s+/g, ' ');
  processedText = processedText.replace(/\r\n/g, '\n');
  processedText = processedText.replace(/\n{3,}/g, '\n\n');

  // 텍스트 마지막의 . 제거
  if (processedText.endsWith('.')) {
    processedText = processedText.slice(0, -1);
  }

  return processedText;
}
