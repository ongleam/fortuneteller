#!/usr/bin/env node
/**
 * 통합 사주 테스트셋 생성기
 * 하나의 comprehensive testset을 만들어 모든 테스트가 공유하도록 함
 */

import fs from 'fs/promises';
import path from 'path';
// 스크립트용 reference 유틸리티 사용 (server-only 의존성 제거)
import { getReferenceSajuData, normalizeCalendarType } from './saju-reference-utils';

interface BirthInput {
  name?: string;
  gender: string;
  calendar: string;
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  isLeapMonth?: boolean;
}

interface ComprehensiveTestCase {
  input: BirthInput;
  description: string;
  referenceData: any;
  timestamp: string;
}


/**
 * 다양한 테스트 케이스 입력들을 생성
 * 기존 테스트에서 발견한 모든 edge case들을 반영하여 100개 케이스 생성
 */
function generateTestInputs(): Array<{ input: BirthInput; description: string }> {
  const inputs: Array<{ input: BirthInput; description: string }> = [];

  // 1. 윤달 테스트 케이스들 (6개)
  const leapMonthCases = [
    { year: 2023, month: 2, day: 15, hour: 10, minute: 30, desc: '윤달 케이스' },
    { year: 2020, month: 4, day: 1, hour: 8, minute: 0, desc: '윤달 케이스' },
    { year: 2001, month: 4, day: 20, hour: 18, minute: 5, desc: '윤달 케이스' },
  ];

  for (const c of leapMonthCases) {
    // 윤달 케이스
    inputs.push({
      description: `음력 ${c.year}년 윤${c.month}월 ${c.day}일 ${c.hour}시 ${c.minute}분 (여성) - ${c.desc}`,
      input: {
        name: '테스트',
        year: String(c.year),
        month: String(c.month),
        day: String(c.day),
        hour: String(c.hour),
        minute: String(c.minute),
        gender: '여성',
        calendar: '음력',
        isLeapMonth: true,
      },
    });

    // 일반달 케이스
    inputs.push({
      description: `음력 ${c.year}년 ${c.month}월 ${c.day}일 ${c.hour}시 ${c.minute}분 (남성) - 일반달 케이스`,
      input: {
        name: '테스트',
        year: String(c.year),
        month: String(c.month),
        day: String(c.day),
        hour: String(c.hour),
        minute: String(c.minute),
        gender: '남성',
        calendar: '음력',
        isLeapMonth: false,
      },
    });
  }

  // 2. 2자리 년도 변환 edge case들 (10개)
  const twoDigitYearCases = [
    { year: '95', month: 4, day: 25, hour: 12, minute: 0, gender: '남성', calendar: '양력', desc: '2자리 년도 95 (1995)' },
    { year: '05', month: 8, day: 15, hour: 14, minute: 30, gender: '여성', calendar: '음력', desc: '2자리 년도 05 (2005)' },
    { year: '25', month: 1, day: 1, hour: 0, minute: 0, gender: '남성', calendar: '양력', desc: '2자리 년도 25 (2025)' },
    { year: '50', month: 12, day: 31, hour: 23, minute: 59, gender: '여성', calendar: '음력', desc: '2자리 년도 50 (1950)' },
    { year: '88', month: 6, day: 15, hour: 12, minute: 30, gender: '남성', calendar: '양력', desc: '2자리 년도 88 (1988)' },
    { year: '00', month: 2, day: 29, hour: 12, minute: 0, gender: '여성', calendar: '양력', desc: '2자리 년도 00 (2000) - 윤년' },
    { year: '44', month: 3, day: 21, hour: 6, minute: 0, gender: '남성', calendar: '음력', desc: '경계값 44 (2044)' },
    { year: '45', month: 9, day: 23, hour: 18, minute: 0, gender: '여성', calendar: '양력', desc: '경계값 45 (2045)' },
    { year: '46', month: 7, day: 7, hour: 14, minute: 30, gender: '남성', calendar: '음력', desc: '경계값 46 (1946)' },
    { year: '5', month: 5, day: 5, hour: 5, minute: 5, gender: '여성', calendar: '양력', desc: '1자리 년도 5 (2005)' },
  ];

  twoDigitYearCases.forEach((c) => {
    inputs.push({
      description: `${c.calendar} ${c.year}년 ${c.month}월 ${c.day}일 ${c.hour}시 ${c.minute}분 (${c.gender}) - ${c.desc}`,
      input: {
        name: '테스트',
        year: c.year,
        month: String(c.month),
        day: String(c.day),
        hour: String(c.hour),
        minute: String(c.minute),
        gender: c.gender,
        calendar: c.calendar,
        isLeapMonth: false,
      },
    });
  });

  // 3. 시간 경계값 edge case들 (14개)
  const timeBoundaryCases = [
    { year: 1990, month: 1, day: 15, hour: 0, minute: 0, gender: '남성', calendar: '음력', desc: '자시 시작(00:00)' },
    { year: 1991, month: 2, day: 14, hour: 23, minute: 30, gender: '여성', calendar: '양력', desc: '자시(23:30) - 하루 경계' },
    { year: 1992, month: 3, day: 20, hour: 23, minute: 59, gender: '남성', calendar: '음력', desc: '자시 끝(23:59) - 하루 경계' },
    { year: 1993, month: 4, day: 10, hour: 1, minute: 30, gender: '여성', calendar: '양력', desc: '축시(01:30)' },
    { year: 1994, month: 5, day: 25, hour: 3, minute: 30, gender: '남성', calendar: '음력', desc: '인시(03:30) - 새벽 시간' },
    { year: 1995, month: 6, day: 15, hour: 5, minute: 30, gender: '여성', calendar: '양력', desc: '묘시(05:30)' },
    { year: 1996, month: 7, day: 4, hour: 7, minute: 30, gender: '남성', calendar: '음력', desc: '진시(07:30)' },
    { year: 1997, month: 8, day: 8, hour: 9, minute: 30, gender: '여성', calendar: '양력', desc: '사시(09:30)' },
    { year: 1998, month: 9, day: 23, hour: 11, minute: 30, gender: '남성', calendar: '음력', desc: '오시(11:30)' },
    { year: 1999, month: 10, day: 31, hour: 13, minute: 30, gender: '여성', calendar: '양력', desc: '미시(13:30)' },
    { year: 2000, month: 11, day: 11, hour: 15, minute: 30, gender: '남성', calendar: '음력', desc: '신시(15:30)' },
    { year: 2001, month: 12, day: 25, hour: 17, minute: 30, gender: '여성', calendar: '양력', desc: '유시(17:30)' },
    { year: 2002, month: 1, day: 31, hour: 19, minute: 30, gender: '남성', calendar: '음력', desc: '술시(19:30)' },
    { year: 2003, month: 2, day: 28, hour: 21, minute: 30, gender: '여성', calendar: '양력', desc: '해시(21:30)' },
  ];

  timeBoundaryCases.forEach((c) => {
    inputs.push({
      description: `${c.calendar} ${c.year}년 ${c.month}월 ${c.day}일 ${c.hour}시 ${c.minute}분 (${c.gender}) - ${c.desc}`,
      input: {
        name: '테스트',
        year: String(c.year),
        month: String(c.month),
        day: String(c.day),
        hour: String(c.hour),
        minute: String(c.minute),
        gender: c.gender,
        calendar: c.calendar,
        isLeapMonth: false,
      },
    });
  });

  // 4. 윤년 2월 29일 edge case들 (6개)
  const leapYearCases = [
    { year: 2000, month: 2, day: 29, hour: 12, minute: 0, gender: '남성', calendar: '양력', desc: '윤년 2000년 2월 29일' },
    { year: 2004, month: 2, day: 29, hour: 6, minute: 30, gender: '여성', calendar: '양력', desc: '윤년 2004년 2월 29일' },
    { year: 2008, month: 2, day: 29, hour: 18, minute: 45, gender: '남성', calendar: '양력', desc: '윤년 2008년 2월 29일' },
    { year: 2012, month: 2, day: 29, hour: 0, minute: 0, gender: '여성', calendar: '양력', desc: '윤년 2012년 2월 29일 - 자시' },
    { year: 2016, month: 2, day: 29, hour: 23, minute: 59, gender: '남성', calendar: '양력', desc: '윤년 2016년 2월 29일 - 하루 끝' },
    { year: 2020, month: 2, day: 29, hour: 12, minute: 30, gender: '여성', calendar: '양력', desc: '윤년 2020년 2월 29일' },
  ];

  leapYearCases.forEach((c) => {
    inputs.push({
      description: `${c.calendar} ${c.year}년 ${c.month}월 ${c.day}일 ${c.hour}시 ${c.minute}분 (${c.gender}) - ${c.desc}`,
      input: {
        name: '테스트',
        year: String(c.year),
        month: String(c.month),
        day: String(c.day),
        hour: String(c.hour),
        minute: String(c.minute),
        gender: c.gender,
        calendar: c.calendar,
        isLeapMonth: false,
      },
    });
  });

  // 5. 월말/월초 edge case들 (15개)
  const monthEndCases = [
    { year: 1995, month: 1, day: 31, hour: 23, minute: 59, gender: '여성', calendar: '양력', desc: '1월 마지막 날' },
    { year: 1996, month: 3, day: 31, hour: 0, minute: 1, gender: '남성', calendar: '음력', desc: '3월 마지막 날' },
    { year: 1997, month: 5, day: 31, hour: 12, minute: 30, gender: '여성', calendar: '양력', desc: '5월 마지막 날' },
    { year: 1998, month: 7, day: 31, hour: 6, minute: 15, gender: '남성', calendar: '음력', desc: '7월 마지막 날' },
    { year: 1999, month: 8, day: 31, hour: 18, minute: 45, gender: '여성', calendar: '양력', desc: '8월 마지막 날' },
    { year: 2000, month: 10, day: 31, hour: 23, minute: 30, gender: '남성', calendar: '음력', desc: '10월 마지막 날' },
    { year: 2001, month: 12, day: 31, hour: 11, minute: 59, gender: '여성', calendar: '양력', desc: '12월 마지막 날' },
    { year: 2002, month: 4, day: 30, hour: 12, minute: 0, gender: '남성', calendar: '음력', desc: '4월 마지막 날' },
    { year: 2003, month: 6, day: 30, hour: 15, minute: 30, gender: '여성', calendar: '양력', desc: '6월 마지막 날' },
    { year: 2004, month: 9, day: 30, hour: 9, minute: 0, gender: '남성', calendar: '음력', desc: '9월 마지막 날' },
    { year: 2005, month: 11, day: 30, hour: 21, minute: 15, gender: '여성', calendar: '양력', desc: '11월 마지막 날' },
    { year: 2006, month: 2, day: 28, hour: 12, minute: 0, gender: '남성', calendar: '음력', desc: '평년 2월 마지막 날' },
    { year: 2007, month: 1, day: 1, hour: 0, minute: 0, gender: '여성', calendar: '양력', desc: '1월 첫날' },
    { year: 2008, month: 3, day: 1, hour: 6, minute: 30, gender: '남성', calendar: '음력', desc: '3월 첫날' },
    { year: 2009, month: 12, day: 1, hour: 18, minute: 45, gender: '여성', calendar: '양력', desc: '12월 첫날' },
  ];

  monthEndCases.forEach((c) => {
    inputs.push({
      description: `${c.calendar} ${c.year}년 ${c.month}월 ${c.day}일 ${c.hour}시 ${c.minute}분 (${c.gender}) - ${c.desc}`,
      input: {
        name: '테스트',
        year: String(c.year),
        month: String(c.month),
        day: String(c.day),
        hour: String(c.hour),
        minute: String(c.minute),
        gender: c.gender,
        calendar: c.calendar,
        isLeapMonth: false,
      },
    });
  });

  // 6. 계절 변환점 edge case들 (12개)
  const seasonalCases = [
    { year: 2010, month: 3, day: 20, hour: 12, minute: 0, gender: '남성', calendar: '양력', desc: '춘분' },
    { year: 2011, month: 6, day: 21, hour: 12, minute: 0, gender: '여성', calendar: '음력', desc: '하지' },
    { year: 2012, month: 9, day: 23, hour: 12, minute: 0, gender: '남성', calendar: '양력', desc: '추분' },
    { year: 2013, month: 12, day: 22, hour: 12, minute: 0, gender: '여성', calendar: '음력', desc: '동지' },
    { year: 2014, month: 5, day: 5, hour: 12, minute: 0, gender: '남성', calendar: '양력', desc: '입하' },
    { year: 2015, month: 2, day: 4, hour: 12, minute: 0, gender: '여성', calendar: '음력', desc: '입춘' },
    { year: 2016, month: 8, day: 7, hour: 12, minute: 0, gender: '남성', calendar: '양력', desc: '입추' },
    { year: 2017, month: 11, day: 7, hour: 12, minute: 0, gender: '여성', calendar: '음력', desc: '입동' },
    { year: 2018, month: 4, day: 20, hour: 6, minute: 0, gender: '남성', calendar: '양력', desc: '곡우' },
    { year: 2019, month: 10, day: 8, hour: 18, minute: 0, gender: '여성', calendar: '음력', desc: '한로' },
    { year: 2020, month: 1, day: 20, hour: 0, minute: 0, gender: '남성', calendar: '양력', desc: '대한' },
    { year: 2021, month: 7, day: 23, hour: 23, minute: 59, gender: '여성', calendar: '음력', desc: '대서' },
  ];

  seasonalCases.forEach((c) => {
    inputs.push({
      description: `${c.calendar} ${c.year}년 ${c.month}월 ${c.day}일 ${c.hour}시 ${c.minute}분 (${c.gender}) - ${c.desc}`,
      input: {
        name: '테스트',
        year: String(c.year),
        month: String(c.month),
        day: String(c.day),
        hour: String(c.hour),
        minute: String(c.minute),
        gender: c.gender,
        calendar: c.calendar,
        isLeapMonth: false,
      },
    });
  });

  // 7. 새해/섣달 edge case들 (8개)
  const newYearCases = [
    { year: 2015, month: 1, day: 1, hour: 0, minute: 0, gender: '남성', calendar: '양력', desc: '새해 첫날 00:00' },
    { year: 2016, month: 1, day: 1, hour: 23, minute: 59, gender: '여성', calendar: '음력', desc: '음력 새해 마지막 시간' },
    { year: 2017, month: 12, day: 31, hour: 23, minute: 59, gender: '남성', calendar: '양력', desc: '섣달 그믐' },
    { year: 2018, month: 12, day: 30, hour: 0, minute: 1, gender: '여성', calendar: '음력', desc: '음력 섣달' },
    { year: 2019, month: 1, day: 1, hour: 12, minute: 0, gender: '남성', calendar: '양력', desc: '새해 정오' },
    { year: 2020, month: 1, day: 2, hour: 6, minute: 30, gender: '여성', calendar: '음력', desc: '음력 새해 둘째날' },
    { year: 2021, month: 12, day: 30, hour: 18, minute: 0, gender: '남성', calendar: '양력', desc: '섣달 그믐 전날' },
    { year: 2022, month: 12, day: 29, hour: 12, minute: 30, gender: '여성', calendar: '음력', desc: '음력 섣달 그믐 전날' },
  ];

  newYearCases.forEach((c) => {
    inputs.push({
      description: `${c.calendar} ${c.year}년 ${c.month}월 ${c.day}일 ${c.hour}시 ${c.minute}분 (${c.gender}) - ${c.desc}`,
      input: {
        name: '테스트',
        year: String(c.year),
        month: String(c.month),
        day: String(c.day),
        hour: String(c.hour),
        minute: String(c.minute),
        gender: c.gender,
        calendar: c.calendar,
        isLeapMonth: false,
      },
    });
  });

  // 8. 연도 범위 edge case들 (1900-2100 경계값 포함, 13개)
  const yearRangeCases = [
    { year: 1900, month: 1, day: 1, hour: 0, minute: 0, gender: '남성', calendar: '양력', desc: '1900년 최소값' },
    { year: 1901, month: 2, day: 15, hour: 12, minute: 30, gender: '여성', calendar: '음력', desc: '1900년대 초' },
    { year: 1946, month: 8, day: 15, hour: 12, minute: 0, gender: '남성', calendar: '양력', desc: '해방 연도' },
    { year: 1950, month: 6, day: 25, hour: 6, minute: 0, gender: '여성', calendar: '음력', desc: '한국전쟁 시작' },
    { year: 1953, month: 7, day: 27, hour: 10, minute: 0, gender: '남성', calendar: '양력', desc: '휴전협정' },
    { year: 1988, month: 9, day: 17, hour: 14, minute: 30, gender: '여성', calendar: '음력', desc: '서울올림픽' },
    { year: 1999, month: 12, day: 31, hour: 23, minute: 59, gender: '남성', calendar: '양력', desc: '밀레니엄 직전' },
    { year: 2000, month: 1, day: 1, hour: 0, minute: 0, gender: '여성', calendar: '양력', desc: '밀레니엄 시작' },
    { year: 2024, month: 12, day: 31, hour: 23, minute: 59, gender: '남성', calendar: '음력', desc: '현재 시점 근처' },
    { year: 2025, month: 1, day: 1, hour: 0, minute: 0, gender: '여성', calendar: '양력', desc: '현재 연도' },
    { year: 2030, month: 6, day: 15, hour: 12, minute: 0, gender: '남성', calendar: '음력', desc: '미래 연도' },
    { year: 2099, month: 11, day: 30, hour: 18, minute: 45, gender: '여성', calendar: '양력', desc: '2100년 직전' },
    { year: 2100, month: 12, day: 31, hour: 23, minute: 59, gender: '남성', calendar: '음력', desc: '2100년 최대값' },
  ];

  yearRangeCases.forEach((c) => {
    inputs.push({
      description: `${c.calendar} ${c.year}년 ${c.month}월 ${c.day}일 ${c.hour}시 ${c.minute}분 (${c.gender}) - ${c.desc}`,
      input: {
        name: '테스트',
        year: String(c.year),
        month: String(c.month),
        day: String(c.day),
        hour: String(c.hour),
        minute: String(c.minute),
        gender: c.gender,
        calendar: c.calendar,
        isLeapMonth: false,
      },
    });
  });

  console.log(`총 ${inputs.length}개의 테스트 케이스 생성`);
  return inputs;
}

