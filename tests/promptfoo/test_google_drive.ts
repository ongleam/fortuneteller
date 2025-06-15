// test_google_drive.ts
import { google, Auth } from 'googleapis';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { sheets } from 'googleapis/build/src/apis/sheets';

// .env.local 파일 로드 (프로젝트 루트에 있다고 가정)
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID; // 테스트할 부모 폴더 ID

let gs: any;
let drive: any;
async function testCreateSpreadsheetInFolder() {
  console.log('--- Google Drive API 테스트 시작 ---');

  if (!GOOGLE_APPLICATION_CREDENTIALS) {
    console.error('오류: GOOGLE_APPLICATION_CREDENTIALS 환경 변수가 설정되지 않았습니다.');
    return;
  }
  console.log(`사용 중인 Credentials 파일: ${GOOGLE_APPLICATION_CREDENTIALS}`);

  if (!GOOGLE_DRIVE_FOLDER_ID) {
    console.error(
      '오류: GOOGLE_DRIVE_FOLDER_ID 환경 변수가 설정되지 않았습니다. (테스트할 부모 폴더 ID)'
    );
    return;
  }
  console.log(`테스트할 부모 폴더 ID: ${GOOGLE_DRIVE_FOLDER_ID}`);

  let drive: any; // google.drive_v3.Drive;

  try {
    // 1. Google API 인증
    const auth = new google.auth.GoogleAuth({
      keyFile: GOOGLE_APPLICATION_CREDENTIALS,
      scopes: [
        'https://www.googleapis.com/auth/drive', // 파일 생성/관리에 필요한 최소 스코프
        'https://www.googleapis.com/auth/spreadsheets', // 이 테스트에서는 직접 시트 내용은 다루지 않으므로 일단 제외 가능
      ],
    });
    const authClient = await auth.getClient();
    drive = google.drive({ version: 'v3', auth: authClient as Auth.OAuth2Client });
    gs = google.sheets({ version: 'v4', auth: authClient as Auth.OAuth2Client });
    console.log('✅ Google API 인증 성공');

    // // 2. 새 스프레드시트 메타데이터 준비
    const spreadsheetName = `Test_Spreadsheet_${new Date().toISOString()}`;
    const fileMetadata: any = {
      name: spreadsheetName,
      mimeType: 'application/vnd.google-apps.spreadsheet',
      parents: [GOOGLE_DRIVE_FOLDER_ID], // 지정된 폴더에 생성
    };

    // 폴더 내 파일 목록 조회
    const listResponse = await drive.files.list({
      q: `'${GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed = false`,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      fields: 'nextPageToken, files(id, name, webViewLink, parents)',
    });

    console.log('폴더 내 파일 목록:', listResponse.data.files);

    // // 3. Drive API를 사용하여 스프레드시트 파일 생성
    console.log('⏳ 지정된 폴더에 새 스프레드시트 생성 시도...');
    const createResponse = await drive.files.create({
      requestBody: fileMetadata,
      supportsAllDrives: true,
      fields: 'id, name, webViewLink, parents', // 생성된 파일의 정보 요청
    });

    // console.log('✅ 새 스프레드시트 생성 성공!');
    // console.log(`   - 파일 ID: ${createResponse.data.id}`);
    // console.log(`   - 파일명: ${createResponse.data.name}`);
    // console.log(`   - 파일 링크: ${createResponse.data.webViewLink}`);
    // console.log(`   - 부모 폴더 ID: ${JSON.stringify(createResponse.data.parents)}`);

    // // if (
    //   createResponse.data.parents &&
    //   createResponse.data.parents.includes(GOOGLE_DRIVE_FOLDER_ID)
    // ) {
    //   console.log(
    //     `👍 성공: 스프레드시트가 지정된 폴더(${GOOGLE_DRIVE_FOLDER_ID})에 올바르게 생성되었습니다.`
    //   );
    // } else {
    //   console.warn(
    //     `⚠️ 경고: 스프레드시트는 생성되었으나, 지정된 폴더(${GOOGLE_DRIVE_FOLDER_ID})에 정확히 위치했는지 확인이 필요합니다. (부모 폴더: ${JSON.stringify(createResponse.data.parents)})`
    //   );
    // }
  } catch (error: any) {
    console.error('❌ 테스트 중 오류 발생:');
    if (error.message) {
      console.error(`   - 메시지: ${error.message}`);
    }
    if (error.code) {
      console.error(`   - 코드: ${error.code}`);
    }
    if (error.errors) {
      // Google API 클라이언트 라이브러리가 반환하는 상세 오류
      console.error('   - 상세 오류:');
      error.errors.forEach((err: any, index: number) => {
        console.error(
          `     [${index}] message: ${err.message}, domain: ${err.domain}, reason: ${err.reason}, location: ${err.location}, locationType: ${err.locationType}`
        );
      });
    }
    // 전체 오류 객체도 로깅하여 추가 정보 확인
    // console.error('   - 전체 오류 객체:', error);
  } finally {
    console.log('--- Google Drive API 테스트 종료 ---');
  }
}

// 테스트 실행
testCreateSpreadsheetInFolder();
