import { streamText, Message, generateText } from 'ai';
import { NextResponse } from 'next/server';
import { baseAgent } from '@/lib/agents/base';
import { nanoid } from 'nanoid';
import * as fs from 'fs';
import * as path from 'path';
import { TEST_SYSTEM_PROMPTS } from '@/test/promptfoo/prompts';
import { preprocessXmlText } from '@/lib/utils/textPreprocess';

interface ParsedToolCall {
  toolCallId?: string;
  toolName: string;
  args: any; // 파싱된 args
}

interface ParsedToolResult {
  toolCallId?: string;
  toolName: string;
  result: any; // 파싱된 result
}

// MessagePart 타입 정의
type MessagePartType = 'text' | 'tool-call' | 'tool-result' | 'image';

interface ParsedMessagePart {
  type: MessagePartType;
  text?: string;
  toolCall?: ParsedToolCall;
  toolResult?: ParsedToolResult;
  // 이미지 등 다른 타입도 필요시 추가
}

interface ParsedMessage {
  role: 'user' | 'assistant' | 'tool';
  content: ParsedMessagePart[];
  id?: string;
}

interface ParsedStep {
  stepType: string;
  text?: string;
  toolCalls?: ParsedToolCall[];
  toolResults?: ParsedToolResult[];
  finishReason: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  // requestBodyContents?: any; // 스텝별 요청 내용 요약
  // responseBodyCandidates?: any; // 스텝별 응답 내용 요약
}

// 결과를 JSON 파일로 저장하는 함수
async function saveResponseToJson(
  data: any,
  filename: string = `response_${Date.now()}.json`
): Promise<string> {
  try {
    // 저장 디렉토리 설정 (logs 폴더)
    const logDir = path.join(process.cwd(), 'tests/debug');

    // 디렉토리가 없으면 생성
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // 파일 경로 설정
    const filePath = path.join(logDir, filename);

    // 데이터를 JSON으로 변환하여 파일에 저장
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

    console.log(`[INFO] 응답 데이터가 ${filePath}에 저장되었습니다.`);
    return filePath;
  } catch (error) {
    console.error('[ERROR] 파일 저장 중 오류 발생:', error);
    return '';
  }
}

// 테스트용 API 엔드포인트
export async function POST(request: Request) {
  try {
    // 요청 본문 파싱
    const body = await request.json();
    const { message, selectedChatModel, systemPromptId } = body;
    const question = message.content;

    console.log(`[테스트] 수신된 질문: ${question}`);

    // 빈 텍스트 파라미터 체크
    if (!question || question.trim() === '') {
      return NextResponse.json(
        {
          error: '질문 내용이 비어있습니다.',
          errorDetail: '질문을 입력해주세요.',
          errorCode: 'EMPTY_TEXT_PARAMETER',
        },
        { status: 500 }
      );
    }

    // 모델 설정
    const model = selectedChatModel || 'chat-model';
    // 사용자 메시지만 포함하는 간단한 메시지 목록
    const messages: Message[] = [
      {
        id: message.id || nanoid(),
        role: 'user',
        content: question,
      },
    ];

    // kcAgent 설정 (테스트용 더미 kakao_user_id 사용)
    const agentConfig = baseAgent({
      messages,
      model,
      kakao_user_id: 'test_user_id',
    });

    const systemPrompt = TEST_SYSTEM_PROMPTS[systemPromptId];
    if (systemPrompt) {
      agentConfig.system = systemPrompt;
    }
    // console.log(`[테스트] 시스템 프롬프트: ${JSON.stringify(agentConfig, null, 2)}`);

    try {
      // 텍스트 생성 (스트리밍 없이)
      const result = await generateText({
        ...agentConfig,
        maxSteps: 5,
      });

      // 결과를 JSON 파일로 저장 (query 매개변수로 제어)
      if (new URL(request.url).searchParams.has('save')) {
        const timestamp = new Date().toISOString().replace(/[:.-]/g, '_');
        const filename = `response_${timestamp}.json`;
        await saveResponseToJson(result, filename);
      }

      // 생성 완료 후 텍스트 반환

      // console.log('messages: ', JSON.stringify(result.response.messages, null, 2));
      // console.log('text: ', result.text);
      // console.log('usage: ', result.usage);

      // 일반 응답으로 반환
      return NextResponse.json({
        tokenUsage: {
          total: result.usage.totalTokens,
          prompt: result.usage.promptTokens,
          completion: result.usage.completionTokens,
        },
        output: preprocessXmlText(result.text),
      });
    } catch (error: any) {
      console.error('[테스트] 모델 호출 에러:', error);

      // 리소스 한도 초과 에러 처리
      if (
        error.statusCode === 500 ||
        error.statusCode === 429 ||
        error.lastError?.statusCode === 429 ||
        (error.message && error.message.includes('Resource exhausted')) ||
        (error.message && error.message.includes('Quota exceeded')) ||
        (error.responseBody && error.responseBody.includes('RESOURCE_EXHAUSTED')) ||
        (error.lastError?.responseBody &&
          error.lastError.responseBody.includes('RESOURCE_EXHAUSTED'))
      ) {
        return NextResponse.json(
          {
            error: '현재 요청이 많아 처리가 지연되고 있습니다. 잠시 후 다시 시도해 주세요.',
            errorCode: 'RESOURCE_EXHAUSTED',
            retryAfter: 30,
          },
          {
            status: 429,
            headers: {
              'Retry-After': '30',
            },
          }
        );
      }

      // 기타 에러 처리
      return NextResponse.json(
        {
          error: '요청 처리 중 오류가 발생했습니다.',
          errorDetail: error.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[테스트] API 오류:', error);

    // 빈 텍스트 파라미터 에러 처리
    if (
      error.message?.includes('empty text parameter') ||
      error.errorDetail?.includes('empty text parameter') ||
      (error.response?.data && error.response.data.includes('empty text parameter'))
    ) {
      return NextResponse.json(
        {
          error: '질문 내용이 비어있습니다.',
          errorDetail: '질문을 입력해주세요.',
          errorCode: 'EMPTY_TEXT_PARAMETER',
        },
        { status: 400 }
      );
    }

    // Resource exhausted 또는 Rate limit 관련 에러 확인
    if (
      error.statusCode === 429 ||
      (error.message && error.message.includes('Resource exhausted')) ||
      (error.responseBody && error.responseBody.includes('RESOURCE_EXHAUSTED'))
    ) {
      return NextResponse.json(
        {
          error: '현재 요청이 많아 처리가 지연되고 있습니다. 잠시 후 다시 시도해 주세요.',
          errorCode: 'RESOURCE_EXHAUSTED',
          retryAfter: 30,
        },
        {
          status: 429,
          headers: {
            'Retry-After': '30',
          },
        }
      );
    }

    return NextResponse.json({ error: '요청 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
