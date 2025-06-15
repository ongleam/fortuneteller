import { z } from 'zod';

/**
 * 생성된 파일의 정보를 나타내는 인터페이스
 */
export interface GeneratedFile {
  /** base64로 인코딩된 파일 데이터 */
  readonly base64: string;
  /** Uint8Array 형태의 파일 데이터 */
  readonly uint8Array: Uint8Array;
  /** 파일의 MIME 타입 */
  readonly mimeType: string;
}

/**
 * 추론 상세 정보를 나타내는 타입
 */
export type ReasoningDetail =
  | {
      type: 'text';
      text: string;
      signature?: string;
    }
  | {
      type: 'redacted';
      data: string;
    };

/**
 * 소스 정보를 나타내는 타입
 */
export type Source = {
  type: string;
  content: string;
  metadata?: Record<string, unknown>;
};

/**
 * 언어 모델 사용량을 나타내는 인터페이스
 */
export interface LanguageModelUsage {
  /** 프롬프트에 사용된 토큰 수 */
  readonly promptTokens: number;
  /** 완성에 사용된 토큰 수 */
  readonly completionTokens: number;
  /** 총 사용된 토큰 수 (promptTokens + completionTokens) */
  readonly totalTokens: number;
}

/**
 * 생성이 종료된 이유를 나타내는 타입
 */
export type FinishReason = 'stop' | 'length' | 'content_filter' | 'tool_calls';

/**
 * 모델 제공자의 경고를 나타내는 타입
 */
export type CallWarning = {
  type: string;
  message: string;
};

/**
 * 언어 모델 요청 메타데이터를 나타내는 인터페이스
 */
export interface LanguageModelRequestMetadata {
  /** 원시 요청 HTTP 본문 (JSON이 문자열화된 형태) */
  readonly body?: string;
}

/**
 * 언어 모델 응답 메타데이터를 나타내는 인터페이스
 */
export interface LanguageModelResponseMetadata {
  /** 생성된 응답의 ID */
  readonly id: string;
  /** 생성된 응답의 시작 타임스탬프 */
  readonly timestamp: Date;
  /** 응답 생성에 사용된 모델의 ID */
  readonly modelId: string;
  /** 응답 헤더 (HTTP 기반 제공자의 경우에만 사용 가능) */
  readonly headers?: Record<string, string>;
}

/**
 * 응답 메시지의 역할을 나타내는 타입
 */
export type MessageRole = 'assistant' | 'tool' | 'user' | 'system';

/**
 * 응답 메시지의 콘텐츠 타입을 나타내는 타입
 */
export type MessageContent = {
  type: 'text' | 'tool-call' | 'tool-result';
  text?: string;
  toolCallId?: string;
  toolName?: string;
  args?: Record<string, unknown>;
  result?: unknown;
};

/**
 * 응답 메시지를 나타내는 인터페이스
 */
export interface ResponseMessage {
  role: MessageRole;
  content: MessageContent[];
  id: string;
}

/**
 * generateText 함수의 출력 결과를 나타내는 인터페이스
 */
export interface GenerateTextResult<TOOLS = any, OUTPUT = any> {
  /** 생성된 텍스트 */
  readonly text: string;
  /** 모델이 생성한 추론 텍스트 (텍스트만 생성한 경우 undefined) */
  readonly reasoning: string | undefined;
  /** 생성된 파일 배열 (파일이 생성되지 않은 경우 빈 배열) */
  readonly files: Array<GeneratedFile>;
  /** 모델이 생성한 전체 추론 배열 */
  readonly reasoningDetails: Array<ReasoningDetail>;
  /** 응답 생성에 사용된 소스 배열 */
  readonly sources: Source[];
  /** 생성된 구조화된 출력 */
  readonly experimental_output: OUTPUT;
  /** 생성 중에 수행된 도구 호출 배열 */
  readonly toolCalls: any[]; // TOOLS 타입에 따라 구체화 필요
  /** 도구 호출의 결과 배열 */
  readonly toolResults: any[]; // TOOLS 타입에 따라 구체화 필요
  /** 생성이 종료된 이유 */
  readonly finishReason: FinishReason;
  /** 생성된 텍스트의 토큰 사용량 */
  readonly usage: LanguageModelUsage;
  /** 모델 제공자의 경고 배열 */
  readonly warnings: CallWarning[] | undefined;
  /** 모든 단계에 대한 세부 정보 배열 */
  readonly steps: any[]; // StepResult<TOOLS> 타입에 따라 구체화 필요
  /** 추가 요청 정보 */
  readonly request: LanguageModelRequestMetadata;
  /** 추가 응답 정보 */
  readonly response: LanguageModelResponseMetadata & {
    /** 생성 중에 생성된 응답 메시지 배열 */
    readonly messages: any[]; // ResponseMessage 타입에 따라 구체화 필요
    /** 응답 본문 (HTTP 요청을 사용하는 제공자의 경우에만 사용 가능) */
    readonly body?: unknown;
  };
}
