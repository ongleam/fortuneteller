#!/usr/bin/env tsx
/**
 * 사주 팔자 계산 검증 스크립트
 * 테스트셋을 사용하여 계산 로직의 정확도를 검증
 */

import { getSajuPillars, getSajuPillarsReference } from '@/lib/core/saju/pillars';
import type { BirthInput, SajuPillars } from '@/lib/shared/types/saju';
import fs from 'fs/promises';
import path from 'path';

interface TestCase {
  description: string;
  input: BirthInput;
  expected: SajuPillars;
}

interface TestResult {
  description: string;
  input: BirthInput;
  expected: SajuPillars;
  actual?: SajuPillars;
  referenceActual?: SajuPillars;
  passed: boolean;
  errors: string[];
}

// 사주 팔자 비교 함수
function comparePillars(expected: SajuPillars, actual: SajuPillars): string[] {
  const errors: string[] = [];
  
  // 년주 비교
  if (expected.year.stem !== actual.year.stem) {
    errors.push(`년간 불일치: 기대값(${expected.year.stem}) vs 실제값(${actual.year.stem})`);
  }
  if (expected.year.branch !== actual.year.branch) {
    errors.push(`년지 불일치: 기대값(${expected.year.branch}) vs 실제값(${actual.year.branch})`);
  }
  
  // 월주 비교
  if (expected.month.stem !== actual.month.stem) {
    errors.push(`월간 불일치: 기대값(${expected.month.stem}) vs 실제값(${actual.month.stem})`);
  }
  if (expected.month.branch !== actual.month.branch) {
    errors.push(`월지 불일치: 기대값(${expected.month.branch}) vs 실제값(${actual.month.branch})`);
  }
  
  // 일주 비교
  if (expected.day.stem !== actual.day.stem) {
    errors.push(`일간 불일치: 기대값(${expected.day.stem}) vs 실제값(${actual.day.stem})`);
  }
  if (expected.day.branch !== actual.day.branch) {
    errors.push(`일지 불일치: 기대값(${expected.day.branch}) vs 실제값(${actual.day.branch})`);
  }
  
  // 시주 비교
  if (expected.time.stem !== actual.time.stem) {
    errors.push(`시간 불일치: 기대값(${expected.time.stem}) vs 실제값(${actual.time.stem})`);
  }
  if (expected.time.branch !== actual.time.branch) {
    errors.push(`시지 불일치: 기대값(${expected.time.branch}) vs 실제값(${actual.time.branch})`);
  }
  
  return errors;
}

// 사주 팔자 포맷팅
function formatPillars(pillars: SajuPillars): string {
  return `년(${pillars.year.stem}${pillars.year.branch}) 월(${pillars.month.stem}${pillars.month.branch}) 일(${pillars.day.stem}${pillars.day.branch}) 시(${pillars.time.stem}${pillars.time.branch})`;
}

// 검증 실행
async function verifyCalculations() {
  console.log('🔍 사주 팔자 계산 검증 시작...\n');
  
  // 테스트셋 로드
  const testsetPath = path.join(process.cwd(), 'data', 'pillars_testset.json');
  const testsetContent = await fs.readFile(testsetPath, 'utf-8');
  const testset = JSON.parse(testsetContent);
  
  console.log(`📚 테스트셋 로드 완료: ${testset.testCases.length}개 케이스\n`);
  
  const results: TestResult[] = [];
  let passedCount = 0;
  let failedCount = 0;
  
  for (let i = 0; i < testset.testCases.length; i++) {
    const testCase: TestCase = testset.testCases[i];
    console.log(`[${i + 1}/${testset.testCases.length}] ${testCase.description}`);
    
    const result: TestResult = {
      description: testCase.description,
      input: testCase.input,
      expected: testCase.expected,
      passed: false,
      errors: [],
    };
    
    try {
      // 로컬 계산 로직 테스트
      console.log('  📝 로컬 계산 중...');
      const localResult = await getSajuPillars(testCase.input);
      result.actual = localResult;
      
      // Reference API로 재검증 (옵션)
      console.log('  🔄 Reference API 검증 중...');
      const referenceResult = await getSajuPillarsReference(testCase.input);
      result.referenceActual = referenceResult;
      
      // 비교
      const localErrors = comparePillars(testCase.expected, localResult);
      if (localErrors.length === 0) {
        result.passed = true;
        passedCount++;
        console.log(`  ✅ 통과: ${formatPillars(localResult)}`);
      } else {
        result.errors = localErrors;
        failedCount++;
        console.log(`  ❌ 실패:`);
        console.log(`     기대값: ${formatPillars(testCase.expected)}`);
        console.log(`     실제값: ${formatPillars(localResult)}`);
        localErrors.forEach(error => console.log(`     - ${error}`));
      }
      
      // Reference API 결과와도 비교
      if (referenceResult) {
        const refErrors = comparePillars(testCase.expected, referenceResult);
        if (refErrors.length > 0) {
          console.log(`  ⚠️  Reference API도 불일치:`);
          console.log(`     ${formatPillars(referenceResult)}`);
        }
      }
      
    } catch (error) {
      result.errors = [`실행 오류: ${error}`];
      failedCount++;
      console.log(`  ❌ 오류: ${error}`);
    }
    
    results.push(result);
    
    // API 호출 간격
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // 결과 요약
  console.log('\n' + '='.repeat(60));
  console.log('📊 검증 결과 요약');
  console.log('='.repeat(60));
  console.log(`총 테스트: ${testset.testCases.length}개`);
  console.log(`✅ 통과: ${passedCount}개 (${(passedCount / testset.testCases.length * 100).toFixed(1)}%)`);
  console.log(`❌ 실패: ${failedCount}개 (${(failedCount / testset.testCases.length * 100).toFixed(1)}%)`);
  
  // 실패한 케이스 상세 출력
  if (failedCount > 0) {
    console.log('\n🔴 실패한 케이스 상세:');
    results.filter(r => !r.passed).forEach(result => {
      console.log(`\n  ${result.description}`);
      console.log(`  입력: ${result.input.calendar} ${result.input.year}년 ${result.input.month}월 ${result.input.day}일 ${result.input.hour}시`);
      console.log(`  기대값: ${formatPillars(result.expected)}`);
      if (result.actual) {
        console.log(`  실제값: ${formatPillars(result.actual)}`);
      }
      result.errors.forEach(error => console.log(`  - ${error}`));
    });
  }
  
  // 결과 저장
  const resultPath = path.join(process.cwd(), 'data', 'pillars_verification_result.json');
  await fs.writeFile(resultPath, JSON.stringify({
    metadata: {
      verified: new Date().toISOString(),
      totalCases: testset.testCases.length,
      passed: passedCount,
      failed: failedCount,
      successRate: `${(passedCount / testset.testCases.length * 100).toFixed(1)}%`,
    },
    results,
  }, null, 2), 'utf-8');
  
  console.log(`\n💾 검증 결과 저장: ${resultPath}`);
}

// 스크립트 실행
verifyCalculations().catch(console.error);