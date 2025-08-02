/**
 * fetchSaju 호출을 통한 테스트 데이터 생성 및 검증용 유틸리티
 */

import { fetchSaju } from '../saju';

// 테스트 케이스 정의
export const testCases = [
  {
    name: "양력 남성 케이스",
    input: {
      name: "김은식",
      gender: "MALE",
      birthType: "SOLAR", 
      birthYear: "1995",
      birthMonth: "04",
      birthDay: "25", 
      birthTime: "08"
    }
  },
  {
    name: "음력 여성 케이스",
    input: {
      name: "이영희",
      gender: "FEMALE",
      birthType: "LUNAR",
      birthYear: "1988",
      birthMonth: "03",
      birthDay: "15",
      birthTime: "14"
    }
  }
] as const;

// fetchSaju 결과에서 핵심 필드 추출
export function extractEssentials(sajuOutput: any) {
  const storedUnse = sajuOutput?.saju?.fortuneList?.storedUnse;
  if (!storedUnse) {
    throw new Error('Invalid fetchSaju output structure');
  }

  return {
    pillars: {
      year: { stem: storedUnse.yearSky, branch: storedUnse.yearGround },
      month: { stem: storedUnse.monthSky, branch: storedUnse.monthGround },
      day: { stem: storedUnse.daySky, branch: storedUnse.dayGround },
      time: { stem: storedUnse.timeSky, branch: storedUnse.timeGround }
    },
    tenStars: {
      yearStem: storedUnse.manseYearSkyRelation,
      yearBranch: storedUnse.manseYearGroundRelation,
      monthStem: storedUnse.manseMonthSkyRelation,
      monthBranch: storedUnse.manseMonthGroundRelation,
      dayStem: storedUnse.manseDaySkyRelation,
      dayBranch: storedUnse.manseDayGroundRelation,
      timeStem: storedUnse.manseTimeSkyRelation,
      timeBranch: storedUnse.manseTimeGroundRelation
    },
    elements: {
      wood: storedUnse.fiveTreeNum,
      fire: storedUnse.fiveFireNum,
      earth: storedUnse.fiveSoilNum,
      metal: storedUnse.fiveIronNum,
      water: storedUnse.fiveWaterNum
    },
    sinsals: [
      sajuOutput?.sinsals?.firstSinsal || '',
      sajuOutput?.sinsals?.secondSinsal || '',
      sajuOutput?.sinsals?.thirdSinsal || ''
    ]
  };
}

// 테스트 데이터 생성 함수
export async function generateTestData() {
  console.log('=== fetchSaju 테스트 데이터 생성 중... ===');
  
  const testData = [];
  
  for (const testCase of testCases) {
    try {
      console.log(`\n처리 중: ${testCase.name}`);
      
      const result = await fetchSaju(
        testCase.input.name,
        testCase.input.gender,
        testCase.input.birthType,
        testCase.input.birthYear,
        testCase.input.birthMonth,
        testCase.input.birthDay,
        testCase.input.birthTime
      );
      
      const essentials = extractEssentials(result);
      
      testData.push({
        ...testCase,
        expected: essentials,
        rawResult: result
      });
      
      console.log(`✅ ${testCase.name} 완료`);
      console.log(`   팔자: ${essentials.pillars.year.stem}${essentials.pillars.year.branch} ${essentials.pillars.month.stem}${essentials.pillars.month.branch} ${essentials.pillars.day.stem}${essentials.pillars.day.branch} ${essentials.pillars.time.stem}${essentials.pillars.time.branch}`);
      
    } catch (error) {
      console.error(`❌ ${testCase.name} 실패:`, error);
    }
  }
  
  return testData;
}

// 결과 비교 함수
export function compareResults(actual: any, expected: any) {
  const errors: string[] = [];
  
  // 팔자 비교
  if (actual.pillars.year.stem !== expected.pillars.year.stem) {
    errors.push(`년간 불일치: ${actual.pillars.year.stem} !== ${expected.pillars.year.stem}`);
  }
  if (actual.pillars.year.branch !== expected.pillars.year.branch) {
    errors.push(`년지 불일치: ${actual.pillars.year.branch} !== ${expected.pillars.year.branch}`);
  }
  
  // 십성 비교
  if (actual.tenStars.yearStem !== expected.tenStars.yearStem) {
    errors.push(`년간 십성 불일치: ${actual.tenStars.yearStem} !== ${expected.tenStars.yearStem}`);
  }
  
  // 오행 비교
  if (actual.elements.wood !== expected.elements.wood) {
    errors.push(`목 개수 불일치: ${actual.elements.wood} !== ${expected.elements.wood}`);
  }
  
  return {
    isMatch: errors.length === 0,
    errors,
    matchRate: 1 - (errors.length / 10) // 총 10개 주요 필드 기준
  };
}