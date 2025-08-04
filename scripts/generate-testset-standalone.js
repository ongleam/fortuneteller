#!/usr/bin/env node
/**
 * 사주 팔자 테스트셋 생성 스크립트 (Standalone)
 * Reference API를 사용하여 정확한 사주 데이터를 수집
 */

const fs = require('fs').promises;
const path = require('path');

const SAJU_MAKER_API_URL = 'https://api.aifortunedoctor.com/order3/make';
const SAJU_API_URL = 'https://api.aifortunedoctor.com/order3/free';

function normalizeCalendarType(calendar) {
  const lowerCalendar = calendar.toLowerCase().trim();

  // 한글 → 영어 변환
  if (lowerCalendar === '양력' || lowerCalendar === 'solar') {
    return 'solar';
  }
  if (lowerCalendar === '음력' || lowerCalendar === 'lunar') {
    return 'lunar';
  }

  // 기본값: 양력
  console.warn(`알 수 없는 달력 타입: ${calendar}, 기본값 'solar' 사용`);
  return 'solar';
}

// birthTime normalization 함수
function normalizeBirthTime(hour, minute) {
  // hour와 minute를 숫자로 변환
  const h = parseInt(hour) || 0;
  const m = parseInt(minute) || 0;

  // 전체 분으로 변환
  const totalMinutes = h * 60 + m;

  if (totalMinutes < 90) return '00'; // 00:00 ~ 01:29
  if (totalMinutes < 210) return '02'; // 01:30 ~ 03:29
  if (totalMinutes < 330) return '04'; // 03:30 ~ 05:29
  if (totalMinutes < 450) return '06'; // 05:30 ~ 07:29
  if (totalMinutes < 570) return '08'; // 07:30 ~ 09:29
  if (totalMinutes < 690) return '10'; // 09:30 ~ 11:29
  if (totalMinutes < 810) return '12'; // 11:30 ~ 13:29
  if (totalMinutes < 930) return '14'; // 13:30 ~ 15:29
  if (totalMinutes < 1050) return '16'; // 15:30 ~ 17:29
  if (totalMinutes < 1170) return '18'; // 17:30 ~ 19:29
  if (totalMinutes < 1290) return '20'; // 19:30 ~ 21:29
  if (totalMinutes < 1410) return '22'; // 21:30 ~ 23:29
  return '24'; // 23:30 ~ 24:00
}

// fetchSaju 함수 구현
async function fetchSaju(
  name,
  gender,
  birthType,
  birthYear,
  birthMonth,
  birthDay,
  birthTime,
  birthMinute,
  isLeapMonth // 윤달 정보 추가
) {
  try {
    const normalizedBirthTime = normalizeBirthTime(birthTime, birthMinute || '0');

    const userInfo = {
      name,
      gender,
      birthType: `${birthType}${isLeapMonth ? '윤달' : ''}`, // API 요청 시 윤달 정보 포함
      birthYear,
      birthMonth,
      birthDay,
      birthTime: normalizedBirthTime,
    };

    const makeOrderResponse = await fetch(SAJU_MAKER_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userInfo, slug: 'moongirl' }),
    });

    if (!makeOrderResponse.ok) throw new Error(`주문 생성 실패: ${makeOrderResponse.status}`);
    const makeOrderData = await makeOrderResponse.json();
    if (!makeOrderData.order3Id) throw new Error('order3Id를 받지 못했습니다.');

    // 2단계: 사주 결과 조회
    const freeOrderResponse = await fetch(SAJU_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order3Id: makeOrderData.order3Id }),
    });

    if (!freeOrderResponse.ok) throw new Error(`사주 결과 조회 실패: ${freeOrderResponse.status}`);
    const sajuResult = await freeOrderResponse.json();

    return {
      saju: sajuResult?.saju ?? null,
      sinsals: sajuResult?.sinsals ?? null,
    };
  } catch (error) {
    console.error('[ERROR] fetchSaju 실패:', error.message);
    throw error;
  }
}

// 사주 팔자 추출 함수
function extractPillars(apiResult) {
  const sajuData = apiResult.saju.fortuneList.saju;

  return {
    year: { stem: sajuData.yearSky?.chinese || '甲', branch: sajuData.yearGround?.chinese || '子' },
    month: {
      stem: sajuData.monthSky?.chinese || '甲',
      branch: sajuData.monthGround?.chinese || '子',
    },
    day: { stem: sajuData.daySky?.chinese || '甲', branch: sajuData.dayGround?.chinese || '子' },
    time: { stem: sajuData.timeSky?.chinese || '甲', branch: sajuData.timeGround?.chinese || '子' },
  };
}

