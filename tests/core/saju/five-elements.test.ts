/**
 * 오행 분석 모듈 테스트
 * Reference API 데이터와 비교하여 정확성 검증
 */

import { calculateFiveElementsAccurate } from '@/lib/core/saju/five-elements';
import fs from 'fs';
import path from 'path';

// Reference 데이터 로드
let referenceData: any[] = [];
try {
  const dataPath = path.join(__dirname, '../../fixtures/data/reference-data.json');
  if (fs.existsSync(dataPath)) {
    referenceData = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
      .filter((data: any) => data.reference !== null)
      .slice(0, 5); // 처음 5개 케이스만 사용
  }
} catch (error) {
  console.warn('Reference 데이터 로드 실패:', error);
}

describe('FiveElementsCalculator', () => {
  
  describe('Reference API 데이터와의 정확성 비교', () => {
    
    if (referenceData.length === 0) {
      test.skip('Reference 데이터가 없어 테스트를 건너뜁니다', () => {});
      return;
    }

    referenceData.forEach((testData, index) => {
      test(`케이스 ${index + 1}: ${testData.input.name} - Reference 오행 분석 비교`, async () => {
        const referenceElements = testData.reference.elements;
        
        const birthInput = {
          name: testData.input.name,
          gender: testData.input.gender,
          calendar: testData.input.birthType === 'solar' ? '양력' : '음력',
          year: testData.input.birthYear,
          month: testData.input.birthMonth,
          day: testData.input.birthDay,
          hour: testData.input.birthTime
        };
        
        const result = await calculateFiveElementsAccurate(birthInput);
        
        console.log(`\n🔍 케이스 ${index + 1}: ${testData.input.name}`);
        console.log(`계산: 목${result.wood} 화${result.fire} 토${result.earth} 금${result.metal} 수${result.water}`);
        console.log(`참조: 목${referenceElements.wood} 화${referenceElements.fire} 토${referenceElements.earth} 금${referenceElements.metal} 수${referenceElements.water}`);
        
        // Reference API 데이터와 정확히 일치해야 함
        expect(result.wood).toBe(referenceElements.wood);
        expect(result.fire).toBe(referenceElements.fire);
        expect(result.earth).toBe(referenceElements.earth);
        expect(result.metal).toBe(referenceElements.metal);
        expect(result.water).toBe(referenceElements.water);
        
        // 총 8개여야 함
        const total = result.wood + result.fire + result.earth + result.metal + result.water;
        expect(total).toBe(8);
        
        console.log(`✅ 모든 오행이 Reference API와 일치합니다!`);
      }, 30000); // 30초 타임아웃
    });
  });

  describe('기본 오행 계산 테스트', () => {
    
    test('구조 검증', () => {
      const samplePillars = {
        year: { stem: '乙', branch: '亥' },   // 목, 수
        month: { stem: '辛', branch: '巳' },  // 금, 화
        day: { stem: '乙', branch: '卯' },    // 목, 목
        time: { stem: '庚', branch: '辰' }   // 금, 토
      };

      const result = calculateFiveElements(samplePillars);
      
      // 구조 검증
      expect(result).toHaveProperty('wood');
      expect(result).toHaveProperty('fire');
      expect(result).toHaveProperty('earth');
      expect(result).toHaveProperty('metal');
      expect(result).toHaveProperty('water');
      
      // 오행 개수 검증
      expect(typeof result.wood).toBe('number');
      expect(typeof result.fire).toBe('number');
      expect(typeof result.earth).toBe('number');
      expect(typeof result.metal).toBe('number');
      expect(typeof result.water).toBe('number');
      
      // 총 8개 (천간 4개 + 지지 4개)여야 함
      const total = result.wood + result.fire + result.earth + result.metal + result.water;
      expect(total).toBe(8);
      
      console.log('✅ 오행 구조 검증 통과:', result);
    });
    
    test('특정 오행이 없는 경우', () => {
      const samplePillars = {
        year: { stem: '甲', branch: '寅' },   // 목, 목
        month: { stem: '乙', branch: '卯' },  // 목, 목
        day: { stem: '甲', branch: '寅' },    // 목, 목
        time: { stem: '乙', branch: '卯' }   // 목, 목
      };

      const result = calculateFiveElements(samplePillars);
      
      expect(result.wood).toBe(8);  // 모두 목
      expect(result.fire).toBe(0);
      expect(result.earth).toBe(0);
      expect(result.metal).toBe(0);
      expect(result.water).toBe(0);
      
      console.log('✅ 목만 있는 경우:', result);
    });
  });
  
  describe('오행 균형 분석', () => {
    
    test('오행 편중 확인', () => {
      const samplePillars = {
        year: { stem: '丙', branch: '午' },   // 화, 화
        month: { stem: '丁', branch: '巳' },  // 화, 화
        day: { stem: '戊', branch: '辰' },    // 토, 토
        time: { stem: '己', branch: '未' }   // 토, 토
      };

      const result = calculateFiveElements(samplePillars);
      
      // 화와 토가 많은 명식
      expect(result.fire).toBeGreaterThan(0);
      expect(result.earth).toBeGreaterThan(0);
      expect(result.wood + result.metal + result.water).toBeLessThan(result.fire + result.earth);
      
      console.log('✅ 화토 편중 결과:', result);
    });
  });
});