/**
 * 통합 테스트셋 생성 메인 함수
 */
async function generateComprehensiveTestset() {
  console.log('🚀 통합 사주 테스트셋 생성 시작...\n');

  const testInputs = generateTestInputs();
  const testCases: ComprehensiveTestCase[] = [];
  const errors: string[] = [];

  console.log(`총 ${testInputs.length}개의 테스트 케이스 처리 예정\n`);

  for (let i = 0; i < testInputs.length; i++) {
    const { description, input } = testInputs[i];
    console.log(`[${i + 1}/${testInputs.length}] ${description}`);

    try {
      const normalizedCalendar = normalizeCalendarType(input.calendar);
      const koreanCalendar = normalizedCalendar === 'solar' ? '양력' : '음력';

      const referenceData = await getReferenceSajuData(
        input.name || '테스트',
        input.gender,
        koreanCalendar,
        input.year.padStart(4, '20'),
        input.month.padStart(2, '0'),
        input.day.padStart(2, '0'),
        input.hour.padStart(2, '0'),
        input.minute?.padStart(2, '0'),
        input.isLeapMonth
      );

      if (referenceData && referenceData.saju) {
        testCases.push({
          input,
          description,
          referenceData,
          timestamp: new Date().toISOString(),
        });

        // 사주 팔자 출력으로 성공 확인
        const sajuData = referenceData.saju.fortuneList?.saju;
        if (sajuData) {
          const pillarsStr = [
            `${sajuData.yearSky?.chinese || '?'}${sajuData.yearGround?.chinese || '?'}`,
            `${sajuData.monthSky?.chinese || '?'}${sajuData.monthGround?.chinese || '?'}`,
            `${sajuData.daySky?.chinese || '?'}${sajuData.dayGround?.chinese || '?'}`,
            `${sajuData.timeSky?.chinese || '?'}${sajuData.timeGround?.chinese || '?'}`,
          ].join(' ');
          console.log(`  ✅ 성공: ${pillarsStr}`);
        } else {
          console.log(`  ✅ 성공: 데이터 수집 완료`);
        }
      } else {
        errors.push(`${description}: API 응답 없음`);
        console.log(`  ❌ 실패: API 응답 없음`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(`${description}: ${errorMessage}`);
      console.log(`  ❌ 에러: ${errorMessage}`);
    }

    // API 호출 간격 조절 (Rate limiting 방지)
    await new Promise((resolve) => setTimeout(resolve, 1200));
  }

  // 결과 저장
  const outputPath = path.join(process.cwd(), 'data', 'saju-comprehensive-testset.json');
  await fs.writeFile(outputPath, JSON.stringify(testCases, null, 2), 'utf-8');

  console.log(`\n📊 통합 테스트셋 생성 완료!`);
  console.log(`  - 성공한 케이스: ${testCases.length}개`);
  console.log(`  - 실패한 케이스: ${errors.length}개`);
  console.log(`  - 저장 위치: ${outputPath}`);

  if (errors.length > 0) {
    console.log(`\n⚠️  실패한 케이스들:`);
    errors.forEach((error) => console.log(`  - ${error}`));
  }

  console.log('\n✨ 이제 모든 테스트가 이 하나의 데이터셋을 공유합니다!');
}

// 스크립트 실행
if (require.main === module) {
  generateComprehensiveTestset().catch(console.error);
}