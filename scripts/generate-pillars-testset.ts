#!/usr/bin/env tsx
/**
 * 사주 팔자 테스트셋 생성 스크립트
 * Reference API를 사용하여 정확한 사주 데이터를 수집
 */

import { getSajuPillarsReference } from '@/lib/core/saju/pillars';
import type { BirthInput } from '@/lib/shared/types/saju';
import fs from 'fs/promises';
import path from 'path';

interface TestCase {
  description: string;
  input: BirthInput;
  expected: {
    year: { stem: string; branch: string };
    month: { stem: string; branch: string };
    day: { stem: string; branch: string };
    time: { stem: string; branch: string };
  };
}

// 테스트 케이스 정의
const testInputs: Array<{ description: string; input: BirthInput }> = [
  // 양력 테스트 케이스
  {
    description: '양력 1990년생 남성 오전',
    input: {
      year: '1990',
      month: '5',
      day: '15',
      hour: '10',
      minute: '30',
      gender: '남성',
      calendar: '양력',
    },
  },
  {
    description: '양력 1985년생 여성 자정',
    input: {
      year: '1985',
      month: '12',
      day: '25',
      hour: '0',
      minute: '0',
      gender: '여성',
      calendar: '양력',
    },
  },
  {
    description: '양력 2000년생 남성 정오',
    input: {
      year: '2000',
      month: '1',
      day: '1',
      hour: '12',
      minute: '0',
      gender: '남성',
      calendar: '양력',
    },
  },
  {
    description: '양력 1975년생 여성 새벽',
    input: {
      year: '1975',
      month: '3',
      day: '10',
      hour: '3',
      minute: '45',
      gender: '여성',
      calendar: '양력',
    },
  },
  {
    description: '양력 1995년생 남성 저녁',
    input: {
      year: '1995',
      month: '8',
      day: '20',
      hour: '19',
      minute: '30',
      gender: '남성',
      calendar: '양력',
    },
  },
  // 음력 테스트 케이스
  {
    description: '음력 1988년생 여성 오전',
    input: {
      year: '1988',
      month: '4',
      day: '15',
      hour: '9',
      minute: '0',
      gender: '여성',
      calendar: '음력',
    },
  },
  {
    description: '음력 1992년생 남성 오후',
    input: {
      year: '1992',
      month: '10',
      day: '10',
      hour: '14',
      minute: '30',
      gender: '남성',
      calendar: '음력',
    },
  },
  {
    description: '음력 1980년생 여성 밤',
    input: {
      year: '1980',
      month: '7',
      day: '7',
      hour: '22',
      minute: '15',
      gender: '여성',
      calendar: '음력',
    },
  },
  // 절기 경계 테스트 케이스
  {
    description: '입춘 근처 양력 (2월 초)',
    input: {
      year: '1990',
      month: '2',
      day: '4',
      hour: '10',
      minute: '0',
      gender: '남성',
      calendar: '양력',
    },
  },
  {
    description: '동지 근처 양력 (12월 말)',
    input: {
      year: '1985',
      month: '12',
      day: '22',
      hour: '15',
      minute: '0',
      gender: '여성',
      calendar: '양력',
    },
  },
  // 시간 경계 테스트 케이스
  {
    description: '자시 시작 (23시)',
    input: {
      year: '1995',
      month: '6',
      day: '15',
      hour: '23',
      minute: '0',
      gender: '남성',
      calendar: '양력',
    },
  },
  {
    description: '자시 끝 (0시 59분)',
    input: {
      year: '1995',
      month: '6',
      day: '15',
      hour: '0',
      minute: '59',
      gender: '남성',
      calendar: '양력',
    },
  },
  // 2자리 연도 테스트
  {
    description: '2자리 연도 90년생 (1990년으로 해석)',
    input: {
      year: '90',
      month: '5',
      day: '15',
      hour: '10',
      minute: '30',
      gender: '남성',
      calendar: '양력',
    },
  },
  {
    description: '2자리 연도 05년생 (2005년으로 해석)',
    input: {
      year: '05',
      month: '3',
      day: '20',
      hour: '14',
      minute: '0',
      gender: '여성',
      calendar: '양력',
    },
  },
  // 윤달 테스트
  {
    description: '음력 윤달 (1987년 윤6월)',
    input: {
      year: '1987',
      month: '6',
      day: '15',
      hour: '12',
      minute: '0',
      gender: '남성',
      calendar: '음력',
      isLeapMonth: true,
    },
  },
  // 최근 연도 테스트
  {
    description: '2024년생 양력',
    input: {
      year: '2024',
      month: '1',
      day: '15',
      hour: '8',
      minute: '30',
      gender: '여성',
      calendar: '양력',
    },
  },
  {
    description: '2023년생 음력',
    input: {
      year: '2023',
      month: '11',
      day: '20',
      hour: '16',
      minute: '45',
      gender: '남성',
      calendar: '음력',
    },
  },
  // 과거 연도 테스트
  {
    description: '1960년생 양력',
    input: {
      year: '1960',
      month: '3',
      day: '5',
      hour: '6',
      minute: '0',
      gender: '남성',
      calendar: '양력',
    },
  },
  {
    description: '1955년생 음력',
    input: {
      year: '1955',
      month: '8',
      day: '15',
      hour: '18',
      minute: '30',
      gender: '여성',
      calendar: '음력',
    },
  },
  // 특별한 날짜 테스트
  {
    description: '양력 설날 (1월 1일)',
    input: {
      year: '2020',
      month: '1',
      day: '1',
      hour: '0',
      minute: '0',
      gender: '남성',
      calendar: '양력',
    },
  },
];

async function generateTestset() {
  console.log('🚀 사주 팔자 테스트셋 생성 시작...\n');
  
  const testCases: TestCase[] = [];
  const errors: string[] = [];
  
  for (let i = 0; i < testInputs.length; i++) {
    const { description, input } = testInputs[i];
    console.log(`[${i + 1}/${testInputs.length}] ${description} 처리 중...`);
    
    try {
      const result = await getSajuPillarsReference(input);
      
      if (result) {
        testCases.push({
          description,
          input,
          expected: result,
        });
        
        console.log(`  ✅ 성공: 년주(${result.year.stem}${result.year.branch}), 월주(${result.month.stem}${result.month.branch}), 일주(${result.day.stem}${result.day.branch}), 시주(${result.time.stem}${result.time.branch})`);
      } else {
        errors.push(`${description}: API 응답 없음`);
        console.log(`  ❌ 실패: API 응답 없음`);
      }
    } catch (error) {
      errors.push(`${description}: ${error}`);
      console.log(`  ❌ 에러: ${error}`);
    }
    
    // API 호출 간격 두기 (rate limiting 방지)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 결과 저장
  const outputPath = path.join(process.cwd(), 'data', 'pillars_testset.json');
  const output = {
    metadata: {
      generated: new Date().toISOString(),
      totalCases: testCases.length,
      source: 'Reference API (fetchSaju)',
      description: '사주 팔자 계산 정확도 검증을 위한 테스트셋',
    },
    testCases,
  };
  
  await fs.writeFile(outputPath, JSON.stringify(output, null, 2), 'utf-8');
  
  console.log('\n📊 테스트셋 생성 완료!');
  console.log(`  - 총 테스트 케이스: ${testCases.length}개`);
  console.log(`  - 저장 위치: ${outputPath}`);
  
  if (errors.length > 0) {
    console.log(`\n⚠️  실패한 케이스 (${errors.length}개):`);
    errors.forEach(error => console.log(`  - ${error}`));
  }
}

// 스크립트 실행
generateTestset().catch(console.error);