/**
 * 사주 계산을 위한 기본 상수 정의
 */


// 천간(天干) - 10개
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
  { chinese: '癸', korean: '계', fiveElement: '수', yangYin: '음' },
] as const;

// 지지(地支) - 12개
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
  { chinese: '亥', korean: '해', fiveElement: '수', yangYin: '음' },
] as const;

// 오행 상생 관계: 목→화→토→금→수→목
export const FIVE_ELEMENT_GENERATE = {
  목: '화',
  화: '토',
  토: '금',
  금: '수',
  수: '목',
} as const;

// 오행 상극 관계: 목→토, 화→금, 토→수, 금→목, 수→화
export const FIVE_ELEMENT_OVERCOME = {
  목: '토',
  화: '금',
  토: '수',
  금: '목',
  수: '화',
} as const;

// 십성 관계 테이블 (일간 기준)
export const TEN_STARS_TABLE = {
  // 같은 오행
  same_yang: '비견', // 같은 양
  same_yin: '겁재', // 같은 음
  // 일간이 생하는 오행
  generate_yang: '식신', // 양을 생함
  generate_yin: '상관', // 음을 생함
  // 일간이 극하는 오행
  overcome_yang: '편재', // 양을 극함
  overcome_yin: '정재', // 음을 극함
  // 일간을 극하는 오행
  overcome_me_yang: '편관', // 양이 일간을 극함
  overcome_me_yin: '정관', // 음이 일간을 극함
  // 일간을 생하는 오행
  generate_me_yang: '편인', // 양이 일간을 생함
  generate_me_yin: '정인', // 음이 일간을 생함
} as const;

// 지장간 데이터 (각 지지에 숨어있는 천간들과 비율)
export const JIJANG_GAN = {
  子: [{ stem: '癸', rate: 30 }],
  丑: [
    { stem: '己', rate: 18 },
    { stem: '癸', rate: 9 },
    { stem: '辛', rate: 3 },
  ],
  寅: [
    { stem: '甲', rate: 21 },
    { stem: '丙', rate: 6 },
    { stem: '戊', rate: 3 },
  ],
  卯: [{ stem: '乙', rate: 30 }],
  辰: [
    { stem: '戊', rate: 18 },
    { stem: '乙', rate: 9 },
    { stem: '癸', rate: 3 },
  ],
  巳: [
    { stem: '丙', rate: 21 },
    { stem: '庚', rate: 6 },
    { stem: '戊', rate: 3 },
  ],
  午: [
    { stem: '丁', rate: 21 },
    { stem: '己', rate: 9 },
  ],
  未: [
    { stem: '己', rate: 18 },
    { stem: '丁', rate: 9 },
    { stem: '乙', rate: 3 },
  ],
  申: [
    { stem: '庚', rate: 21 },
    { stem: '壬', rate: 6 },
    { stem: '戊', rate: 3 },
  ],
  酉: [{ stem: '辛', rate: 30 }],
  戌: [
    { stem: '戊', rate: 18 },
    { stem: '辛', rate: 9 },
    { stem: '丁', rate: 3 },
  ],
  亥: [
    { stem: '壬', rate: 16 },
    { stem: '甲', rate: 14 },
  ],
} as const;

// 60갑자 (천간 10 × 지지 12 = 60개 조합)
export const SIXTY_GAPJA = [
  '甲子',
  '乙丑',
  '丙寅',
  '丁卯',
  '戊辰',
  '己巳',
  '庚午',
  '辛未',
  '壬申',
  '癸酉',
  '甲戌',
  '乙亥',
  '丙子',
  '丁丑',
  '戊寅',
  '己卯',
  '庚辰',
  '辛巳',
  '壬午',
  '癸未',
  '甲申',
  '乙酉',
  '丙戌',
  '丁亥',
  '戊子',
  '己丑',
  '庚寅',
  '辛卯',
  '壬辰',
  '癸巳',
  '甲午',
  '乙未',
  '丙申',
  '丁酉',
  '戊戌',
  '己亥',
  '庚子',
  '辛丑',
  '壬寅',
  '癸卯',
  '甲辰',
  '乙巳',
  '丙午',
  '丁未',
  '戊申',
  '己酉',
  '庚戌',
  '辛亥',
  '壬子',
  '癸丑',
  '甲寅',
  '乙卯',
  '丙辰',
  '丁巳',
  '戊午',
  '己未',
  '庚申',
  '辛酉',
  '壬戌',
  '癸亥',
] as const;

