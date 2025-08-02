/**
 * fetchSaju 기준 테스트 데이터 생성 스크립트
 */

import { generateTestData } from '../lib/utils/saju/test-data';

async function main() {
  try {
    const testData = await generateTestData();
    
    console.log('\n=== 생성된 테스트 데이터 ===');
    console.log(JSON.stringify(testData, null, 2));
    
    // 파일로 저장
    const fs = require('fs');
    const path = require('path');
    
    const outputPath = path.join(__dirname, '../lib/utils/saju/expected-results.json');
    fs.writeFileSync(outputPath, JSON.stringify(testData, null, 2));
    
    console.log(`\n✅ 테스트 데이터가 저장되었습니다: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ 테스트 데이터 생성 실패:', error);
    process.exit(1);
  }
}

main();