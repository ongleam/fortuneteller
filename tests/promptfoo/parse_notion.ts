// promptfoo/parse_notion.ts
import { Client, APIErrorCode, ClientErrorCode } from '@notionhq/client';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import { google, Auth } from 'googleapis';
import { ResultFileContent, PromptFooExtensionContext, TokenUsageInfo, TestResult } from './types';
import {
  createHeadingBlock,
  createCodeBlock,
  createListItem,
  createParagraphBlock,
  calculateTotalTokenUsage,
  checkResultFile,
  truncateText,
  prettifyEndpoint,
  isValidUrl,
  prettifyText,
  createTableBlock,
  extractTokenUsage,
  createTableRowBlock,
  parseResponseData,
} from './utils';
import { parseResultsByProvider, ParsedResultsByProvider, ParsedProviderData } from './parser'; // 새로 만든 파서 import
import { TEST_SYSTEM_PROMPTS } from './prompts';
import { baseModels } from '@/config/environments';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// 기본 설정 및 환경 변수
const BASE_DIR = path.resolve(process.cwd(), 'tests/promptfoo');
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_LEADERBOARD_DATABASE_ID;
const DEFAULT_RESULT_FILE_PATH = `${BASE_DIR}/results.json`;
const notion = new Client({ auth: NOTION_API_KEY });
const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

let sheets: any;
let drive: any;

async function initializeGoogleApis() {
  if (!GOOGLE_APPLICATION_CREDENTIALS) {
    console.warn(
      '⚠️ GOOGLE_APPLICATION_CREDENTIALS가 설정되지 않았습니다. 스프레드시트 기능이 비활성화됩니다.'
    );
    return false;
  }
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: GOOGLE_APPLICATION_CREDENTIALS,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive', // drive 스코프는 폴더 생성/관리에 필요
      ],
    });
    const authClient = await auth.getClient();
    sheets = google.sheets({ version: 'v4', auth: authClient as Auth.OAuth2Client });
    drive = google.drive({ version: 'v3', auth: authClient as Auth.OAuth2Client });
    console.log('🔑 Google API가 성공적으로 초기화되었습니다.');
    return true;
  } catch (error) {
    console.error('❌ Google API 초기화 중 오류 발생:', error);
    return false;
  }
}

function validateEnvironment(): boolean {
  const missingVars = [];
  if (!NOTION_API_KEY) missingVars.push('NOTION_API_KEY');
  if (!NOTION_DATABASE_ID) missingVars.push('NOTION_LEADERBOARD_DATABASE_ID');

  if (missingVars.length > 0) {
    console.error(`오류: 다음 환경 변수가 설정되지 않았습니다: ${missingVars.join(', ')}`);
    console.error('환경 변수는 .env.local 파일에 다음과 같이 설정해주세요:');
    console.error('NOTION_API_KEY=your_notion_api_key');
    console.error('NOTION_LEADERBOARD_DATABASE_ID=your_notion_database_id');
    return false;
  }
  return true;
}

// 명령행 인수 파싱 함수
function parseArgs(): string {
  const args = process.argv.slice(2);
  let resultFilePath = DEFAULT_RESULT_FILE_PATH;

  for (let i = 0; i < args.length; i++) {
    if ((args[i] === '-i' || args[i] === '--input') && i + 1 < args.length) {
      resultFilePath = args[i + 1];
      i++; // 다음 인수 건너뛰기
    }
  }
  return resultFilePath;
}

