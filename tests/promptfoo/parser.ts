// promptfoo/parser.ts
import fs from 'fs';
import { ResultFileContent, TestResult, PromptConfig, ProviderConfigInFile } from './types'; // types.ts 경로 확인

// 기본 결과 파일 경로
const DEFAULT_RESULT_FILE_PATH = './promptfoo/output/results.json';

// results.json 파일 로드 (기존 loadResultData 함수와 유사하지만, 여기서는 직접 사용)
function loadRawResultFile(filePath: string): ResultFileContent | null {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent) as ResultFileContent;
    if (!data || !data.results || !data.results.results || !data.config || !data.results.prompts) {
      console.error(
        '결과 파일이 유효한 형식이 아닙니다. 필요한 최상위 필드(results, results.results, config, results.prompts)가 누락되었습니다.'
      );
      return null;
    }
    return data;
  } catch (error) {
    console.error(`결과 파일(${filePath}) 파싱 중 오류 발생:`, error);
    return null;
  }
}

// 파싱된 결과를 저장할 인터페이스 정의
export interface ParsedProviderData {
  metrics: PromptConfig['metrics'] | null; // 각 provider에 해당하는 prompt의 metrics
  results: TestResult[]; // 해당 provider로 실행된 테스트 결과들
  config: ProviderConfigInFile | string | null; // 해당 provider의 설정 정보
  // 필요하다면 provider의 시스템 프롬프트 원본 텍스트도 여기에 추가할 수 있습니다.
  // systemPromptText?: string;
}

export interface ParsedResultsByProvider {
  [providerKey: string]: ParsedProviderData;
}