// 유틸리티 함수들
export function getStemInfo(chinese: string) {
  return HEAVENLY_STEMS.find((sky) => sky.chinese === chinese);
}

export function getGroundInfo(chinese: string) {
  return EARTHLY_BRANCHES.find((ground) => ground.chinese === chinese);
}

export function getStemIndex(chinese: string): number {
  return HEAVENLY_STEMS.findIndex((sky) => sky.chinese === chinese);
}

export function getGroundIndex(chinese: string): number {
  return EARTHLY_BRANCHES.findIndex((ground) => ground.chinese === chinese);
}

export function getGapjaIndex(sky: string, ground: string): number {
  const gapja = sky + ground;
  return SIXTY_GAPJA.findIndex((g) => g === gapja);
}

// Backward compatibility functions
export const getBranchInfo = getGroundInfo;
export const getBranchIndex = getGroundIndex;

// 24절기 테이블 (양력 기준 근사값)
// 각 년도별로 절기 날짜가 약간씩 다르므로 평균값 사용
export const SOLAR_TERMS = {
  // 1월
  소한: { month: 1, day: 6 }, // 小寒
  대한: { month: 1, day: 20 }, // 大寒
  // 2월
  입춘: { month: 2, day: 4 }, // 立春 (년월 구분 기준)
  우수: { month: 2, day: 19 }, // 雨水
  // 3월
  경칩: { month: 3, day: 6 }, // 驚蟄 (2월/3월 구분 기준)
  춘분: { month: 3, day: 21 }, // 春分
  // 4월
  청명: { month: 4, day: 5 }, // 清明 (3월/4월 구분 기준)
  곡우: { month: 4, day: 20 }, // 穀雨
  // 5월
  입하: { month: 5, day: 6 }, // 立夏 (4월/5월 구분 기준)
  소만: { month: 5, day: 21 }, // 小滿
  // 6월
  망종: { month: 6, day: 6 }, // 芒種 (5월/6월 구분 기준)
  하지: { month: 6, day: 21 }, // 夏至
  // 7월
  소서: { month: 7, day: 7 }, // 小暑 (6월/7월 구분 기준)
  대서: { month: 7, day: 23 }, // 大暑
  // 8월
  입추: { month: 8, day: 8 }, // 立秋 (7월/8월 구분 기준)
  처서: { month: 8, day: 23 }, // 處暑
  // 9월
  백로: { month: 9, day: 8 }, // 白露 (8월/9월 구분 기준)
  추분: { month: 9, day: 23 }, // 秋分
  // 10월
  한로: { month: 10, day: 8 }, // 寒露 (9월/10월 구분 기준)
  상강: { month: 10, day: 23 }, // 霜降
  // 11월
  입동: { month: 11, day: 8 }, // 立冬 (10월/11월 구분 기준)
  소설: { month: 11, day: 22 }, // 小雪
  // 12월
  대설: { month: 12, day: 7 }, // 大雪 (11월/12월 구분 기준)
  동지: { month: 12, day: 22 }, // 冬至
} as const;

// 년도별 정확한 절기 데이터
export const SOLAR_TERMS_BY_YEAR: Record<
  number,
  {
    입춘: { month: number; day: number; hour: number; minute: number };
    경칩: { month: number; day: number; hour: number; minute: number };
    청명: { month: number; day: number; hour: number; minute: number };
    입하: { month: number; day: number; hour: number; minute: number };
    망종: { month: number; day: number; hour: number; minute: number };
    소서: { month: number; day: number; hour: number; minute: number };
    입추: { month: number; day: number; hour: number; minute: number };
    백로: { month: number; day: number; hour: number; minute: number };
    한로: { month: number; day: number; hour: number; minute: number };
    입동: { month: number; day: number; hour: number; minute: number };
    대설: { month: number; day: number; hour: number; minute: number };
    // 추가 절기들 (참조용)
    소한?: { month: number; day: number; hour: number; minute: number };
    대한?: { month: number; day: number; hour: number; minute: number };
    우수?: { month: number; day: number; hour: number; minute: number };
    춘분?: { month: number; day: number; hour: number; minute: number };
    곡우?: { month: number; day: number; hour: number; minute: number };
    소만?: { month: number; day: number; hour: number; minute: number };
    하지?: { month: number; day: number; hour: number; minute: number };
    대서?: { month: number; day: number; hour: number; minute: number };
    처서?: { month: number; day: number; hour: number; minute: number };
    추분?: { month: number; day: number; hour: number; minute: number };
    상강?: { month: number; day: number; hour: number; minute: number };
    소설?: { month: number; day: number; hour: number; minute: number };
    동지?: { month: number; day: number; hour: number; minute: number };
  }
