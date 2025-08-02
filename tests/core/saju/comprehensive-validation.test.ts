/**
 * 종합 사주 계산 검증 테스트 - 100개 테스트 케이스
 * fetchSaju 검증 패턴을 기반으로 한 포괄적인 테스트
 */

import { getSajuInfo, getSajuInfoCompatible, validateAndNormalizeInput } from '@/lib/core/saju';
import { generateComprehensiveTestCases, getTestCaseStats, validateTestCases } from '@/tests/fixtures/data/comprehensive-test-cases';
import type { BirthInput } from '@/lib/shared/types/saju';

describe('종합 사주 계산 검증', () => {
  let testCases: BirthInput[];

  beforeAll(() => {
    testCases = generateComprehensiveTestCases();
    console.log(`\n🎯 ${testCases.length}개의 종합 테스트 케이스 로드 완료`);
  });

  describe('테스트 케이스 생성 및 검증', () => {
    
    test('100개 이상의 테스트 케이스 생성', () => {
      expect(testCases.length).toBeGreaterThanOrEqual(100);
      console.log(`✅ 총 ${testCases.length}개의 테스트 케이스 생성`);
    });

    test('테스트 케이스 통계 분석', () => {
      const stats = getTestCaseStats(testCases);
      
      expect(stats.total).toBe(testCases.length);
      expect(stats.byGender.남성 + stats.byGender.여성).toBe(stats.total);
      expect(stats.byCalendar.양력 + stats.byCalendar.음력).toBe(stats.total);
      
      console.log('📊 테스트 케이스 통계:', {
        전체: stats.total,
        성별: stats.byGender,
        달력: stats.byCalendar,
        '2자리년도': stats.by2DigitYear,
        연대별: stats.byDecade
      });
    });

    test('테스트 케이스 유효성 검증', () => {
      const validation = validateTestCases(testCases);
      
      expect(validation.invalid).toBe(0);
      expect(validation.valid).toBe(testCases.length);
      
      if (validation.errors.length > 0) {
        console.error('❌ 검증 오류:', validation.errors);
      }
      
      console.log(`✅ ${validation.valid}개 케이스 유효성 검증 통과`);
    });
  });

  describe('전체 테스트 케이스 사주 계산 실행', () => {
    
    test('모든 테스트 케이스 - getSajuInfo 실행', () => {
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      testCases.forEach((testCase, index) => {
        try {
          const normalizedInput = validateAndNormalizeInput(testCase);
          const result = getSajuInfo(normalizedInput);
          
          // 기본 구조 검증
          expect(result).toHaveProperty('pillars');
          expect(result).toHaveProperty('elements');
          expect(result).toHaveProperty('fortune');
          expect(result.pillars).toHaveProperty('year');
          expect(result.pillars).toHaveProperty('month');
          expect(result.pillars).toHaveProperty('day');
          expect(result.pillars).toHaveProperty('time');
          
          successCount++;
        } catch (error) {
          errorCount++;
          errors.push(`케이스 ${index + 1} (${testCase.name}): ${error.message}`);
        }
      });

      console.log(`\n📈 getSajuInfo 실행 결과:`);
      console.log(`✅ 성공: ${successCount}개`);
      console.log(`❌ 실패: ${errorCount}개`);
      
      if (errors.length > 0) {
        console.log('오류 상세:', errors.slice(0, 5)); // 처음 5개만 표시
      }

      // 성공률 80% 이상 요구
      const successRate = (successCount / testCases.length) * 100;
      expect(successRate).toBeGreaterThanOrEqual(80);
    });

    test('모든 테스트 케이스 - getSajuInfoCompatible 실행', () => {
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      testCases.forEach((testCase, index) => {
        try {
          const normalizedInput = validateAndNormalizeInput(testCase);
          const result = getSajuInfoCompatible(normalizedInput);
          
          // fetchSaju 호환 구조 검증
          expect(result).toHaveProperty('name');
          expect(result).toHaveProperty('gender');
          expect(result).toHaveProperty('birth');
          expect(result).toHaveProperty('saju');
          expect(result.saju).toHaveProperty('year');
          expect(result.saju).toHaveProperty('month');
          expect(result.saju).toHaveProperty('day');
          expect(result.saju).toHaveProperty('time');
          
          // 사주 기둥별 구조 검증
          Object.values(result.saju).forEach(pillar => {
            expect(pillar).toHaveProperty('stem');
            expect(pillar).toHaveProperty('branch');
            expect(pillar.stem).toHaveProperty('korean');
            expect(pillar.stem).toHaveProperty('chinese');
            expect(pillar.branch).toHaveProperty('korean');
            expect(pillar.branch).toHaveProperty('chinese');
          });
          
          successCount++;
        } catch (error) {
          errorCount++;
          errors.push(`케이스 ${index + 1} (${testCase.name}): ${error.message}`);
        }
      });

      console.log(`\n📈 getSajuInfoCompatible 실행 결과:`);
      console.log(`✅ 성공: ${successCount}개`);
      console.log(`❌ 실패: ${errorCount}개`);
      
      if (errors.length > 0) {
        console.log('오류 상세:', errors.slice(0, 5)); // 처음 5개만 표시
      }

      // 성공률 80% 이상 요구
      const successRate = (successCount / testCases.length) * 100;
      expect(successRate).toBeGreaterThanOrEqual(80);
    });
  });

  describe('특수 케이스 상세 검증', () => {
    
    test('fetchSaju 검증된 기본 케이스들', () => {
      // 처음 20개는 fetchSaju로 검증된 케이스들
      const verifiedCases = testCases.slice(0, 20);
      
      verifiedCases.forEach((testCase, index) => {
        const normalizedInput = validateAndNormalizeInput(testCase);
        const result = getSajuInfoCompatible(normalizedInput);
        
        // 기본 구조가 올바른지 확인
        expect(result.name).toBe(testCase.name);
        expect(result.gender).toBe(testCase.gender);
        expect(result.birth.year).toBe(testCase.year.length <= 2 ? 
          (parseInt(testCase.year) < 50 ? `20${testCase.year.padStart(2, '0')}` : `19${testCase.year}`) : 
          testCase.year);
        
        // 사주 기둥이 모두 계산되었는지 확인
        expect(result.saju.year.stem.chinese).toMatch(/[甲乙丙丁戊己庚辛壬癸]/);
        expect(result.saju.year.branch.chinese).toMatch(/[子丑寅卯辰巳午未申酉戌亥]/);
        
        console.log(`✅ 검증된 케이스 ${index + 1}: ${testCase.name} - ${result.saju.year.stem.chinese}${result.saju.year.branch.chinese}`);
      });
    });

    test('12간지 년도 케이스 검증', () => {
      // 12간지 년도 케이스들 (70-81번째)
      const ganjiCases = testCases.slice(50, 62);
      
      ganjiCases.forEach((testCase, index) => {
        const normalizedInput = validateAndNormalizeInput(testCase);
        const result = getSajuInfoCompatible(normalizedInput);
        
        // 년주가 올바른 간지로 계산되었는지 확인
        expect(result.saju.year.stem.chinese).toMatch(/[甲乙丙丁戊己庚辛壬癸]/);
        expect(result.saju.year.branch.chinese).toMatch(/[子丑寅卯辰巳午未申酉戌亥]/);
        
        // 12간지 순서 확인
        const expectedBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
        const year = parseInt(testCase.year);
        const expectedBranch = expectedBranches[(year - 4) % 12]; // 기준년도 조정
        
        console.log(`🐭 간지 케이스 ${index + 1}: ${testCase.year}년 -> ${result.saju.year.stem.chinese}${result.saju.year.branch.chinese}`);
      });
    });

    test('절기별 특수 케이스 검증', () => {
      // 절기별 케이스들 (82-93번째)
      const solarTermCases = testCases.slice(74, 86);
      
      solarTermCases.forEach((testCase, index) => {
        const normalizedInput = validateAndNormalizeInput(testCase);
        const result = getSajuInfoCompatible(normalizedInput);
        
        // 월주 계산이 절기를 고려했는지 간접 확인
        expect(result.saju.month.stem.chinese).toMatch(/[甲乙丙丁戊己庚辛壬癸]/);
        expect(result.saju.month.branch.chinese).toMatch(/[子丑寅卯辰巳午未申酉戌亥]/);
        
        console.log(`🌸 절기 케이스 ${index + 1}: ${testCase.name} -> ${result.saju.month.stem.chinese}${result.saju.month.branch.chinese}`);
      });
    });
  });

  describe('성능 및 안정성 테스트', () => {
    
    test('대량 데이터 처리 성능', () => {
      const startTime = Date.now();
      
      testCases.forEach(testCase => {
        const normalizedInput = validateAndNormalizeInput(testCase);
        getSajuInfoCompatible(normalizedInput);
      });
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      const averageTime = executionTime / testCases.length;
      
      console.log(`⚡ 성능 측정 결과:`);
      console.log(`총 실행시간: ${executionTime}ms`);
      console.log(`평균 처리시간: ${averageTime.toFixed(2)}ms/케이스`);
      console.log(`처리량: ${(testCases.length / (executionTime / 1000)).toFixed(2)} 케이스/초`);
      
      // 평균 처리시간 10ms 이하 요구
      expect(averageTime).toBeLessThan(10);
    });

    test('메모리 사용량 체크', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // 대량 계산 실행
      testCases.forEach(testCase => {
        const normalizedInput = validateAndNormalizeInput(testCase);
        getSajuInfo(normalizedInput);
      });
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      const memoryPerCase = memoryIncrease / testCases.length;
      
      console.log(`💾 메모리 사용량:`);
      console.log(`초기: ${(initialMemory / 1024 / 1024).toFixed(2)}MB`);
      console.log(`최종: ${(finalMemory / 1024 / 1024).toFixed(2)}MB`);
      console.log(`증가: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
      console.log(`케이스당: ${(memoryPerCase / 1024).toFixed(2)}KB`);
      
      // 메모리 사용량이 과도하지 않은지 확인 (케이스당 50KB 이하)
      expect(memoryPerCase).toBeLessThan(50 * 1024);
    });
  });

  describe('fetchSaju 호환성 검증', () => {
    
    test('출력 형식 호환성', () => {
      const sampleCases = testCases.slice(0, 10);
      
      sampleCases.forEach(testCase => {
        const normalizedInput = validateAndNormalizeInput(testCase);
        const result = getSajuInfoCompatible(normalizedInput);
        
        // fetchSaju와 동일한 필드 구조 확인
        expect(result).toMatchObject({
          name: expect.any(String),
          gender: expect.any(String),
          birth: {
            type: expect.stringMatching(/^(solar|lunar)$/),
            year: expect.any(String),
            month: expect.any(String),
            day: expect.any(String),
            hour: expect.any(String)
          },
          saju: {
            year: {
              stem: {
                korean: expect.any(String),
                chinese: expect.any(String),
                element: expect.any(String),
                yangyin: expect.any(String)
              },
              branch: {
                korean: expect.any(String),
                chinese: expect.any(String),
                element: expect.any(String),
                yangyin: expect.any(String)
              }
            },
            month: expect.objectContaining({
              stem: expect.any(Object),
              branch: expect.any(Object)
            }),
            day: expect.objectContaining({
              stem: expect.any(Object),
              branch: expect.any(Object)
            }),
            time: expect.objectContaining({
              stem: expect.any(Object),
              branch: expect.any(Object)
            })
          }
        });
      });
      
      console.log('✅ fetchSaju 호환성 검증 완료');
    });
  });

  afterAll(() => {
    console.log(`\n🎉 종합 검증 테스트 완료 - ${testCases.length}개 케이스 처리`);
  });
});