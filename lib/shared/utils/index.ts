import type { AssistantModelMessage, ToolModelMessage, UIMessage } from 'ai';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
// import type { Document } from '@/lib/infra/db/schema';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ApplicationError extends Error {
  info: string;
  status: number;
}

export const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.') as ApplicationError;

    error.info = await res.json();
    error.status = res.status;

    throw error;
  }

  return res.json();
};

export function getLocalStorage(key: string) {
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem(key) || '[]');
  }
  return [];
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

type ResponseMessageWithoutId = ToolModelMessage | AssistantModelMessage;
type ResponseMessage = ResponseMessageWithoutId & { id: string };

export function getMostRecentUserMessage(messages: Array<UIMessage>) {
  const userMessages = messages.filter((message) => message.role === 'user');
  return userMessages.at(-1);
}

export function getDocumentTimestampByIndex(documents: Array<Document>, index: number) {
  if (!documents) return new Date();
  if (index > documents.length) return new Date();

  return new Date();
}

export function getTrailingMessageId({
  messages,
}: {
  messages: Array<ResponseMessage>;
}): string | null {
  const trailingMessage = messages.at(-1);

  if (!trailingMessage) return null;

  return trailingMessage.id;
}

// 에러 메시지 포맷팅 for AI
export const formattingErrorMessage = (error: unknown) => {
  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'object'
        ? JSON.stringify(error)
        : String(error);
  return errorMessage;
};

export function getKSTDateTime() {
  const now = new Date();
  const kstDate = new Date(now.getTime() + 9 * 60 * 60 * 1000); // UTC+9(한국 시간)
  return kstDate.toISOString().replace('T', ' ').replace('Z', '').substring(0, 19);
}
export function formatObject(
  obj: any,
  options: {
    depth?: number; // 객체 중첩 깊이 (기본값: 2)
    colors?: boolean; // 색상 사용 여부 (기본값: false)
    maxArrayLength?: number; // 배열 최대 길이 (기본값: 10)
    compact?: boolean; // 출력을 한 줄로 압축할지 여부 (기본값: false)
  } = {}
): string {
  const defaultOptions = {
    depth: 2,
    colors: false,
    maxArrayLength: 10,
    compact: false,
    ...options,
  };

  return require('util').inspect(obj, defaultOptions);
}

/**
 * 객체를 콘솔에 로깅합니다.
 * KST 시간과 함께 객체를 가독성 있게 출력합니다.
 *
 * @param label - 로그 라벨
 * @param obj - 로깅할 객체
 * @param options - 포맷팅 옵션
 */
export function logObject(
  label: string,
  obj: any,
  options?: {
    depth?: number;
    colors?: boolean;
    maxArrayLength?: number;
    compact?: boolean;
  }
): void {
  console.log(`[${getKSTDateTime()}] [${label}] ${formatObject(obj, options)}`);
}

const executionTimes = new Map<string, number>();

// 실행 시간 측정 헬퍼 함수
export const measureExecutionTime = async <T>(
  functionName: string,
  fn: () => Promise<T>
): Promise<T> => {
  const startTime = Date.now();
  console.log(`[${getKSTDateTime()}] [성능측정] ${functionName} 시작`);

  try {
    const result = await fn();
    const endTime = Date.now();
    const duration = endTime - startTime;
    executionTimes.set(functionName, duration);
    console.log(`[${getKSTDateTime()}] [성능측정] ${functionName} 완료 (${duration}ms)`);
    return result;
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    executionTimes.set(functionName, duration);
    console.error(`[${getKSTDateTime()}] [성능측정] ${functionName} 실패 (${duration}ms)`, error);
    throw error;
  }
};

export const generateExecutionReport = () => {
  console.log('\n[성능측정] 실행 시간 리포트');
  console.log('========================');
  let totalTime = 0;

  // 실행 시간을 기준으로 내림차순 정렬
  const sortedTimes = Array.from(executionTimes.entries()).sort(([, a], [, b]) => b - a);

  sortedTimes.forEach(([name, duration]) => {
    console.log(`${name}: ${duration}ms`);
    totalTime += duration;
  });

  console.log('========================');
  console.log(`총 실행 시간: ${totalTime}ms`);
  console.log('========================\n');
};
