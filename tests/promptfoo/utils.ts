import { ResultFileContent, TokenUsageInfo, TestResult } from './types';
import fs from 'fs';
import { URL } from 'url';

// 필수 환경 변수 검증 함수

// 결과 파일 존재 여부 확인 함수
export function checkResultFile(filePath: string): boolean {
  if (!fs.existsSync(filePath)) {
    console.error(`오류: 결과 파일(${filePath})을 찾을 수 없습니다.`);
    console.error('파일 경로를 확인하거나 다음 명령을 실행하여 테스트 결과를 생성해주세요:');
    console.error('  npm run test:agent');
    console.error('또는');
    console.error('  pnpm run test:agent');
    return false;
  }
  return true;
}

// 결과 데이터 로드 함수
export function loadResultData(filePath: string): ResultFileContent | null {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent) as ResultFileContent;
    if (!data?.results?.results) {
      console.error('결과 파일이 유효한 형식이 아닙니다.');
      return null;
    }
    return data;
  } catch (error) {
    console.error(`결과 파일(${filePath}) 파싱 중 오류 발생:`, error);
    return null;
  }
}

// 유틸리티 함수 - 텍스트 관련
export function truncateText(text: any, maxLength: number = 2000): string {
  if (text === null || typeof text === 'undefined') return '';
  const str = typeof text === 'string' ? text : JSON.stringify(text);
  return str.length > maxLength ? str.substring(0, maxLength - 3) + '...' : str;
}

export function prettifyText(text?: string): string {
  return text ? text.replace(/\\n/g, '\n').trim() : '';
}

