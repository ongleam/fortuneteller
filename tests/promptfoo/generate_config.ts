import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { TEST_SYSTEM_PROMPTS } from './prompts';

// --- 설정 가능한 변수들 ---
const TEST_VERSION = 'v1';
const PROMPTFOO_CONFIG_OUTPUT_DIR = './tests/promptfoo';
// const API_URL = 'http://localhost:3000/api/test-chat?save=true';
const API_URL = 'http://localhost:3000/api/test-chat';
const CHAT_MODEL = 'chat-model';
const MAX_CONCURRENCY = 5; // 동시 실행할 테스트 수
const MAX_RETRY_AFTER = 60;
const DEFAULT_DELAY = 500000;
const TEST_CASES_URLS = {
  test: [
    'https://docs.google.com/spreadsheets/d/1-LFVhNsAItSCVTSJCiDUWI4JjaMpyxFzNvsm9bBuNW8/edit?gid=23817185#gid=23817185',
  ],
  v1: [
    'https://docs.google.com/spreadsheets/d/1-LFVhNsAItSCVTSJCiDUWI4JjaMpyxFzNvsm9bBuNW8/edit?gid=0#gid=0',
  ],
};

const OUTPUT_JSON_PATH = `${PROMPTFOO_CONFIG_OUTPUT_DIR}/results.json`;
const PROMPTFOO_CONFIG_OUTPUT_FILENAME = `${PROMPTFOO_CONFIG_OUTPUT_DIR}/generated_config.yaml`; // 생성될 파일 이름
const DEFAULT_PROVIDER_ID = 'http';
const EMBEDDING_PROVIDER_ID = 'file://tests/promptfoo/embedding_provider.js';
const TRANSFORM_RESPONSE = `{output: json.output, 
tokenUsage: {
  total: json.tokenUsage.total,
  prompt: json.tokenUsage.prompt,
  completion: json.tokenUsage.completion,
} }`;
// -------------------------

interface PromptfooProvider {
  id: string;
  label?: string; // promptfoo UI에서 표시될 레이블 (선택 사항)
  config: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: Record<string, any>;
    // 필요한 경우 여기에 retry, timeout 등의 옵션 추가 가능
    // 예:
    // retry?: {
    //   maxAttempts?: number;
    //   initialDelay?: number;
    //   maxDelay?: number;
    //   backoff?: 'linear' | 'exponential';
    // };
    transformResponse?: string;
  };
}

interface PromptfooConfig {
  description: string;
  tags: {
    env?: string;
    application?: string;
    version?: string;
    team?: string;
  };
  evaluateOptions?: {
    maxConcurrency?: number;
    delay?: number;
  };
  defaultTest?: {
    options: {
      provider: {
        embedding: {
          id: string;
        };
      };
    };
  };
  providers: PromptfooProvider[];
  tests: (string | Record<string, any>)[]; // 테스트 케이스 URL 또는 직접 정의
  outputPath: string[];
  // defaultTest, partage, 기타 promptfoo 옵션 추가 가능
}

function createPromptfooConfig(): PromptfooConfig {
  const providers: PromptfooProvider[] = [];

  if (!TEST_SYSTEM_PROMPTS || Object.keys(TEST_SYSTEM_PROMPTS).length === 0) {
    console.warn(
      'WARNING: TEST_SYSTEM_PROMPTS is empty or not defined in config/prompts.ts. No providers will be generated.'
    );
  } else {
    for (const systemPromptId in TEST_SYSTEM_PROMPTS) {
      // 객체가 실제로 해당 속성을 가지고 있는지 확인 (프로토타입 체인 상속 방지)
      if (Object.prototype.hasOwnProperty.call(TEST_SYSTEM_PROMPTS, systemPromptId)) {
        providers.push({
          id: DEFAULT_PROVIDER_ID, // 예: provider-kc-agent-baseline
          label: systemPromptId, // UI에서 보일 이름
          config: {
            url: API_URL,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              message: {
                id: `msg-{{N}}-${systemPromptId.toLowerCase()}`, // promptfoo 변수 {{N}} 사용
                createdAt: '{{date}}', // promptfoo 변수 {{date}} 사용
                role: 'user',
                content: '{{question}}', // 테스트 케이스에서 'question' 변수를 사용한다고 가정
              },
              selectedChatModel: CHAT_MODEL,
              systemPromptId: systemPromptId, // API가 이 ID를 사용해 prompts.ts에서 실제 프롬프트를 가져옴
            },
            transformResponse: TRANSFORM_RESPONSE,
          },
        });
      }
    }
  }

  const config: PromptfooConfig = {
    description: 'Auto-generated promptfoo config for testing multiple system prompts using tsx',
    tags: {
      version: TEST_VERSION,
    },
    evaluateOptions: {
      maxConcurrency: MAX_CONCURRENCY,
      delay: DEFAULT_DELAY,
    },
    providers,

    tests: TEST_CASES_URLS[TEST_VERSION],
    defaultTest: {
      options: {
        provider: {
          embedding: {
            id: EMBEDDING_PROVIDER_ID,
          },
        },
      },
    },

    // 필요한 경우 추가적인 로컬 테스트 케이스 정의
    // {
    //   vars: { question: "로컬에서 정의된 특정 질문" },
    //   // assert: [{ type: "icontains", value: "예상 답변 키워드" }]
    // }
    outputPath: [OUTPUT_JSON_PATH],
  };

  return config;
}

function main() {
  console.log('Starting promptfoo config generation...');

  // TEST_SYSTEM_PROMPTS가 제대로 로드되었는지 확인
  if (typeof TEST_SYSTEM_PROMPTS === 'undefined') {
    console.error(
      "ERROR: TEST_SYSTEM_PROMPTS is undefined. Check the import from '../config/prompts'."
    );
    process.exit(1);
  }

  const promptfooConfigObject = createPromptfooConfig();

  if (promptfooConfigObject.providers.length === 0) {
    console.warn('No providers were generated. This might be due to empty TEST_SYSTEM_PROMPTS.');
  }

  // YAML 문자열로 변환 (skipInvalid: true 옵션으로 undefined 값 관련 오류 방지)
  const yamlString = yaml.dump(promptfooConfigObject, { skipInvalid: true });

  const outputFilePath = path.join(process.cwd(), PROMPTFOO_CONFIG_OUTPUT_FILENAME);

  try {
    fs.writeFileSync(outputFilePath, yamlString, 'utf8');
    console.log(`Successfully generated ${PROMPTFOO_CONFIG_OUTPUT_FILENAME} at ${outputFilePath}`);
    if (promptfooConfigObject.providers.length > 0) {
      console.log(
        `Providers generated: ${promptfooConfigObject.providers.map((p) => p.label || p.id).join(', ')}`
      );
    }
  } catch (err) {
    console.error('Error writing promptfoo config file:', err);
    process.exit(1);
  }
}

main();
