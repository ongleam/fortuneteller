/**
 * 사주 계산을 위한 기본 상수 정의
 */

// 천간 (10개)
export const HEAVENLY_STEMS = [
  { chinese: '甲', korean: '갑', fiveElement: '목', yangYin: '양' },
  { chinese: '乙', korean: '을', fiveElement: '목', yangYin: '음' },
  { chinese: '丙', korean: '병', fiveElement: '화', yangYin: '양' },
  { chinese: '丁', korean: '정', fiveElement: '화', yangYin: '음' },
  { chinese: '戊', korean: '무', fiveElement: '토', yangYin: '양' },
  { chinese: '己', korean: '기', fiveElement: '토', yangYin: '음' },
  { chinese: '庚', korean: '경', fiveElement: '금', yangYin: '양' },
  { chinese: '辛', korean: '신', fiveElement: '금', yangYin: '음' },
  { chinese: '壬', korean: '임', fiveElement: '수', yangYin: '양' },
  { chinese: '癸', korean: '계', fiveElement: '수', yangYin: '음' }
] as const;

// 지지 (12개)
export const EARTHLY_BRANCHES = [
  { chinese: '子', korean: '자', fiveElement: '수', yangYin: '양' },
  { chinese: '丑', korean: '축', fiveElement: '토', yangYin: '음' },
  { chinese: '寅', korean: '인', fiveElement: '목', yangYin: '양' },
  { chinese: '卯', korean: '묘', fiveElement: '목', yangYin: '음' },
  { chinese: '辰', korean: '진', fiveElement: '토', yangYin: '양' },
  { chinese: '巳', korean: '사', fiveElement: '화', yangYin: '음' },
  { chinese: '午', korean: '오', fiveElement: '화', yangYin: '양' },
  { chinese: '未', korean: '미', fiveElement: '토', yangYin: '음' },
  { chinese: '申', korean: '신', fiveElement: '금', yangYin: '양' },
  { chinese: '酉', korean: '유', fiveElement: '금', yangYin: '음' },
  { chinese: '戌', korean: '술', fiveElement: '토', yangYin: '양' },
  { chinese: '亥', korean: '해', fiveElement: '수', yangYin: '음' }
] as const;

// 오행 상생 관계: 목→화→토→금→수→목
export const FIVE_ELEMENT_GENERATE = {
  '목': '화',
  '화': '토', 
  '토': '금',
  '금': '수',
  '수': '목'
} as const;

// 오행 상극 관계: 목→토, 화→금, 토→수, 금→목, 수→화
export const FIVE_ELEMENT_OVERCOME = {
  '목': '토',
  '화': '금',
  '토': '수', 
  '금': '목',
  '수': '화'
} as const;

// 십성 관계 테이블 (일간 기준)
export const TEN_STARS_TABLE = {
  // 같은 오행
  same_yang: '비견',    // 같은 양
  same_yin: '겁재',     // 같은 음
  // 일간이 생하는 오행  
  generate_yang: '식신', // 양을 생함
  generate_yin: '상관',  // 음을 생함
  // 일간이 극하는 오행
  overcome_yang: '편재', // 양을 극함  
  overcome_yin: '정재',  // 음을 극함
  // 일간을 극하는 오행
  overcome_me_yang: '편관', // 양이 일간을 극함
  overcome_me_yin: '정관',  // 음이 일간을 극함
  // 일간을 생하는 오행
  generate_me_yang: '편인', // 양이 일간을 생함
  generate_me_yin: '정인'   // 음이 일간을 생함
} as const;

// 지장간 데이터 (각 지지에 숨어있는 천간들과 비율)
export const JIJANG_GAN = {
  '子': [{ stem: '癸', rate: 30 }],
  '丑': [{ stem: '己', rate: 18 }, { stem: '癸', rate: 9 }, { stem: '辛', rate: 3 }],
  '寅': [{ stem: '甲', rate: 21 }, { stem: '丙', rate: 6 }, { stem: '戊', rate: 3 }],
  '卯': [{ stem: '乙', rate: 30 }],
  '辰': [{ stem: '戊', rate: 18 }, { stem: '乙', rate: 9 }, { stem: '癸', rate: 3 }],
  '巳': [{ stem: '丙', rate: 21 }, { stem: '庚', rate: 6 }, { stem: '戊', rate: 3 }],
  '午': [{ stem: '丁', rate: 21 }, { stem: '己', rate: 9 }],
  '未': [{ stem: '己', rate: 18 }, { stem: '丁', rate: 9 }, { stem: '乙', rate: 3 }],
  '申': [{ stem: '庚', rate: 21 }, { stem: '壬', rate: 6 }, { stem: '戊', rate: 3 }],
  '酉': [{ stem: '辛', rate: 30 }],
  '戌': [{ stem: '戊', rate: 18 }, { stem: '辛', rate: 9 }, { stem: '丁', rate: 3 }],
  '亥': [{ stem: '壬', rate: 16 }, { stem: '甲', rate: 14 }]
} as const;

// 60갑자 (천간 10 × 지지 12 = 60개 조합)
export const SIXTY_GAPJA = [
  '甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉',
  '甲戌', '乙亥', '丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未',
  '甲申', '乙酉', '丙戌', '丁亥', '戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳',
  '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑', '壬寅', '癸卯',
  '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子', '癸丑',
  '甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥'
] as const;

// 유틸리티 함수들
export function getStemInfo(chinese: string) {
  return HEAVENLY_STEMS.find(stem => stem.chinese === chinese);
}

export function getBranchInfo(chinese: string) {
  return EARTHLY_BRANCHES.find(branch => branch.chinese === chinese);
}

export function getStemIndex(chinese: string): number {
  return HEAVENLY_STEMS.findIndex(stem => stem.chinese === chinese);
}

export function getBranchIndex(chinese: string): number {
  return EARTHLY_BRANCHES.findIndex(branch => branch.chinese === chinese);
}

export function getGapjaIndex(stem: string, branch: string): number {
  const gapja = stem + branch;
  return SIXTY_GAPJA.findIndex(g => g === gapja);
}