> = {
  2021: {
    // 사주에 필요한 입절기들
    입춘: { month: 2, day: 3, hour: 23, minute: 59 },
    경칩: { month: 3, day: 5, hour: 17, minute: 54 },
    청명: { month: 4, day: 4, hour: 22, minute: 35 },
    입하: { month: 5, day: 5, hour: 15, minute: 47 },
    망종: { month: 6, day: 5, hour: 19, minute: 52 },
    소서: { month: 7, day: 7, hour: 6, minute: 5 },
    입추: { month: 8, day: 7, hour: 15, minute: 54 },
    백로: { month: 9, day: 7, hour: 18, minute: 53 },
    한로: { month: 10, day: 8, hour: 10, minute: 39 },
    입동: { month: 11, day: 7, hour: 13, minute: 59 },
    대설: { month: 12, day: 7, hour: 6, minute: 57 },

    // 추가 절기들 (참조용)
    소한: { month: 1, day: 5, hour: 12, minute: 23 },
    대한: { month: 1, day: 20, hour: 5, minute: 40 },
    우수: { month: 2, day: 18, hour: 19, minute: 44 },
    춘분: { month: 3, day: 20, hour: 18, minute: 37 },
    곡우: { month: 4, day: 20, hour: 5, minute: 33 },
    소만: { month: 5, day: 21, hour: 4, minute: 37 },
    하지: { month: 6, day: 21, hour: 12, minute: 32 },
    대서: { month: 7, day: 22, hour: 23, minute: 26 },
    처서: { month: 8, day: 23, hour: 6, minute: 35 },
    추분: { month: 9, day: 23, hour: 4, minute: 21 },
    상강: { month: 10, day: 23, hour: 13, minute: 51 },
    소설: { month: 11, day: 22, hour: 11, minute: 34 },
    동지: { month: 12, day: 22, hour: 0, minute: 59 },
  },
};

// 절기 이름과 사주월 매핑 (입절기 기준)
export const SAJU_MONTH_MAPPING = {
  입춘: 1, // 인월 (1월)
  경칩: 2, // 묘월 (2월)
  청명: 3, // 진월 (3월)
  입하: 4, // 사월 (4월)
  망종: 5, // 오월 (5월)
  소서: 6, // 미월 (6월)
  입추: 7, // 신월 (7월)
  백로: 8, // 유월 (8월)
  한로: 9, // 술월 (9월)
  입동: 10, // 해월 (10월)
  대설: 11, // 자월 (11월)
  // 12월(축월)은 다음해 입춘 전까지
} as const;

export const FIVE_ELEMENT_MEAN = {
  wood: {
    color: 'blue',
    season: 'spring',
    direction: 'east',
    ten_star: '비겁',
    ten_star_meaning: '정신력, 지도력',
    organ: 'liver, gallbladder',
    family: {
      male: '형제',
      female: '자매',
    },
  },
  fire: {
    color: 'red',
    season: 'summer',
    direction: 'south',
    ten_star: '식상',
    ten_star_meaning: '재능운, 업무운',
    organ: '심장, 소장',
    family: {
      male: '장모',
      female: '자식',
    },
  },
  earth: {
    color: 'yellow',
    season: 'inter_season',
    direction: 'center',
    ten_star: '재성',
    ten_star_meaning: '재물운, 보수운',
    organ: '비장, 위장',
    family: {
      male: '아내',
      female: '부친',
    },
  },
  metal: {
    color: 'white',
    season: 'autumn',
    direction: 'west',
    ten_star: '관성',
    ten_star_meaning: '관직운, 출세운',
    organ: '폐장, 대장',
    family: {
      male: '자식',
      female: '남편',
    },
  },
  water: {
    color: 'black',
    season: 'winter',
    direction: 'north',
    ten_star: '인성',
    ten_star_meaning: '학문운, 문서운',
    organ: '신장, 방광',
    family: {
      male: '모친',
      female: '모친',
    },
  },
} as const;
