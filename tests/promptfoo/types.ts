// promptfoo/types.ts
// Notion 확장 프로그램을 위한 타입 정의

// 테스트 케이스 타입
export type TestCase = {
  vars: { question: string; answer: string };
  assert?: Array<{ type: string; value: string }>;
  options?: Record<string, any>;
  description?: string;
  metadata?: Record<string, any>;
};

// 토큰 사용량 관련 타입
export type TokenUsage = {
  total: number;
  prompt: number;
  completion: number;
  cached?: number;
  numRequests?: number;
  completionDetails?: {
    reasoning?: number;
    acceptedPrediction?: number;
    rejectedPrediction?: number;
  };
};

export type TokenUsageInfo = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

// 테스트 결과 타입
export type TestResult = {
  vars?: { question: string };
  testCase?: TestCase;
  response?: {
    output?: string;
    tokenUsage?: {
      total: number;
      prompt: number;
      completion: number;
    };
  };

  success: boolean;
  score: number | null;
  error?: string;
  cost?: number;
  id?: string;
  latencyMs?: number;
  prompt: { raw: string; label?: string; config?: Record<string, any> };
  provider?: { id: string; label?: string };
  metadata?: Record<string, any>;
};

// 결과 데이터 타입
export type ResultData = {
  version: number;
  timestamp: string;
  prompts: Array<{
    raw: string;
    label?: string;
    metrics?: {
      assertPassCount?: number;
      assertFailCount?: number;
      totalLatencyMs?: number;
      tokenUsage?: TokenUsage;
    };
  }>;
  results: TestResult[];
  stats: {
    successes: number;
    failures: number;
    errors: number;
    tokenUsage?: TokenUsage;
  };
};

export type RequestBody = {
  message: {
    id: string;
    createdAt: string;
    role: string;
    content: string;
  };
  selectedChatModel: string;
  systemPromptId: string;
};

export type ProviderConfig = {
  id: string;
  label?: string;
  config?: { url: string; method: string; headers: Record<string, string>; body: RequestBody };
};

export type Tags = { version?: string };
// 결과 파일 콘텐츠 타입
export type ResultFileContent = {
  evalId?: string;
  results: ResultData;
  config: {
    tags?: Tags;
    description?: string;
    prompts?: Array<string | Record<string, any>>;
    providers?: Array<ProviderConfig>;
    tests?: string[];
    outputPath?: string[];
  };
  shareableUrl?: string | null;
};

// PromptFoo 확장 컨텍스트 타입
export type PromptFooExtensionContext = {
  evalId?: string;
  results: ResultData;
  config: {
    description?: string;
    prompts?: Array<string | Record<string, any>>;
    providers?: Array<string | { id: string; config?: { url: string } }>;
    tests?: Array<string | Record<string, any>>;
    outputPath?: string[];
  };
  shareableUrl?: string | null;
};

export interface PromptConfig {
  raw: string;
  label?: string;
  config?: Record<string, any>;
  id?: string;
  provider?: string;
  metrics?: {
    score?: number;
    testPassCount?: number;
    testFailCount?: number;
    testErrorCount?: number;
    assertPassCount?: number;
    assertFailCount?: number;
    totalLatencyMs?: number;
    tokenUsage?: TokenUsage;
    namedScores?: Record<string, any>;
    namedScoresCount?: Record<string, any>;
    cost?: number;
  };
}

interface ResultStats {
  successes: number;
  failures: number;
  errors: number;
  tokenUsage?: TokenUsage;
}

interface ResultsData {
  version: number;
  timestamp: string;
  prompts: PromptConfig[];
  results: TestResult[];
  stats: ResultStats;
}

export interface ProviderConfigInFile {
  id: string;
  label?: string;
  delay?: number;
  type?: string;
  config?: {
    url: string;
    method?: string;
    headers?: Record<string, string>;
    body?: Record<string, any>;
    [key: string]: any;
  };
}

export interface ConfigData {
  description?: string;
  prompts?: (string | Record<string, any>)[];
  providers?: (string | ProviderConfigInFile)[];
  tests?: (string | Record<string, any>)[];
  sharing?: boolean;
  outputPath?: string[];
  extensions?: any[];
}