function generateRandomDate(startYear, endYear) {
  const year = startYear + Math.floor(Math.random() * (endYear - startYear + 1));
  const month = 1 + Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * 28);
  const hour = Math.floor(Math.random() * 24);
  const minute = Math.floor(Math.random() * 60);
  return { year, month, day, hour, minute };
}

function generateTestInputs() {
  const inputs = [];
  const totalCases = 100;

  // 1. 윤달 테스트 케이스 (5개)
  const leapMonthCases = [
    { year: 2023, month: 2, day: 15, hour: 10, minute: 30 },
    { year: 2020, month: 4, day: 1, hour: 8, minute: 0 },
    { year: 2001, month: 4, day: 20, hour: 18, minute: 5 },
    { year: 1995, month: 8, day: 10, hour: 23, minute: 40 },
    { year: 1982, month: 4, day: 5, hour: 3, minute: 15 },
  ];

  for (const c of leapMonthCases) {
    // 윤달 케이스
    inputs.push({
      description: `음력 ${c.year}년 윤${c.month}월 ${c.day}일 ${c.hour}시 ${c.minute}분 (여성)`,
      input: {
        ...Object.entries(c).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {}),
        gender: '여성',
        calendar: '음력',
        isLeapMonth: true,
      },
    });
    // 일반달 케이스
    inputs.push({
      description: `음력 ${c.year}년 ${c.month}월 ${c.day}일 ${c.hour}시 ${c.minute}분 (남성)`,
      input: {
        ...Object.entries(c).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {}),
        gender: '남성',
        calendar: '음력',
        isLeapMonth: false,
      },
    });
  }

  // 2. 나머지 무작위 테스트 케이스
  const remainingCases = totalCases - inputs.length;
  for (let i = 0; i < remainingCases; i++) {
    const { year, month, day, hour, minute } = generateRandomDate(1950, 2024);
    const gender = Math.random() > 0.5 ? '남성' : '여성';
    const calendar = Math.random() > 0.5 ? '양력' : '음력';

    inputs.push({
      description: `${calendar} ${year}년 ${month}월 ${day}일 ${hour}시 ${minute}분 ${gender}`,
      input: {
        year: String(year),
        month: String(month),
        day: String(day),
        hour: String(hour),
        minute: String(minute),
        gender,
        calendar,
        isLeapMonth: false,
      },
    });
  }

  return inputs;
}

const testInputs = generateTestInputs();

async function generateTestset() {
  console.log('🚀 사주 팔자 테스트셋 생성 시작...\n');
  const testCases = [];
  const errors = [];

  for (let i = 0; i < testInputs.length; i++) {
    const { description, input } = testInputs[i];
    console.log(`[${i + 1}/${testInputs.length}] ${description}`);

    try {
      const koreanCalendar = normalizeCalendarType(input.calendar) === 'solar' ? '양력' : '음력';

      const result = await fetchSaju(
        '테스트',
        input.gender,
        koreanCalendar,
        input.year,
        input.month.padStart(2, '0'),
        input.day.padStart(2, '0'),
        input.hour,
        input.minute,
        input.isLeapMonth
      );

      if (result && result.saju) {
        const pillars = extractPillars(result);
        testCases.push({ description, input, expected: pillars });
        console.log(
          `  ✅ 성공: ${Object.values(pillars)
            .map((p) => p.stem + p.branch)
            .join(' ')}`
        );
      } else {
        errors.push(`${description}: API 응답 없음`);
        console.log(`  ❌ 실패: API 응답 없음`);
      }
    } catch (error) {
      errors.push(`${description}: ${error.message}`);
      console.log(`  ❌ 에러: ${error.message}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  const outputPath = path.join(process.cwd(), 'data', 'pillars_testset.json');
  await fs.writeFile(outputPath, JSON.stringify(testCases, null, 2), 'utf-8');

  console.log(`\n📊 테스트셋 생성 완료! (${testCases.length}개)`);
  console.log(`  - 저장 위치: ${outputPath}`);
  if (errors.length > 0) {
    console.log(`\n⚠️  실패한 케이스 (${errors.length}개):`);
    errors.forEach((error) => console.log(`  - ${error}`));
  }
}

generateTestset().catch(console.error);