export function prettifyEndpoint(endpoint?: string): string {
  if (!endpoint) return 'N/A';
  return endpoint
    .replace(/^https?:\/\//, '')
    .replace(/^(www\.)?/, '')
    .replace(/^localhost|^127\.0\.0\.1|^0\.0\.0\.0/, '')
    .replace(/:\d+/, '');
}

// URL 유효성 검사
export function isValidUrl(url?: string): boolean {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// 토큰 사용량 계산 함수
export function extractTokenUsage(output?: any): TokenUsageInfo | null {
  if (!output) return null;

  try {
    // 문자열이면 파싱, 객체면 그대로 사용
    const parsedOutput = typeof output === 'string' ? JSON.parse(output) : output;

    // 중첩된 output.content 구조 처리
    const finalOutput = parsedOutput?.output?.content
      ? typeof parsedOutput.output.content === 'string'
        ? JSON.parse(parsedOutput.output.content)
        : parsedOutput.output.content
      : parsedOutput;

    if (finalOutput?.usage) {
      const promptTokens = finalOutput.usage.promptTokens || 0;
      const completionTokens = finalOutput.usage.completionTokens || 0;
      const totalTokens = finalOutput.usage.totalTokens || promptTokens + completionTokens;
      return { promptTokens, completionTokens, totalTokens };
    }
  } catch {
    // JSON 파싱 오류 - 무시
  }
  return null;
}

export function calculateTotalTokenUsage(testResults: TestResult[]): TokenUsageInfo {
  let totalPromptTokens = 0;
  let totalCompletionTokens = 0;
  let totalOverallTokens = 0;

  for (const result of testResults) {
    const tokenUsage = extractTokenUsage(result?.response);
    if (tokenUsage) {
      totalPromptTokens += tokenUsage.promptTokens;
      totalCompletionTokens += tokenUsage.completionTokens;
      totalOverallTokens += tokenUsage.totalTokens;
    }
  }

  return {
    promptTokens: totalPromptTokens,
    completionTokens: totalCompletionTokens,
    totalTokens: totalOverallTokens,
  };
}

// Notion 블록 생성 헬퍼 함수
export function createHeadingBlock(content: string) {
  return {
    object: 'block' as const,
    type: 'heading_2' as const,
    heading_2: {
      rich_text: [{ text: { content } }],
    },
  };
}

export function createHeadingBlockWithLink(content: string) {
  return {
    object: 'block' as const,
    type: 'heading_2' as const,
    heading_2: {
      rich_text: [{ text: { content }, link: { url: content } }],
    },
  };
}

export function createParagraphBlock(content: string) {
  return {
    object: 'block' as const,
    type: 'paragraph' as const,
    paragraph: {
      rich_text: [{ text: { content } }],
    },
  };
}

export function createListItem(content: string, options: { link?: boolean } = {}) {
  return {
    object: 'block' as const,
    type: 'bulleted_list_item' as const,
    bulleted_list_item: {
      rich_text: [
        {
          type: 'text' as const,
          text: {
            content: truncateText(content, 100),
            ...(options.link && isValidUrl(content) ? { link: { url: content } } : {}),
          },
        },
      ],
    },
  };
}

// 코드 블록 생성 헬퍼 함수
export function createCodeBlock(
  content: string,
  language:
    | 'abap'
    | 'arduino'
    | 'bash'
    | 'basic'
    | 'c'
    | 'clojure'
    | 'coffeescript'
    | 'c++'
    | 'c#'
    | 'css'
    | 'dart'
    | 'diff'
    | 'docker'
    | 'elixir'
    | 'elm'
    | 'erlang'
    | 'flow'
    | 'fortran'
    | 'f#'
    | 'gherkin'
    | 'glsl'
    | 'go'
    | 'graphql'
    | 'groovy'
    | 'haskell'
    | 'html'
    | 'java'
    | 'javascript'
    | 'json'
    | 'julia'
    | 'kotlin'
    | 'latex'
    | 'less'
    | 'lisp'
    | 'livescript'
    | 'lua'
    | 'makefile'
    | 'markdown'
    | 'markup'
    | 'matlab'
    | 'mermaid'
    | 'nix'
    | 'objective-c'
    | 'ocaml'
    | 'pascal'
    | 'perl'
    | 'php'
    | 'plain text'
    | 'powershell'
    | 'prolog'
    | 'protobuf'
    | 'python'
    | 'r'
    | 'reason'
    | 'ruby'
    | 'rust'
    | 'sass'
    | 'scala'
    | 'scheme'
    | 'scss'
    | 'shell'
    | 'sql'
    | 'swift'
    | 'typescript'
    | 'vb.net'
    | 'verilog'
    | 'vhdl'
    | 'visual basic'
    | 'webassembly'
    | 'xml'
    | 'yaml'
    | 'java/c/c++/c#' = 'markdown'
) {
  return {
    object: 'block' as const,
    type: 'code' as const,
    code: {
      language,
      rich_text: [{ text: { content: truncateText(content, 2000) } }],
    },
  };
}

// 테이블 블록 생성 함수
export function createTableBlock() {
  // 테이블 헤더 및 기본 구조
  return {
    object: 'block' as const,
    type: 'table' as const,
    table: {
      table_width: 5,
      has_column_header: true,
      has_row_header: false,
      children: [
        // 헤더 행
        {
          object: 'block' as const,
          type: 'table_row' as const,
          table_row: {
            cells: [
              [{ type: 'text' as const, text: { content: '질문' } }],
              [{ type: 'text' as const, text: { content: '응답' } }],
              [{ type: 'text' as const, text: { content: '통과 여부' } }],
              [{ type: 'text' as const, text: { content: '점수' } }],
              [{ type: 'text' as const, text: { content: '토큰 사용량' } }],
            ],
          },
        },
      ],
    },
  };
}

// 테이블 행 블록 생성 함수
export function createTableRowBlock(
  question: string,
  response: any,
  success: boolean,
  score?: number,
  tokenUsage?: TokenUsageInfo | null
) {
  const tokenUsageText = tokenUsage ? `${tokenUsage.totalTokens}` : 'N/A';

  return {
    object: 'block' as const,
    type: 'table_row' as const,
    table_row: {
      cells: [
        // 질문 열
        [
          {
            type: 'text' as const,
            text: {
              content: truncateText(question || '', 100),
            },
          },
        ],
        // 응답 열
        [
          {
            type: 'text' as const,
            text: {
              content: truncateText(JSON.stringify(response) || '', 2000),
            },
          },
        ],
        // 통과 여부 열
        [
          {
            type: 'text' as const,
            text: {
              content: success ? '✅ 성공' : '❌ 실패',
            },
          },
        ],
        // 점수 열
        [
          {
            type: 'text' as const,
            text: {
              content: score?.toString() || 'N/A',
            },
          },
        ],
        // 토큰 사용량 열
        [
          {
            type: 'text' as const,
            text: {
              content: tokenUsageText,
            },
          },
        ],
      ],
    },
  };
}
/**
 * AI 응답 데이터에서 response, messages, 토큰 정보를 추출하는 함수
 * @param responseOutput AI 응답 데이터 (문자열 또는 객체)
 * @returns 파싱된 응답 데이터 객체
 */
export function parseResponseData(responseOutput: any): {
  response: string;
  messages: string;
  answer: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
} {
  try {
    let responseText = '';
    let messagesText = '';
    let answerText = '';
    let promptTokens = 0;
    let completionTokens = 0;
    let totalTokens = 0;

    if (typeof responseOutput === 'string') {
      try {
        const parsed = JSON.parse(responseOutput);
        responseText = parsed.output || '';
        messagesText = parsed.messages || '';
        answerText = parsed.testCase?.vars?.answer || '';
        if (parsed.tokenUsage) {
          promptTokens = parsed.tokenUsage.prompt || 0;
          completionTokens = parsed.tokenUsage.completion || 0;
          totalTokens = parsed.tokenUsage.total || 0;
        }
      } catch (e) {
        responseText = responseOutput;
      }
    } else if (responseOutput && typeof responseOutput === 'object') {
      responseText = responseOutput.output || '';
      messagesText = responseOutput.messages || '';
      answerText = responseOutput.testCase?.vars?.answer || '';
      if (responseOutput.tokenUsage) {
        promptTokens = responseOutput.tokenUsage.prompt || 0;
        completionTokens = responseOutput.tokenUsage.completion || 0;
        totalTokens = responseOutput.tokenUsage.total || 0;
      }
    }

    return {
      response: responseText,
      messages: messagesText,
      answer: answerText,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: totalTokens,
    };
  } catch (error) {
    console.error('Error parsing response data:', error);
    return {
      response: '',
      messages: '',
      answer: '',
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    };
  }
}

/**
 * messages 배열을 문자열로 변환
 * @param messages 메시지 배열
 * @returns 문자열로 변환된 메시지 정보
 */
function formatMessagesToString(messages: any[]): string {
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return '';
  }

  let messagesText = '';

  messages.forEach((msg, index) => {
    if (!msg) return;

    messagesText += `--- 메시지 ${index + 1} (${msg.role || '역할 없음'}) ---\n`;

    // content 처리
    if (Array.isArray(msg.content)) {
      // 배열 형태의 content 처리
      msg.content.forEach((contentItem: any, contentIndex: number) => {
        messagesText += `[항목 ${contentIndex + 1}] `;

        if (contentItem.type === 'text') {
          messagesText += `텍스트: ${contentItem.text}\n`;
        } else if (contentItem.type === 'tool-call') {
          messagesText += `도구 호출 (${contentItem.toolName}): ${JSON.stringify(contentItem.args)}\n`;
        } else if (contentItem.type === 'tool-result') {
          const resultPreview =
            typeof contentItem.result === 'string'
              ? contentItem.result
              : JSON.stringify(contentItem.result);
          messagesText += `도구 결과 (${contentItem.toolName}): ${resultPreview}\n`;
        } else {
          messagesText += `${contentItem.type || '알 수 없는 유형'}: ${JSON.stringify(contentItem)}\n`;
        }
      });
    } else if (typeof msg.content === 'string') {
      // 문자열 형태의 content
      messagesText += msg.content + '\n';
    } else if (msg.content) {
      // 기타 객체 형태
      messagesText += JSON.stringify(msg.content, null, 2) + '\n';
    }

    messagesText += '\n';
  });

  return messagesText;
}
