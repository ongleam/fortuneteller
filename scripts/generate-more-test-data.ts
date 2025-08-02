/**
 * 더 많은 fetchSaju 테스트 데이터 생성
 */

import { fetchSaju } from '../lib/utils/saju';

const additionalTestCases = [
  {
    name: "2000년 양력 케이스",
    input: { name: "홍길동", gender: "MALE", birthType: "SOLAR", birthYear: "2000", birthMonth: "01", birthDay: "01", birthTime: "12" }
  },
  {
    name: "1985년 음력 케이스", 
    input: { name: "김영희", gender: "FEMALE", birthType: "LUNAR", birthYear: "1985", birthMonth: "08", birthDay: "15", birthTime: "18" }
  },
  {
    name: "1970년 양력 케이스",
    input: { name: "박철수", gender: "MALE", birthType: "SOLAR", birthYear: "1970", birthMonth: "12", birthDay: "31", birthTime: "00" }
  }
];

async function generateAdditionalTestData() {
  console.log('=== 추가 fetchSaju 테스트 데이터 생성 ===\n');
  
  for (const testCase of additionalTestCases) {
    try {
      console.log(`처리 중: ${testCase.name}`);
      
      const result = await fetchSaju(
        testCase.input.name,
        testCase.input.gender,
        testCase.input.birthType,
        testCase.input.birthYear,
        testCase.input.birthMonth,
        testCase.input.birthDay,
        testCase.input.birthTime
      );
      
      const storedUnse = result?.saju?.fortuneList?.storedUnse;
      if (storedUnse) {
        const pillars = `${storedUnse.yearSky}${storedUnse.yearGround} ${storedUnse.monthSky}${storedUnse.monthGround} ${storedUnse.daySky}${storedUnse.dayGround} ${storedUnse.timeSky}${storedUnse.timeGround}`;
        
        console.log(`✅ ${testCase.name}:`);
        console.log(`   입력: ${testCase.input.birthYear}-${testCase.input.birthMonth}-${testCase.input.birthDay} ${testCase.input.birthTime}시 (${testCase.input.birthType})`);
        console.log(`   팔자: ${pillars}`);
        console.log('');
      }
      
    } catch (error) {
      console.error(`❌ ${testCase.name} 실패:`, error);
    }
  }
}

generateAdditionalTestData();