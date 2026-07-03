export function normalizeText(text: string): string {
  if (!text) {
    return "";
  }

  let processedText = text.trim();
  processedText = processedText.replace(/\s+/g, " ");
  processedText = processedText.replace(/\r\n/g, "\n");
  processedText = processedText.replace(/\n{3,}/g, "\n\n");

  // 텍스트 마지막의 . 제거
  if (processedText.endsWith(".")) {
    processedText = processedText.slice(0, -1);
  }

  return processedText;
}

export function removeMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1") // 볼드체 제거
    .replace(/\*(.*?)\*/g, "$1") // 이탤릭체 제거
    .replace(/`(.*?)`/g, "$1") // 인라인 코드 제거
    .replace(/```[\s\S]*?```/g, "") // 코드 블록 제거
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1") // 링크 제거
    .replace(/#{1,6}\s/g, "") // 헤더 제거
    .replace(/\n\s*[-*+]\s/g, "\n• ") // 리스트 통일
    .replace(/\n\s*\d+\.\s/g, "\n• ") // 숫자 리스트 통일
    .trim();
}
