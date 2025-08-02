/**
 * 팔자 계산 디버깅 유틸리티
 */

import { SajuPillarsCalculator } from './pillars';
import { normalizeBirthInput } from './calendar';

// 테스트 케이스 디버깅
console.log('=== 팔자 계산 디버깅 ===\n');

// 케이스 1: 1995-04-25 08시
console.log('케이스 1: 1995년 4월 25일 8시 (양력 남성)');
const input1 = normalizeBirthInput({
  name: "김은식",
  gender: "MALE",
  birthType: "SOLAR", 
  birthYear: "1995",
  birthMonth: "04",
  birthDay: "25", 
  birthTime: "08"
});

console.log('정규화된 입력:', input1);

const result1 = SajuPillarsCalculator.calculate(input1);
console.log('계산 결과:', `${result1.year.stem}${result1.year.branch} ${result1.month.stem}${result1.month.branch} ${result1.day.stem}${result1.day.branch} ${result1.time.stem}${result1.time.branch}`);
console.log('fetchSaju:', '乙亥 辛巳 乙卯 庚辰');
console.log('');

// 케이스 2: 1988-03-15 14시  
console.log('케이스 2: 1988년 3월 15일 14시 (음력 여성)');
const input2 = normalizeBirthInput({
  name: "이영희",
  gender: "FEMALE",
  birthType: "LUNAR",
  birthYear: "1988",
  birthMonth: "03",
  birthDay: "15",
  birthTime: "14"
});

console.log('정규화된 입력:', input2);

const result2 = SajuPillarsCalculator.calculate(input2);
console.log('계산 결과:', `${result2.year.stem}${result2.year.branch} ${result2.month.stem}${result2.month.branch} ${result2.day.stem}${result2.day.branch} ${result2.time.stem}${result2.time.branch}`);
console.log('fetchSaju:', '戊辰 丙辰 乙卯 癸未');
console.log('');

// 월주 계산 분석
console.log('=== 월주 계산 분석 ===');
console.log('1995년 4월 -> 사주에서 몇 월?');
console.log('1988년 3월 (음력) -> 양력 변환 후 사주에서 몇 월?');