// results.json을 provider별로 파싱하는 함수
export function parseResultsByProvider(filePath: string): ParsedResultsByProvider | null {
  const rawData = loadRawResultFile(filePath);
  if (!rawData) {
    return null;
  }

  const parsedData: ParsedResultsByProvider = {};

  // 1. Provider 정보와 해당 Provider의 설정(config)을 매핑합니다.
  //    rawData.config.providers 배열을 순회하며 provider의 ID 또는 label을 키로 사용합니다.
  const providerConfigsMap = new Map<string, ProviderConfigInFile | string>();
  if (rawData.config.providers) {
    for (const providerSetting of rawData.config.providers) {
      if (typeof providerSetting === 'string') {
        // provider가 문자열(파일 경로 등)인 경우, 여기서는 ID로 그대로 사용하거나
        // 해당 파일을 읽어와야 하지만, 현재 results.json 구조에서는 객체로 들어옴.
        // 이 케이스는 현재 results.json 예시에는 없으므로 간단히 ID로만 저장.
        providerConfigsMap.set(providerSetting, providerSetting);
      } else if (providerSetting.id || (providerSetting as any).label) {
        // promptfoo config에서 생성된 provider의 label이나 id를 사용
        const key = (providerSetting as any).label || providerSetting.id; // label 우선, 없으면 id
        providerConfigsMap.set(key, providerSetting as ProviderConfigInFile);
      }
    }
  }

  // 2. rawData.results.prompts 배열을 순회하여 각 provider(label 기준)의 metrics를 매핑합니다.
  //    results.json에서 prompts 배열의 각 요소는 특정 provider의 실행 요약(metrics 포함)을 나타냅니다.
  const metricsByProviderLabel = new Map<string, PromptConfig['metrics']>();
  if (rawData.results.prompts) {
    for (const promptSummary of rawData.results.prompts) {
      // promptSummary.provider는 promptfoo config에서 정의한 provider의 'label'과 일치해야 함.
      // 또는 generate-promptfoo-config.ts 에서 id를 label로 사용했다면 그것과 일치함.
      const providerLabel = (promptSummary as any).provider; // 예: "KC_AGENT_BASELINE"
      if (providerLabel && promptSummary.metrics) {
        metricsByProviderLabel.set(providerLabel, promptSummary.metrics);
      }
    }
  }

  // 3. rawData.results.results 배열 (실제 테스트 결과)을 순회하여 provider별로 그룹화합니다.
  if (rawData.results.results) {
    for (const testResult of rawData.results.results) {
      // testResult.provider.label 이 promptfoo config에서 설정한 label과 일치 (generate-promptfoo-config.ts 참고)
      // 또는 testResult.provider.id 가 API URL 등으로 되어 있을 수 있음.
      // 여기서는 provider.label을 기준으로 그룹화 (generate-promptfoo-config.ts 에서 label을 시스템 프롬프트 ID로 설정했음)
      const providerKey =
        testResult.provider?.label || testResult.provider?.id || 'unknown_provider';

      if (!parsedData[providerKey]) {
        // 해당 providerKey로 처음 데이터를 초기화
        parsedData[providerKey] = {
          metrics: metricsByProviderLabel.get(providerKey) || null, // 위에서 매핑한 metrics 가져오기
          results: [],
          config: providerConfigsMap.get(providerKey) || null, // 위에서 매핑한 provider 설정 가져오기
        };
      }
      parsedData[providerKey].results.push(testResult);
    }
  }

  // 만약 metrics나 config가 매핑되지 않은 provider가 있다면,
  // rawData.config.providers나 rawData.results.prompts에서 추가적으로 정보를 찾아 할당할 수 있습니다.
  // 예를 들어, parsedData의 각 키(providerKey)에 대해 metrics나 config가 null이면 다시 찾아보는 로직.
  for (const providerKey in parsedData) {
    if (Object.prototype.hasOwnProperty.call(parsedData, providerKey)) {
      if (!parsedData[providerKey].metrics) {
        // results.json의 prompts 배열에서 providerKey(label)와 일치하는 항목의 metrics를 다시 한번 찾아본다.
        const promptSummary = rawData.results.prompts.find(
          (p) => (p as any).provider === providerKey
        );
        if (promptSummary && promptSummary.metrics) {
          parsedData[providerKey].metrics = promptSummary.metrics;
        } else {
          // console.warn(`[${providerKey}] Provider에 대한 metrics 정보를 results.prompts 배열에서 찾을 수 없습니다.`);
        }
      }
      if (!parsedData[providerKey].config) {
        // results.json의 config.providers 배열에서 providerKey(label)와 일치하는 항목의 설정을 다시 한번 찾아본다.
        const providerSetting = rawData.config.providers?.find(
          (p) =>
            (typeof p === 'object' && (p as any).label === providerKey) ||
            (typeof p === 'string' && p === providerKey)
        );
        if (providerSetting) {
          parsedData[providerKey].config = providerSetting as ProviderConfigInFile | string;
        } else {
          // console.warn(`[${providerKey}] Provider에 대한 config 정보를 config.providers 배열에서 찾을 수 없습니다.`);
        }
      }
    }
  }

  return parsedData;
}

// (선택 사항) CLI에서 직접 실행하여 파싱 결과를 확인하기 위한 로직
if (import.meta.url.endsWith(process.argv[1])) {
  (async () => {
    const resultFilePath = process.argv[2] || DEFAULT_RESULT_FILE_PATH; // CLI 인자로 파일 경로 받기
    console.log(`파싱할 결과 파일 경로: ${resultFilePath}`);

    const parsedData = parseResultsByProvider(resultFilePath);

    console.log(JSON.stringify(parsedData, null, 2));
    if (parsedData) {
      console.log('파싱된 데이터 미리보기:');
      for (const providerKey in parsedData) {
        if (Object.prototype.hasOwnProperty.call(parsedData, providerKey)) {
          console.log(`\n--- Provider: ${providerKey} ---`);
          console.log(
            '  Metrics:',
            parsedData[providerKey].metrics ? 'Available' : 'Not Available'
          );

          console.log('  Results Count:', parsedData[providerKey].results.length);
          console.log('  Config:', parsedData[providerKey].config ? 'Available' : 'Not Available');
        }
      }
      // 전체 객체를 파일로 저장하거나, 더 자세히 출력할 수 있습니다.
      // fs.writeFileSync('./promptfoo/output/parsed_by_provider.json', JSON.stringify(parsedData, null, 2));
      // console.log('\n전체 파싱된 데이터가 ./promptfoo/output/parsed_by_provider.json 에 저장될 수 있습니다 (주석 처리됨).');
    } else {
      console.log('데이터 파싱에 실패했습니다.');
    }
  })();
}
