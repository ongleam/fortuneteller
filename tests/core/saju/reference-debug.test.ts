/**
 * Reference fetchSaju API 응답 디버깅 테스트
 * 실제 API 응답 구조를 상세히 분석합니다.
 */

import { fetchSaju } from '@/lib/core/saju/reference';

describe('Reference fetchSaju API 디버깅', () => {
  test('Reference API 전체 응답 구조 분석', async () => {
    console.log('\n🔍 === Reference fetchSaju API 상세 분석 ===');
    
    const testInput = {
      name: '홍길동',
      gender: '남성',
      birthType: 'solar',
      birthYear: '1995',
      birthMonth: '04',
      birthDay: '25',
      birthTime: '08'
    };

    console.log('📥 입력 데이터:');
    console.log(JSON.stringify(testInput, null, 2));

    try {
      const result = await fetchSaju(
        testInput.name,
        testInput.gender,
        testInput.birthType,
        testInput.birthYear,
        testInput.birthMonth,
        testInput.birthDay,
        testInput.birthTime
      );

      console.log('\n📤 === 전체 응답 구조 ===');
      console.log('Raw Result:', JSON.stringify(result, null, 2));

      console.log('\n🔍 === 응답 필드별 상세 분석 ===');
      
      // saju 필드 분석
      if (result.saju) {
        console.log('\n🏛️ SAJU 필드 분석:');
        console.log('Type of saju:', typeof result.saju);
        console.log('Is Array:', Array.isArray(result.saju));
        console.log('Keys:', Object.keys(result.saju));
        
        for (const [key, value] of Object.entries(result.saju)) {
          console.log(`  ${key}:`, typeof value, JSON.stringify(value));
          
          if (value && typeof value === 'object') {
            console.log(`    ${key} keys:`, Object.keys(value));
            for (const [subkey, subvalue] of Object.entries(value)) {
              console.log(`      ${subkey}:`, typeof subvalue, JSON.stringify(subvalue));
            }
          }
        }
      } else {
        console.log('\n❌ SAJU 필드가 없거나 null입니다.');
      }

      // sinsals 필드 분석
      if (result.sinsals) {
        console.log('\n🔮 SINSALS 필드 분석:');
        console.log('Type of sinsals:', typeof result.sinsals);
        console.log('Is Array:', Array.isArray(result.sinsals));
        
        if (Array.isArray(result.sinsals)) {
          console.log('Length:', result.sinsals.length);
          result.sinsals.forEach((sinsal, index) => {
            console.log(`  [${index}]:`, typeof sinsal, JSON.stringify(sinsal));
          });
        } else {
          console.log('Keys:', Object.keys(result.sinsals));
          for (const [key, value] of Object.entries(result.sinsals)) {
            console.log(`  ${key}:`, typeof value, JSON.stringify(value));
          }
        }
      } else {
        console.log('\n❌ SINSALS 필드가 없거나 null입니다.');
      }

      // 전체 구조 탐색
      console.log('\n🗂️ === 전체 응답 구조 탐색 ===');
      function exploreObject(obj: any, path = '', depth = 0) {
        if (depth > 3) return; // 최대 깊이 제한
        
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;
          console.log(`${'  '.repeat(depth)}${currentPath}: ${typeof value}`);
          
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            exploreObject(value, currentPath, depth + 1);
          } else if (Array.isArray(value)) {
            console.log(`${'  '.repeat(depth + 1)}[Array length: ${value.length}]`);
            if (value.length > 0) {
              console.log(`${'  '.repeat(depth + 1)}[0]: ${typeof value[0]} = ${JSON.stringify(value[0])}`);
            }
          } else {
            console.log(`${'  '.repeat(depth + 1)}Value: ${JSON.stringify(value)}`);
          }
        }
      }
      
      exploreObject(result);

      // 사주 기둥 데이터 찾기 시도
      console.log('\n🎯 === 사주 기둥 데이터 찾기 ===');
      
      function findSajuData(obj: any, path = '') {
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;
          
          // 한자 간지 패턴 찾기
          if (typeof value === 'string' && /[甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥]/.test(value)) {
            console.log(`🎯 한자 간지 발견: ${currentPath} = "${value}"`);
          }
          
          // stem, branch 같은 키워드 찾기
          if (key.toLowerCase().includes('stem') || key.toLowerCase().includes('branch') || 
              key.toLowerCase().includes('year') || key.toLowerCase().includes('month') ||
              key.toLowerCase().includes('day') || key.toLowerCase().includes('time') ||
              key.toLowerCase().includes('hour')) {
            console.log(`🔍 사주 관련 키 발견: ${currentPath} = ${JSON.stringify(value)}`);
          }
          
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            findSajuData(value, currentPath);
          }
        }
      }
      
      findSajuData(result);

      // 기본 검증
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');

    } catch (error) {
      console.error('\n❌ === API 호출 실패 ===');
      console.error('Error:', error instanceof Error ? error.message : String(error));
      console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      throw error;
    }
  }, 30000);

  test('다른 케이스로 API 응답 비교', async () => {
    console.log('\n🔍 === 다른 케이스 API 응답 비교 ===');
    
    const testCases = [
      {
        name: '김영희',
        gender: '여성',
        birthType: 'lunar',
        birthYear: '1988',
        birthMonth: '03',
        birthDay: '15',
        birthTime: '14'
      },
      {
        name: '박철수',
        gender: '남성',
        birthType: 'solar',
        birthYear: '2000',
        birthMonth: '01',
        birthDay: '01',
        birthTime: '12'
      }
    ];

    for (const [index, testCase] of testCases.entries()) {
      console.log(`\n📋 === 케이스 ${index + 1}: ${testCase.name} ===`);
      console.log('입력:', JSON.stringify(testCase, null, 2));

      try {
        const result = await fetchSaju(
          testCase.name,
          testCase.gender,
          testCase.birthType,
          testCase.birthYear,
          testCase.birthMonth,
          testCase.birthDay,
          testCase.birthTime
        );

        console.log(`결과 구조:`);
        console.log(`  saju 존재: ${!!result.saju}`);
        console.log(`  sinsals 존재: ${!!result.sinsals}`);
        
        if (result.saju) {
          console.log(`  saju keys: ${Object.keys(result.saju)}`);
        }
        
        if (result.sinsals) {
          console.log(`  sinsals type: ${typeof result.sinsals}`);
          if (typeof result.sinsals === 'object') {
            console.log(`  sinsals keys: ${Object.keys(result.sinsals)}`);
          }
        }

        // 간단한 JSON 출력
        console.log('Raw result:', JSON.stringify(result, null, 2));

      } catch (error) {
        console.error(`케이스 ${index + 1} 실패:`, error instanceof Error ? error.message : String(error));
      }

      // 다음 요청 전에 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }, 60000);
});