// 결과를 Notion에 전송하는 함수
async function sendDataToNotion(
  providerKey: string,
  providerData: ParsedProviderData,
  overallConfigData: ResultFileContent['config'],
  googleSheetUrl: string | null
): Promise<string | null> {
  try {
    const timestamp = new Date().toISOString();
    const title = providerKey;
    const prompt = TEST_SYSTEM_PROMPTS[providerKey];
    const metrics = providerData.metrics;
    const tokenUsage = {
      promptTokens: metrics?.tokenUsage?.prompt || 0,
      completionTokens: metrics?.tokenUsage?.completion || 0,
      totalTokens: metrics?.tokenUsage?.total || 0,
    };
    const endpoint = '';
    const testCases = overallConfigData.tests;
    const modelName =
      overallConfigData.providers?.[0]?.config?.body?.selectedChatModel || 'chat-model';
    const model = modelName as keyof typeof baseModels;
    const selectedChatModel = baseModels[model].modelName;
    const version = overallConfigData.tags?.version || 'unknown';
    console.log('selectedChatModel: ', selectedChatModel);
    console.log('version: ', version);
    console.log(
      `✅ : ${metrics?.testPassCount} | ❌ : ${metrics?.testFailCount} | ⚠️ : ${metrics?.testErrorCount} `
    );
    console.log(
      `💬 총 토큰: ${tokenUsage.totalTokens} (프롬프트: ${tokenUsage.promptTokens}, 완료: ${tokenUsage.completionTokens})`
    );
    if (!NOTION_DATABASE_ID) {
      console.error('오류: NOTION_LEADERBOARD_DATABASE_ID가 정의되지 않았습니다.');
      return null;
    }
    // Notion 페이지 생성
    const page = await notion.pages.create({
      parent: { database_id: NOTION_DATABASE_ID },
      properties: {
        title: { title: [{ text: { content: truncateText(title, 100) } }] },
        test_pass: { number: metrics?.testPassCount || 0 },
        test_fail: { number: metrics?.testFailCount || 0 },
        test_error: { number: metrics?.testErrorCount || 0 },
        assert_pass: { number: metrics?.assertPassCount || 0 },
        assert_fail: { number: metrics?.assertFailCount || 0 },
        total_latency_ms: { number: metrics?.totalLatencyMs || 0 },
        total_prompt_tokens: { number: tokenUsage.promptTokens },
        total_completion_tokens: { number: tokenUsage.completionTokens },
        endpoint: { rich_text: [{ text: { content: prettifyEndpoint(endpoint) } }] },
        created_at: { date: { start: timestamp } },
        testset: { select: { name: version } },
        model: { select: { name: selectedChatModel } },
      },
      children: [
        createHeadingBlock('시스템 프롬프트'),
        createCodeBlock(prettifyText(prompt)),
        createHeadingBlock('테스트셋'),
        ...(testCases || [])
          .filter(isValidUrl)
          .map((url: string) => createListItem(url, { link: true })),
        createHeadingBlock('토큰 사용량 요약'),
        createParagraphBlock(
          `총 토큰: ${tokenUsage.totalTokens.toLocaleString()} (프롬프트: ${tokenUsage.promptTokens.toLocaleString()}, 완료: ${tokenUsage.completionTokens.toLocaleString()})`
        ),
        createHeadingBlock('테스트 결과 링크'),
        ...(googleSheetUrl ? [createListItem(googleSheetUrl, { link: true })] : []),
        // createHeadingBlock('테스트 결과'),
        // {
        //   type: 'table' as const,
        //   table: {
        //     table_width: 8,
        //     has_column_header: true,
        //     has_row_header: false,
        //     children: [
        //       {
        //         type: 'table_row' as const,
        //         table_row: {
        //           cells: [
        //             [{ text: { content: 'Question' }, type: 'text' as const }],
        //             [{ text: { content: 'Response' }, type: 'text' as const }],
        //             [{ text: { content: 'Answer' }, type: 'text' as const }],
        //             [{ text: { content: 'Success' }, type: 'text' as const }],
        //             [{ text: { content: 'Score' }, type: 'text' as const }],
        //             [{ text: { content: 'Prompt Tokens' }, type: 'text' as const }],
        //             [{ text: { content: 'Completion Tokens' }, type: 'text' as const }],
        //             [{ text: { content: 'Total Tokens' }, type: 'text' as const }],
        //           ],
        //         },
        //       },
        //     ],
        //   },
        // },
      ],
    });

    // // 테이블 블록 ID 찾기
    // const blocks = await notion.blocks.children.list({
    //   block_id: page.id,
    // });

    // // 테이블 블록 찾기
    // const tableBlock = blocks.results.find((block: any) => block.type === 'table');
    // if (tableBlock) {
    //   // 데이터 행 추가 (최대 10개까지만 처리)
    //   for (const result of providerData.results.slice(0, 10)) {
    //     try {
    //       // 응답 출력 파싱 (parseResponseData 함수 사용)
    //       const responseOutput = result.response || '';
    //       const parsedResponse = parseResponseData(responseOutput);
    //       console.log('responseOutput: ', responseOutput);

    //       // 테이블 행 블록 생성
    //       const rowBlock = {
    //         type: 'table_row' as const,
    //         table_row: {
    //           cells: [
    //             // 질문
    //             [
    //               {
    //                 text: { content: truncateText(result.vars?.question || '', 1000) },
    //                 type: 'text' as const,
    //               },
    //             ],
    //             // 응답
    //             [
    //               {
    //                 text: { content: truncateText(parsedResponse.response, 3000) },
    //                 type: 'text' as const,
    //               },
    //             ],
    //             // 답변
    //             [
    //               {
    //                 text: { content: truncateText(parsedResponse.answer, 2000) },
    //                 type: 'text' as const,
    //               },
    //             ],
    //             // 성공 여부
    //             [{ text: { content: result.success ? '✅' : '❌' }, type: 'text' as const }],
    //             // 점수
    //             [
    //               {
    //                 text: { content: `${result.score !== null ? result.score : ''}` },
    //                 type: 'text' as const,
    //               },
    //             ],
    //             // 프롬프트 토큰
    //             [{ text: { content: `${parsedResponse.prompt_tokens}` }, type: 'text' as const }],
    //             // 완료 토큰
    //             [
    //               {
    //                 text: { content: `${parsedResponse.completion_tokens}` },
    //                 type: 'text' as const,
    //               },
    //             ],
    //             // 전체 토큰
    //             [{ text: { content: `${parsedResponse.total_tokens}` }, type: 'text' as const }],
    //           ],
    //         },
    //       };

    //       // 테이블에 행 추가
    //       await notion.blocks.children.append({
    //         block_id: tableBlock.id,
    //         children: [rowBlock],
    //       });

    //       console.log('테이블 행이 추가되었습니다.');
    //     } catch (error) {
    //       console.error('테이블 행 추가 중 오류 발생:', error);
    //     }
    //   }
    // } else {
    //   console.log(`테이블 블록을 찾을 수 없습니다.`);
    // }

    console.log('모든 결과가 Notion에 성공적으로 전송되었습니다!');
    const pageUrl = `https://notion.so/${page.id.replace(/-/g, '')}`;
    console.log(`🔗 Notion 페이지 링크: ${pageUrl}`);
    return page.id;
  } catch (error: any) {
    console.error('결과 전송 중 오류 발생:', error.message || error);
    if (error.code) {
      console.error(`오류 코드: ${error.code}`);
      if (
        Object.values(APIErrorCode).includes(error.code) ||
        Object.values(ClientErrorCode).includes(error.code) ||
        error.code === 'object_not_found' ||
        error.code === 'invalid_request' ||
        error.code === 'invalid_json'
      ) {
        console.error(`Notion 관련 오류 (${error.code}): ${error.message}`);
      }
    }
    return null;
  }
}

