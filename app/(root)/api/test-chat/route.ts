import { streamText, Message, generateText } from 'ai';
import { NextResponse } from 'next/server';
import { kakaoAgent } from '@/lib/agents/kakao';
import { nanoid } from 'nanoid';
import * as fs from 'fs';
import * as path from 'path';
import { TEST_SYSTEM_PROMPTS } from '@/tests/promptfoo/prompts';
import { preprocessXmlText } from '@/lib/utils/textPreprocess';

interface ParsedToolCall {
  toolCallId?: string;
  toolName: string;
  args: any; // Parsed args
}

interface ParsedToolResult {
  toolCallId?: string;
  toolName: string;
  result: any; // Parsed result
}

// MessagePart 타입 정의
type MessagePartType = 'text' | 'tool-call' | 'tool-result' | 'image';

interface ParsedMessagePart {
  type: MessagePartType;
  text?: string;
  toolCall?: ParsedToolCall;
  toolResult?: ParsedToolResult;
  // Add other types like image if needed
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

// Function to save results to a JSON file
async function saveResponseToJson(
  data: any,
  filename: string = `response_${Date.now()}.json`
): Promise<string> {
  try {
    // Set save directory (logs folder)
    const logDir = path.join(process.cwd(), 'tests/debug');

    // Create directory if it doesn't exist
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Set file path
    const filePath = path.join(logDir, filename);

    // Convert data to JSON and save to file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

    console.log(`[INFO] Response data saved to ${filePath}.`);
    return filePath;
  } catch (error) {
    console.error('[ERROR] Error saving file:', error);
    return '';
  }
}

// API endpoint for testing
export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    const { message, selectedChatModel, systemPromptId } = body;
    const question = message.content;

    console.log(`[TEST] Received question: ${question}`);

    // Check for empty text parameter
    if (!question || question.trim() === '') {
      return NextResponse.json(
        {
          error: 'Question content is empty.',
          errorDetail: 'Please enter a question.',
          errorCode: 'EMPTY_TEXT_PARAMETER',
        },
        { status: 500 }
      );
    }

    // Model settings
    const model = selectedChatModel || 'chat-model';
    // Simple message list containing only user messages
    const messages: Message[] = [
      {
        id: message.id || nanoid(),
        role: 'user',
        content: question,
      },
    ];

    // kcAgent settings
    const agentConfig = kakaoAgent({
      messages,
      model,
    });

    const systemPrompt = TEST_SYSTEM_PROMPTS[systemPromptId];
    if (systemPrompt) {
      agentConfig.system = systemPrompt;
    }
    // console.log(`[TEST] System prompt: ${JSON.stringify(agentConfig, null, 2)}`);

    try {
      // Generate text (without streaming)
      const result = await generateText({
        ...agentConfig,
        maxSteps: 5,
      });

      // Save results to JSON file (controlled by query parameter)
      if (new URL(request.url).searchParams.has('save')) {
        const timestamp = new Date().toISOString().replace(/[:.-]/g, '_');
        const filename = `response_${timestamp}.json`;
        await saveResponseToJson(result, filename);
      }

      // Return text after generation is complete

      // console.log('messages: ', JSON.stringify(result.response.messages, null, 2));
      // console.log('text: ', result.text);
      // console.log('usage: ', result.usage);

      // Return as a general response
      return NextResponse.json({
        tokenUsage: {
          total: result.usage.totalTokens,
          prompt: result.usage.promptTokens,
          completion: result.usage.completionTokens,
        },
        output: preprocessXmlText(result.text),
      });
    } catch (error: any) {
      console.error('[TEST] Model call error:', error);

      // Handle resource limit exceeded error
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
            error: 'Processing is delayed due to high request volume. Please try again later.',
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

      // Handle other errors
      return NextResponse.json(
        {
          error: 'An error occurred while processing the request.',
          errorDetail: error.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[TEST] API error:', error);

    // Handle empty text parameter error
    if (
      error.message?.includes('empty text parameter') ||
      error.errorDetail?.includes('empty text parameter') ||
      (error.response?.data && error.response.data.includes('empty text parameter'))
    ) {
      return NextResponse.json(
        {
          error: 'Question content is empty.',
          errorDetail: 'Please enter a question.',
          errorCode: 'EMPTY_TEXT_PARAMETER',
        },
        { status: 400 }
      );
    }

    // Check for Resource exhausted or Rate limit related errors
    if (
      error.statusCode === 429 ||
      (error.message && error.message.includes('Resource exhausted')) ||
      (error.responseBody && error.responseBody.includes('RESOURCE_EXHAUSTED'))
    ) {
      return NextResponse.json(
        {
          error: 'Processing is delayed due to high request volume. Please try again later.',
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

    return NextResponse.json({ error: 'An error occurred while processing the request.' }, { status: 500 });
  }
}
