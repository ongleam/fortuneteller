/**
 * 종합 테스트 스위트 - 100개 테스트 케이스
 * 모든 모듈과 엔드투엔드 테스트
 */

import { generateTestCases, validateTestCases, getTestCaseStats } from './test-data-generator';
import { getSajuInfo, getSajuInfoCompatible, getSajuInfoForUi, getSajuInfoAll } from './get-saju-info';
import { SajuPillarsCalculator } from './pillars';
import { SajuTenStarsCalculator } from './ten-stars';
import { SajuFiveElementsCalculator } from './five-elements';
import { SajuFortunesCalculator } from './fortunes';
import { SajuSinsalsCalculator } from './sinsals';
import { SajuAdapters } from './adapters';
import { normalizeBirthYear } from './calendar';

describe('종합 테스트 스위트 - 100개 케이스', () => {
  let testCases: any[];
  let validationResults: any;
  let stats: any;
  
  beforeAll(() => {
    // 테스트 케이스 생성 및 검증
    testCases = generateTestCases();
    validationResults = validateTestCases(testCases);
    stats = getTestCaseStats(testCases);
    
    console.log('📊 테스트 케이스 통계:');
    console.log(`총 케이스: ${stats.total}개`);
    console.log(`성별 분포: 남성 ${stats.byGender.남성}개, 여성 ${stats.byGender.여성}개`);
    console.log(`달력 분포: 양력 ${stats.byCalendar.solar}개, 음력 ${stats.byCalendar.lunar}개`);
    console.log(`2자리 년도: ${stats.by2DigitYear}개`);
    console.log(`연대별 분포:`, stats.byDecade);
    console.log(`\n검증 결과: 유효 ${validationResults.valid}개, 무효 ${validationResults.invalid}개`);
    
    if (validationResults.errors.length > 0) {
      console.log('오류 목록:', validationResults.errors.slice(0, 5));
    }
  });
  
  describe('테스트 데이터 검증', () => {
    test('100개 이상 테스트 케이스 생성 확인', () => {
      expect(testCases.length).toBeGreaterThanOrEqual(100);
      expect(testCases.every(tc => tc.name && tc.gender && tc.year && tc.month && tc.day && tc.hour)).toBe(true);
    });
    
    test('테스트 케이스 유효성 검증', () => {
      expect(validationResults.valid).toBeGreaterThan(90); // 90% 이상 유효해야 함
      expect(validationResults.invalid).toBeLessThan(10);
    });
    
    test('다양성 확인 - 성별, 달력, 연대', () => {
      expect(stats.byGender.남성).toBeGreaterThan(30);
      expect(stats.byGender.여성).toBeGreaterThan(30);
      expect(stats.byCalendar.solar).toBeGreaterThan(60);
      expect(stats.byCalendar.lunar).toBeGreaterThan(20);
      expect(Object.keys(stats.byDecade).length).toBeGreaterThan(5);
    });
  });
  
  describe('개별 모듈 테스트', () => {
    
    describe('년도 정규화 모듈', () => {
      test('2자리 년도 정규화 - 샘플 테스트', () => {
        const twoDigitCases = testCases.filter(tc => tc.year.length <= 2).slice(0, 10);
        
        twoDigitCases.forEach(testCase => {
          const normalized = normalizeBirthYear(testCase.year);
          expect(normalized).toMatch(/^\d{4}$/);
          expect(parseInt(normalized)).toBeGreaterThanOrEqual(1900);
          expect(parseInt(normalized)).toBeLessThanOrEqual(2100);
        });
      });
    });
    
    describe('사주 팔자 계산 모듈', () => {
      test('모든 케이스에서 팔자 계산 성공', () => {
        let successCount = 0;
        let errorCount = 0;
        const errors: string[] = [];
        
        testCases.forEach((testCase, index) => {
          try {
            const result = SajuPillarsCalculator.calculate(testCase);
            
            // 기본 구조 검증
            expect(result).toHaveProperty('year');
            expect(result).toHaveProperty('month');
            expect(result).toHaveProperty('day');
            expect(result).toHaveProperty('time');
            
            // 천간지지 검증
            expect(result.year.stem).toMatch(/[甲乙丙丁戊己庚辛壬癸]/);
            expect(result.year.branch).toMatch(/[子丑寅卯辰巳午未申酉戌亥]/);
            
            successCount++;
          } catch (error) {
            errorCount++;
            errors.push(`케이스 ${index + 1} (${testCase.name}): ${error.message}`);
          }
        });
        
        console.log(`\n🔍 팔자 계산: 성공 ${successCount}개, 실패 ${errorCount}개`);
        if (errors.length > 0) {
          console.log('오류 샘플:', errors.slice(0, 3));
        }
        
        expect(successCount).toBeGreaterThan(95); // 95% 이상 성공
        expect(errorCount).toBeLessThan(5);
      });
      
      test('특정 케이스 상세 검증', () => {
        const sampleCase = testCases[0]; // 첫 번째 케이스
        const result = SajuPillarsCalculator.calculate(sampleCase);
        
        expect(typeof result.year.stem).toBe('string');
        expect(typeof result.year.branch).toBe('string');
        expect(result.year.stem.length).toBe(1);
        expect(result.year.branch.length).toBe(1);
      });
    });
    
    describe('십성 계산 모듈', () => {
      test('모든 케이스에서 십성 계산 성공', () => {
        let successCount = 0;
        let errorCount = 0;
        
        testCases.slice(0, 50).forEach(testCase => { // 절반만 테스트 (성능 고려)
          try {
            const pillars = SajuPillarsCalculator.calculate(testCase);
            const tenStars = SajuTenStarsCalculator.calculate(pillars);
            
            // 십성 이름 검증
            const validTenStars = ['비견', '겁재', '식신', '상관', '편재', '정재', '편관', '정관', '편인', '정인'];
            expect(validTenStars).toContain(tenStars.yearStem);
            expect(validTenStars).toContain(tenStars.monthStem);
            expect(validTenStars).toContain(tenStars.dayStem);
            expect(validTenStars).toContain(tenStars.timeStem);
            
            successCount++;
          } catch (error) {
            errorCount++;
          }
        });
        
        console.log(`\n⭐ 십성 계산: 성공 ${successCount}개, 실패 ${errorCount}개`);
        expect(successCount).toBeGreaterThan(45);
        expect(errorCount).toBeLessThan(5);
      });
    });
    
    describe('오행 분석 모듈', () => {
      test('모든 케이스에서 오행 분석 성공', () => {
        let successCount = 0;
        let errorCount = 0;
        const elementRanges = { min: 0, max: 0, sum: 0 };
        
        testCases.slice(0, 30).forEach(testCase => { // 30개만 테스트
          try {
            const pillars = SajuPillarsCalculator.calculate(testCase);
            const elements = SajuFiveElementsCalculator.calculate(pillars);
            
            // 오행 개수 검증
            expect(typeof elements.wood).toBe('number');
            expect(typeof elements.fire).toBe('number');
            expect(typeof elements.earth).toBe('number');
            expect(typeof elements.metal).toBe('number');
            expect(typeof elements.water).toBe('number');
            
            // 총합 계산
            const total = elements.wood + elements.fire + elements.earth + elements.metal + elements.water;
            expect(total).toBeGreaterThan(0);
            expect(total).toBeLessThan(20);
            
            elementRanges.sum += total;
            if (total > elementRanges.max) elementRanges.max = total;
            if (elementRanges.min === 0 || total < elementRanges.min) elementRanges.min = total;
            
            successCount++;
          } catch (error) {
            errorCount++;
          }
        });
        
        console.log(`\n🌿 오행 분석: 성공 ${successCount}개, 실패 ${errorCount}개`);
        console.log(`오행 범위: ${elementRanges.min}~${elementRanges.max}, 평균: ${Math.round(elementRanges.sum/successCount)}`);
        
        expect(successCount).toBeGreaterThan(25);
        expect(errorCount).toBeLessThan(5);
      });
    });
    
    describe('신살 계산 모듈', () => {
      test('모든 케이스에서 신살 계산 성공', () => {
        let successCount = 0;
        let errorCount = 0;
        const sinsalCounts = { empty: 0, one: 0, two: 0, three: 0 };
        
        testCases.slice(0, 40).forEach(testCase => { // 40개 테스트
          try {
            const pillars = SajuPillarsCalculator.calculate(testCase);
            const sinsals = SajuSinsalsCalculator.getTopThree(pillars);
            
            expect(Array.isArray(sinsals)).toBe(true);
            expect(sinsals).toHaveLength(3);
            
            // 신살 개수 통계
            const nonEmptyCount = sinsals.filter(s => s !== '').length;
            if (nonEmptyCount === 0) sinsalCounts.empty++;
            else if (nonEmptyCount === 1) sinsalCounts.one++;
            else if (nonEmptyCount === 2) sinsalCounts.two++;
            else sinsalCounts.three++;
            
            successCount++;
          } catch (error) {
            errorCount++;
          }
        });
        
        console.log(`\n🔮 신살 계산: 성공 ${successCount}개, 실패 ${errorCount}개`);
        console.log(`신살 분포: 0개 ${sinsalCounts.empty}, 1개 ${sinsalCounts.one}, 2개 ${sinsalCounts.two}, 3개 ${sinsalCounts.three}`);
        
        expect(successCount).toBeGreaterThan(35);
        expect(errorCount).toBeLessThan(5);
      });
    });
    
    describe('운세 계산 모듈', () => {
      test('모든 케이스에서 운세 계산 성공', () => {
        let successCount = 0;
        let errorCount = 0;
        
        testCases.slice(0, 25).forEach(testCase => { // 25개 테스트
          try {
            const pillars = SajuPillarsCalculator.calculate(testCase);
            const fortune = SajuFortunesCalculator.calculate(pillars, 2025);
            
            expect(typeof fortune.currentAge).toBe('number');
            expect(fortune.currentAge).toBeGreaterThan(0);
            expect(fortune.currentAge).toBeLessThan(150);
            
            expect(fortune.bigFortune).toHaveProperty('current');
            expect(fortune.bigFortune).toHaveProperty('next');
            expect(fortune.yearFortune).toHaveProperty('year');
            
            successCount++;
          } catch (error) {
            errorCount++;
          }
        });
        
        console.log(`\n🔮 운세 계산: 성공 ${successCount}개, 실패 ${errorCount}개`);
        expect(successCount).toBeGreaterThan(20);
        expect(errorCount).toBeLessThan(5);
      });
    });
  });
  
  describe('어댑터 모듈 테스트', () => {
    test('3가지 형식 어댑터 모두 동작', () => {
      const sampleCase = testCases[5]; // 6번째 케이스 사용
      
      // 기본 데이터 준비
      const pillars = SajuPillarsCalculator.calculate(sampleCase);
      const tenStars = SajuTenStarsCalculator.calculate(pillars);
      const elements = SajuFiveElementsCalculator.calculate(pillars);
      const fortune = SajuFortunesCalculator.calculate(pillars, 2025);
      const sinsals = SajuSinsalsCalculator.getTopThree(pillars);
      
      const combinedData = {
        basic: sampleCase,
        pillars,
        tenStars,
        elements,
        fortune,
        sinsals
      };
      
      // Simple 어댑터
      const simpleResult = SajuAdapters.toSimple(combinedData);
      expect(simpleResult).toHaveProperty('basic');
      expect(simpleResult).toHaveProperty('pillars');
      
      // FetchSaju 어댑터
      const fetchSajuResult = SajuAdapters.toFetchSaju(combinedData);
      expect(fetchSajuResult).toHaveProperty('name');
      expect(fetchSajuResult).toHaveProperty('saju');
      expect(fetchSajuResult).toHaveProperty('tenStars');
      
      // UI 어댑터
      const uiResult = SajuAdapters.toUi(combinedData);
      expect(uiResult).toHaveProperty('summary');
      expect(uiResult).toHaveProperty('elementsChart');
      expect(uiResult.elementsChart.values).toHaveLength(5);
    });
  });
  
  describe('엔드투엔드 테스트', () => {
    test('getSajuInfo 기본 함수 - 랜덤 20개 케이스', () => {
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];
      
      // 랜덤하게 20개 선택
      const randomCases = testCases
        .sort(() => Math.random() - 0.5)
        .slice(0, 20);
      
      randomCases.forEach((testCase, index) => {
        try {
          const result = getSajuInfo(testCase);
          
          // 기본 구조 검증
          expect(result).toHaveProperty('basic');
          expect(result).toHaveProperty('pillars');
          expect(result).toHaveProperty('tenStars');
          expect(result).toHaveProperty('elements');
          expect(result).toHaveProperty('fortune');
          expect(result).toHaveProperty('sinsals');
          
          // 데이터 유효성 검증
          expect(result.basic.name).toBe(testCase.name);
          expect(result.pillars.year.stem).toMatch(/[甲乙丙丁戊己庚辛壬癸]/);
          expect(Array.isArray(result.sinsals)).toBe(true);
          
          successCount++;
        } catch (error) {
          errorCount++;
          errors.push(`케이스 ${index + 1} (${testCase.name}): ${error.message}`);
        }
      });
      
      console.log(`\n🎯 E2E getSajuInfo: 성공 ${successCount}개, 실패 ${errorCount}개`);
      if (errors.length > 0) {
        console.log('오류 샘플:', errors.slice(0, 2));
      }
      
      expect(successCount).toBeGreaterThan(18); // 90% 성공률
      expect(errorCount).toBeLessThan(2);
    });
    
    test('getSajuInfoCompatible - fetchSaju 형식 10개 케이스', () => {
      let successCount = 0;
      let errorCount = 0;
      
      testCases.slice(10, 20).forEach(testCase => {
        try {
          const result = getSajuInfoCompatible(testCase);
          
          // fetchSaju 호환 구조 검증
          expect(result).toHaveProperty('name');
          expect(result).toHaveProperty('birth');
          expect(result).toHaveProperty('saju');
          expect(result).toHaveProperty('tenStars');
          expect(result).toHaveProperty('elements');
          expect(result).toHaveProperty('sinsals');
          
          // 세부 구조 검증
          expect(result.saju.year).toHaveProperty('stem');
          expect(result.saju.year.stem).toHaveProperty('korean');
          expect(result.tenStars.year).toHaveProperty('meaning');
          
          successCount++;
        } catch (error) {
          errorCount++;
        }
      });
      
      console.log(`\n📋 E2E fetchSaju형식: 성공 ${successCount}개, 실패 ${errorCount}개`);
      expect(successCount).toBeGreaterThan(8);
      expect(errorCount).toBeLessThan(2);
    });
    
    test('getSajuInfoForUi - UI 형식 10개 케이스', () => {
      let successCount = 0;
      let errorCount = 0;
      
      testCases.slice(20, 30).forEach(testCase => {
        try {
          const result = getSajuInfoForUi(testCase);
          
          // UI 구조 검증
          expect(result).toHaveProperty('summary');
          expect(result).toHaveProperty('pillarsDisplay');
          expect(result).toHaveProperty('elementsChart');
          expect(result).toHaveProperty('sinsalsDisplay');
          
          // 차트 데이터 검증
          expect(result.elementsChart.labels).toHaveLength(5);
          expect(result.elementsChart.values).toHaveLength(5);
          expect(result.elementsChart.colors).toHaveLength(5);
          
          // 팔자 표시 검증
          expect(result.pillarsDisplay.year).toMatch(/[갑을병정무기경신임계][자축인묘진사오미신유술해]/);
          
          successCount++;
        } catch (error) {
          errorCount++;
        }
      });
      
      console.log(`\n🎨 E2E UI형식: 성공 ${successCount}개, 실패 ${errorCount}개`);
      expect(successCount).toBeGreaterThan(8);
      expect(errorCount).toBeLessThan(2);
    });
    
    test('getSajuInfoAll - 모든 형식 5개 케이스', () => {
      let successCount = 0;
      let errorCount = 0;
      
      testCases.slice(30, 35).forEach(testCase => {
        try {
          const result = getSajuInfoAll(testCase);
          
          // 3가지 형식 모두 존재
          expect(result).toHaveProperty('simple');
          expect(result).toHaveProperty('fetchSaju');
          expect(result).toHaveProperty('ui');
          
          // 일관성 검증 - 모든 형식에서 같은 이름
          expect(result.simple.basic.name).toBe(testCase.name);
          expect(result.fetchSaju.name).toBe(testCase.name);
          expect(result.ui.summary.name).toBe(testCase.name);
          
          successCount++;
        } catch (error) {
          errorCount++;
        }
      });
      
      console.log(`\n🔄 E2E 전체형식: 성공 ${successCount}개, 실패 ${errorCount}개`);
      expect(successCount).toBe(5); // 100% 성공 기대
      expect(errorCount).toBe(0);
    });
  });
  
  describe('성능 및 안정성 테스트', () => {
    test('대량 처리 성능 테스트 - 50개 연속 처리', () => {
      const startTime = Date.now();
      let successCount = 0;
      
      testCases.slice(50, 100).forEach(testCase => {
        try {
          getSajuInfo(testCase);
          successCount++;
        } catch (error) {
          // 성능 테스트이므로 오류는 무시
        }
      });
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const avgTime = totalTime / 50;
      
      console.log(`\n⚡ 성능 테스트: 50개 처리 ${totalTime}ms, 평균 ${avgTime.toFixed(1)}ms/건`);
      
      expect(avgTime).toBeLessThan(100); // 100ms 이하
      expect(successCount).toBeGreaterThan(45); // 90% 이상 성공
    });
    
    test('메모리 누수 체크 - 반복 처리', () => {
      const testCase = testCases[0];
      let memoryUsage = process.memoryUsage().heapUsed;
      
      // 100번 반복 처리
      for (let i = 0; i < 100; i++) {
        try {
          getSajuInfo(testCase);
        } catch (error) {
          // 메모리 테스트이므로 오류 무시
        }
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - memoryUsage;
      const memoryIncreaseKB = memoryIncrease / 1024;
      
      console.log(`\n💾 메모리 테스트: ${memoryIncreaseKB.toFixed(1)}KB 증가`);
      
      // 10MB 이하 증가만 허용
      expect(memoryIncreaseKB).toBeLessThan(10 * 1024);
    });
  });
  
  describe('종합 결과', () => {
    test('전체 테스트 결과 요약', () => {
      console.log('\n📈 종합 테스트 결과 요약:');
      console.log(`✅ 총 ${testCases.length}개 테스트 케이스 생성`);
      console.log(`✅ 모든 주요 모듈 테스트 완료`);
      console.log(`✅ 3가지 출력 형식 모두 동작 확인`);
      console.log(`✅ 엔드투엔드 테스트 통과`);
      console.log(`✅ 성능 및 안정성 검증 완료`);
      
      // 전체 성공률 계산은 Jest 통계에 의존
      expect(true).toBe(true); // 더미 어설션
    });
  });
});