async function sendToSpreadSheet(
  providerKey: string,
  providerData: ParsedProviderData,
  overallConfigData: ResultFileContent['config']
): Promise<string | null> {
  if (!sheets || !drive) {
    console.warn(
      'Google Sheets 또는 Drive API가 초기화되지 않았습니다. 스프레드시트 생성을 건너뜁니다.'
    );
    return null;
  }

  const spreadsheetName = providerKey;
  const sheetName = overallConfigData.tags?.version || 'unknown_version';

  let spreadsheetId: string | undefined | null = null;

  try {
    console.log(
      `🔄 [Google Sheets] '${providerKey}' 스프레드시트 처리 시작 (시트: '${sheetName}')`
    );

    let query = `mimeType='application/vnd.google-apps.spreadsheet' and name='${spreadsheetName}' and trashed=false`;
    if (GOOGLE_DRIVE_FOLDER_ID) {
      query += ` and '${GOOGLE_DRIVE_FOLDER_ID}' in parents`;
    }

    try {
      const listResponse = await drive.files.list({
        q: query,
        fields: 'files(id, name, parents)',
        spaces: 'drive',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });

      if (listResponse.data.files && listResponse.data.files.length > 0) {
        const foundFile = GOOGLE_DRIVE_FOLDER_ID
          ? listResponse.data.files.find(
              (f: any) => f.parents && f.parents.includes(GOOGLE_DRIVE_FOLDER_ID!)
            )
          : listResponse.data.files[0];

        if (foundFile && foundFile.id) {
          spreadsheetId = foundFile.id;
          console.log(
            `[DEBUG] 기존 파일 찾음. spreadsheetId: ${spreadsheetId}, 파일명: ${foundFile.name}`
          );
        }
      }
    } catch (listError: any) {
      console.error(`[DEBUG] drive.files.list 호출 중 오류 발생!`, listError.message || listError);
      if (listError.errors)
        console.error(
          '[DEBUG] drive.files.list 오류 상세:',
          JSON.stringify(listError.errors, null, 2)
        );
      // listError가 발생하면 spreadsheetId는 여전히 null이므로, 아래에서 새 파일을 만들려고 시도할 것임
      // 또는 여기서 바로 return null 처리도 가능
    }

    if (!spreadsheetId) {
      console.log(
        `[DEBUG] 기존 파일을 찾지 못했거나 list 과정에서 오류 발생하여 새 스프레드시트를 생성합니다.`
      );
      const fileMetadata: any = {
        name: spreadsheetName,
        mimeType: 'application/vnd.google-apps.spreadsheet',
      };
      if (GOOGLE_DRIVE_FOLDER_ID) {
        fileMetadata.parents = [GOOGLE_DRIVE_FOLDER_ID];
      }

      try {
        // <--- drive.files.create 호출을 위한 try...catch 시작
        const createResponse = await drive.files.create({
          requestBody: fileMetadata,
          fields: 'id, name',
          supportsAllDrives: true,
        });
        spreadsheetId = createResponse.data.id;
        console.log(
          `✨ [Google Sheets] 새 스프레드시트 "${createResponse.data.name}" (ID: ${spreadsheetId})를 생성했습니다.`
        );
        if (GOOGLE_DRIVE_FOLDER_ID) {
          console.log(`   -> 폴더 ID '${GOOGLE_DRIVE_FOLDER_ID}'에 저장되었습니다.`);
        } else {
          console.log(`   -> 기본 위치에 저장되었습니다.`);
        }
      } catch (createError: any) {
        console.error(
          `[DEBUG] drive.files.create 호출 중 오류 발생!`,
          createError.message || createError
        );
        if (createError.errors)
          console.error(
            '[DEBUG] drive.files.create 오류 상세:',
            JSON.stringify(createError.errors, null, 2)
          );
        // createError 발생 시 spreadsheetId는 여전히 null이므로, 아래 if (!spreadsheetId) 에서 걸러짐
      }
    }

    console.log(`[DEBUG] 사용할 최종 spreadsheetId: ${spreadsheetId}`);

    if (!spreadsheetId) {
      console.error(
        `❌ [Google Sheets] 스프레드시트 '${spreadsheetName}'를 위한 ID를 결정하지 못했습니다. (list 또는 create 실패)`
      );
      return null;
    }

    // --- 이하 시트 처리 로직은 동일 ---
    let sheetIdToUse: number | undefined | null;
    console.log(`[DEBUG] spreadsheetId '${spreadsheetId}'로 시트 정보 가져오기 시도...`);
    const spreadsheetInfo = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets(properties(sheetId,title))',
    });
    // ... (이하 기존 코드와 동일)

    const existingSheet = spreadsheetInfo.data.sheets?.find(
      (s: any) => s.properties?.title === sheetName
    );

    if (existingSheet && existingSheet.properties?.sheetId != null) {
      sheetIdToUse = existingSheet.properties.sheetId;
      console.log(
        `📄 [Google Sheets] 기존 시트 "${sheetName}" (ID: ${sheetIdToUse})를 찾았습니다.`
      );
      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: sheetName,
      });
      console.log(`🧹 [Google Sheets] 기존 시트 "${sheetName}"의 내용을 삭제했습니다.`);
    } else {
      const addSheetResponse = await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName,
                },
              },
            },
          ],
        },
      });
      const newSheetProperties = addSheetResponse.data.replies?.[0]?.addSheet?.properties;
      sheetIdToUse = newSheetProperties?.sheetId;
      console.log(
        `✨ [Google Sheets] 새 시트 "${sheetName}" (ID: ${sheetIdToUse})를 생성했습니다.`
      );

      if (sheetName !== 'Sheet1') {
        const defaultSheet = spreadsheetInfo.data.sheets?.find(
          (s: any) => s.properties?.title === 'Sheet1'
        );
        if (defaultSheet && defaultSheet.properties?.sheetId != null) {
          const currentSheetsPostAdd = (
            await sheets.spreadsheets.get({ spreadsheetId, fields: 'sheets.properties.sheetId' })
          ).data.sheets;
          if (currentSheetsPostAdd && currentSheetsPostAdd.length > 1) {
            try {
              console.log(
                `🗑️ [Google Sheets] 기본 시트 'Sheet1' (ID: ${defaultSheet.properties.sheetId}) 삭제 시도 중...`
              );
              await sheets.spreadsheets.batchUpdate({
                spreadsheetId,
                requestBody: {
                  requests: [{ deleteSheet: { sheetId: defaultSheet.properties.sheetId } }],
                },
              });
              console.log("👍 [Google Sheets] 기본 시트 'Sheet1'을 성공적으로 삭제했습니다.");
            } catch (delError) {
              console.warn("⚠️ [Google Sheets] 기본 시트 'Sheet1' 삭제 중 오류:", delError);
            }
          }
        }
      }
    }

    if (sheetIdToUse === undefined || sheetIdToUse === null) {
      console.error(
        `❌ [Google Sheets] 시트 '${sheetName}' (스프레드시트 ID: ${spreadsheetId})를 찾거나 생성하는 데 실패했습니다.`
      );
      return null;
    }
    console.log(`[DEBUG] 사용할 최종 sheetIdToUse: ${sheetIdToUse}`);

    const headerRow = [
      'Question',
      'Response',
      'Answer',
      'Success',
      'Score',
      'Prompt Tokens',
      'Completion Tokens',
      'Total Tokens',
      'Error',
    ];

    // console.log('providerData: ', JSON.stringify(providerData, null, 2));
    const dataRows = providerData.results
      .map((result: TestResult) => {
        try {
          const question = result.testCase?.vars?.question || '';
          const answer = result.testCase?.vars?.answer || '';
          const responseOutput = result.response || '';
          const success = result.success;
          const score = result.score ?? (result.success ? 1 : 0);
          const error = result.error || '';

          // 새로운 함수 사용
          const parsedResponse = parseResponseData(responseOutput);

          // 토큰 사용량 정보 추출
          const tokenUsage = result.response?.tokenUsage || {
            prompt: 0,
            completion: 0,
            total: 0,
          };

          // null 값 체크 및 기본값 설정
          const promptTokens = tokenUsage.prompt ?? 0;
          const completionTokens = tokenUsage.completion ?? 0;
          const totalTokens = tokenUsage.total ?? promptTokens + completionTokens;

          // 유효성 검사
          if (
            typeof promptTokens !== 'number' ||
            typeof completionTokens !== 'number' ||
            typeof totalTokens !== 'number' ||
            isNaN(promptTokens) ||
            isNaN(completionTokens) ||
            isNaN(totalTokens)
          ) {
            console.warn(
              `[Google Sheets] 유효하지 않은 토큰 사용량 데이터 발견, 행을 건너뜁니다:`,
              {
                promptTokens,
                completionTokens,
                totalTokens,
              }
            );
            return null;
          }

          // 응답 데이터 유효성 검사
          if (typeof parsedResponse.response !== 'string') {
            console.warn(
              `[Google Sheets] 유효하지 않은 응답 데이터 발견, 행을 건너뜁니다:`,
              parsedResponse
            );
            return null;
          }

          return [
            question,
            parsedResponse.response || '',
            answer,
            success,
            score,
            promptTokens,
            completionTokens,
            totalTokens,
            JSON.stringify(error, null, 2),
          ];
        } catch (error) {
          console.warn(`[Google Sheets] 행 처리 중 오류 발생, 건너뜁니다:`, error);
          return null;
        }
      })
      .filter((row): row is string[] => row !== null); // null인 행 제거

    // 데이터가 비어있는지 확인
    if (dataRows.length === 0) {
      console.warn(`[Google Sheets] 유효한 데이터가 없습니다. 스프레드시트 업데이트를 건너뜁니다.`);
      return null;
    }

    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [headerRow, ...dataRows],
        },
      });
      console.log(`💾 [Google Sheets] 데이터가 시트 "${sheetName}"에 성공적으로 작성되었습니다.`);

      const sheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=${sheetIdToUse}`;
      console.log(`🔗 [Google Sheets] 스프레드시트 URL: ${sheetUrl}`);
      return sheetUrl;
    } catch (updateError: any) {
      console.error(
        `❌ [Google Sheets] 데이터 업데이트 중 오류 발생:`,
        updateError.message || updateError
      );
      if (updateError.response?.data?.error) {
        console.error(
          'Google API 오류 상세:',
          JSON.stringify(updateError.response.data.error, null, 2)
        );
      }
      return null;
    }
  } catch (error: any) {
    console.error(
      `❌ [Google Sheets] '${providerKey}' 처리 중 오류 발생 (시도된 spreadsheetId: ${spreadsheetId || '결정 안됨/오류 발생 전'}):`,
      error.message || error
    );
    if (error.response?.data?.error) {
      console.error('Google API 오류 상세:', JSON.stringify(error.response.data.error, null, 2));
    } else if (error.errors) {
      console.error('Google API 오류 상세 (errors array):', JSON.stringify(error.errors, null, 2));
    }
    return null;
  }
}

async function mainProcess(resultFilePath: string): Promise<void> {
  if (!validateEnvironment() || !checkResultFile(resultFilePath)) {
    process.exit(1);
  }
  const googleApisInitialized = await initializeGoogleApis();

  console.log('📄 결과 파일 파싱 중...');
  const parsedDataByProvider = parseResultsByProvider(resultFilePath); // parser.ts의 함수 사용

  if (!parsedDataByProvider) {
    console.error('결과 파일 파싱에 실패했습니다.');
    process.exit(1);
  }

  // console.log('parsedDataByProvider: ', JSON.stringify(parsedDataByProvider, null, 2));

  // 전체 config와 timestamp는 한 번만 로드 (ResultFileContent 구조를 사용)
  let rawFullData: ResultFileContent | null = null;
  try {
    const fileContent = fs.readFileSync(resultFilePath, 'utf8');
    rawFullData = JSON.parse(fileContent) as ResultFileContent;
  } catch (error) {
    console.error(`전체 결과 파일 (${resultFilePath}) 로드 중 오류 발생:`, error);
    process.exit(1);
  }

  if (!rawFullData || !rawFullData.config || !rawFullData.results) {
    console.error('전체 결과 파일의 구조가 올바르지 않습니다 (config 또는 results 누락).');
    process.exit(1);
  }

  const overallConfigData = rawFullData.config;
  const overallTimestamp = rawFullData.results.timestamp;

  console.log(
    `총 ${Object.keys(parsedDataByProvider).length}개의 Provider(시스템 프롬프트)에 대한 결과 처리 시작...`
  );

  for (const providerKey in parsedDataByProvider) {
    if (Object.prototype.hasOwnProperty.call(parsedDataByProvider, providerKey)) {
      const providerData = parsedDataByProvider[providerKey];

      let sheetUrl: string | null = null;
      if (googleApisInitialized) {
        sheetUrl = await sendToSpreadSheet(providerKey, providerData, overallConfigData);
      }
      console.log('sheetUrl: ', sheetUrl);

      await sendDataToNotion(providerKey, providerData, overallConfigData, sheetUrl);
    }
  }
  console.log('모든 Provider에 대한 Notion 페이지 생성이 완료되었습니다 (또는 시도되었습니다).');
}

const currentFileUrl = new URL(import.meta.url);
const currentFilePath =
  process.platform === 'win32' && currentFileUrl.protocol === 'file:'
    ? currentFileUrl.pathname.substring(1).replace(/\//g, '\\') // Windows 경로 슬래시 변경
    : currentFileUrl.pathname;

const scriptWasCalledDirectly = path.resolve(process.argv[1]) === path.resolve(currentFilePath);

if (scriptWasCalledDirectly) {
  (async () => {
    try {
      console.log('🚀 Notion 파서 CLI 실행 중 (Provider별 페이지 생성)...');
      const resultFilePath = parseArgs();
      console.log(`📁 파싱할 결과 파일 경로: ${resultFilePath}`);
      await mainProcess(resultFilePath);
      console.log('✅ CLI 실행 완료.');
      process.exit(0);
    } catch (error) {
      console.error('❌ 최상위 오류 발생:', error);
      process.exit(1);
    }
  })();
}
