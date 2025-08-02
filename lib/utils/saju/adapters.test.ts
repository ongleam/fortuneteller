/**
 * 사주 어댑터 모듈 테스트
 */

import { SajuAdapters } from './adapters';
import type { BirthInput, SajuPillars, TenStars, FiveElements, FortuneInfo, TopThreeSinsals } from '../../types/saju';

describe('SajuAdapters', () => {
  
  // 테스트용 샘플 데이터
  const sampleData = {
    basic: {
      name: '홍길동',
      gender: '남성' as const,
      year: '1995',
      month: '4',
      day: '25',
      hour: '8',
      calendar: 'solar' as const
    },
    pillars: {
      year: { stem: '乙', branch: '亥' },
      month: { stem: '辛', branch: '巳' },
      day: { stem: '乙', branch: '卯' },
      time: { stem: '庚', branch: '辰' }
    },
    tenStars: {
      year: { korean: '편인', chinese: '偏印' },
      month: { korean: '정관', chinese: '正官' },
      day: { korean: '비견', chinese: '比肩' },
      time: { korean: '정관', chinese: '正官' }
    },
    elements: {
      wood: 3,
      fire: 1,
      earth: 1,
      metal: 2,
      water: 1
    },
    fortune: {
      currentAge: 30,
      bigFortune: {
        current: {
          number: 2,
          stem: { chinese: '辛', korean: '신', fiveElement: '금', yangYin: '음' },
          branch: { chinese: '巳', korean: '사', fiveElement: '화', yangYin: '음' }
        },
        next: {
          number: 3,
          stem: { chinese: '임', korean: '임', fiveElement: '수', yangYin: '양' },
          branch: { chinese: '오', korean: '오', fiveElement: '화', yangYin: '양' }
        }
      },
      yearFortune: {
        year: 2025,
        stem: { chinese: '乙', korean: '을', fiveElement: '목' },
        branch: { chinese: '巳', korean: '사', fiveElement: '화' }
      }
    },
    sinsals: ['역마살', '화개살', '천을귀인'] as TopThreeSinsals
  };
  
  describe('Simple 어댑터 테스트', () => {
    
    test('단순화된 출력 형식 변환', () => {
      const result = SajuAdapters.toSimple(sampleData);
      
      // 기본 구조 검증
      expect(result).toHaveProperty('basic');
      expect(result).toHaveProperty('pillars');
      expect(result).toHaveProperty('tenStars');
      expect(result).toHaveProperty('elements');
      expect(result).toHaveProperty('fortune');
      expect(result).toHaveProperty('sinsals');
      
      // 데이터 무결성 확인
      expect(result.basic.name).toBe('홍길동');
      expect(result.pillars.year.stem).toBe('乙');
      expect(result.elements.wood).toBe(3);
      expect(result.sinsals[0]).toBe('역마살');
      
      console.log('✅ Simple 어댑터 결과:', result);
    });
  });
  
  describe('FetchSaju 호환 어댑터 테스트', () => {
    
    test('fetchSaju 호환 출력 형식 변환', () => {
      const result = SajuAdapters.toFetchSaju(sampleData);
      
      // fetchSaju 형식 구조 검증
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('gender');
      expect(result).toHaveProperty('birth');
      expect(result).toHaveProperty('saju');
      expect(result).toHaveProperty('tenStars');
      expect(result).toHaveProperty('elements');
      expect(result).toHaveProperty('sinsals');
      expect(result).toHaveProperty('fortune');
      
      // 세부 구조 검증
      expect(result.saju.year.stem).toHaveProperty('korean');
      expect(result.saju.year.stem).toHaveProperty('chinese');
      expect(result.saju.year.stem).toHaveProperty('element');
      expect(result.saju.year.stem).toHaveProperty('yangyin');
      
      // 십성 구조 검증
      expect(result.tenStars.year).toHaveProperty('korean');
      expect(result.tenStars.year).toHaveProperty('chinese');
      expect(result.tenStars.year).toHaveProperty('meaning');
      
      // 오행 분석 구조 검증
      expect(result.elements).toHaveProperty('distribution');
      expect(result.elements).toHaveProperty('analysis');
      expect(result.elements.analysis).toHaveProperty('total');
      expect(result.elements.analysis).toHaveProperty('strongest');
      expect(result.elements.analysis).toHaveProperty('weakest');
      
      // 신살 배열 확인
      expect(Array.isArray(result.sinsals)).toBe(true);
      expect(result.sinsals).toHaveLength(3);
      
      console.log('✅ FetchSaju 어댑터 결과:', JSON.stringify(result, null, 2));
    });
    
    test('한글 변환 확인', () => {
      const result = SajuAdapters.toFetchSaju(sampleData);
      
      // 천간 한글 변환 확인
      expect(result.saju.year.stem.korean).toBe('을');
      expect(result.saju.month.stem.korean).toBe('신');
      
      // 지지 한글 변환 확인
      expect(result.saju.year.branch.korean).toBe('해');
      expect(result.saju.month.branch.korean).toBe('사');
      
      // 오행 확인
      expect(result.saju.year.stem.element).toBe('목');
      expect(result.saju.month.stem.element).toBe('금');
    });
  });
  
  describe('UI 최적화 어댑터 테스트', () => {
    
    test('UI 최적화 출력 형식 변환', () => {
      const result = SajuAdapters.toUi(sampleData);
      
      // UI 구조 검증
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('pillarsDisplay');
      expect(result).toHaveProperty('tenStarsDisplay');
      expect(result).toHaveProperty('elementsChart');
      expect(result).toHaveProperty('sinsalsDisplay');
      expect(result).toHaveProperty('fortuneDisplay');
      
      // 요약 정보 확인
      expect(result.summary.name).toBe('홍길동');
      expect(result.summary.birthInfo).toContain('1995년');
      expect(result.summary.calendar).toBe('양력');
      expect(result.summary.gender).toBe('남');
      
      // 팔자 표시 확인
      expect(result.pillarsDisplay.year).toBe('을해');
      expect(result.pillarsDisplay.month).toBe('신사');
      
      // 오행 차트 데이터 확인
      expect(result.elementsChart.labels).toHaveLength(5);
      expect(result.elementsChart.values).toHaveLength(5);
      expect(result.elementsChart.colors).toHaveLength(5);
      expect(result.elementsChart.total).toBe(8);
      
      // 신살 표시 확인
      expect(result.sinsalsDisplay).toHaveLength(3);
      expect(result.sinsalsDisplay[0]).toHaveProperty('name');
      expect(result.sinsalsDisplay[0]).toHaveProperty('meaning');
      expect(result.sinsalsDisplay[0]).toHaveProperty('type');
      
      console.log('✅ UI 어댑터 결과:', result);
    });
    
    test('차트 데이터 검증', () => {
      const result = SajuAdapters.toUi(sampleData);
      
      // 오행 값과 라벨 매칭 확인
      expect(result.elementsChart.values[0]).toBe(3); // 목
      expect(result.elementsChart.values[1]).toBe(1); // 화
      expect(result.elementsChart.values[2]).toBe(1); // 토
      expect(result.elementsChart.values[3]).toBe(2); // 금
      expect(result.elementsChart.values[4]).toBe(1); // 수
      
      // 색상 코드 확인
      expect(result.elementsChart.colors[0]).toBe('#28a745'); // 목 - 녹색
      expect(result.elementsChart.colors[1]).toBe('#dc3545'); // 화 - 빨강
    });
  });
  
  describe('어댑터 헬퍼 함수 테스트', () => {
    
    test('오행 균형 분석', () => {
      const result = SajuAdapters.toFetchSaju(sampleData);
      
      expect(result.elements.analysis.strongest).toBe('목');
      expect(['토', '화', '수']).toContain(result.elements.analysis.weakest);
      expect(result.elements.analysis.total).toBe(8);
      expect(['balanced', 'imbalanced']).toContain(result.elements.analysis.balance);
    });
    
    test('신살 타입 분류', () => {
      const result = SajuAdapters.toUi(sampleData);
      
      const cheonulGuiin = result.sinsalsDisplay.find(s => s.name === '천을귀인');
      expect(cheonulGuiin?.type).toBe('good');
      
      // 다른 신살 타입도 확인
      result.sinsalsDisplay.forEach(sinsal => {
        expect(['good', 'bad', 'neutral']).toContain(sinsal.type);
      });
    });
  });
  
  describe('에러 처리 테스트', () => {
    
    test('부분 데이터로도 작동하는지 확인', () => {
      const partialData = {
        ...sampleData,
        basic: { ...sampleData.basic, name: undefined }
      };
      
      const simpleResult = SajuAdapters.toSimple(partialData);
      const fetchSajuResult = SajuAdapters.toFetchSaju(partialData);
      const uiResult = SajuAdapters.toUi(partialData);
      
      expect(simpleResult).toBeDefined();
      expect(fetchSajuResult.name).toBe('');
      expect(uiResult.summary.name).toBe('알 수 없음');
    });
  });
});