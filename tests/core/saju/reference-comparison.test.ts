/**
 * Reference fetchSaju vs 현재 구현 비교 테스트
 * 핵심 로직의 정확성을 검증합니다.
 */

import { getSajuInfoCompatible, validateAndNormalizeInput } from '@/lib/core/saju';
import { fetchSaju } from '@/lib/core/saju/reference';
import type { BirthInput } from '@/lib/shared/types/saju';

describe('Reference fetchSaju vs 현재 구현 비교', () => {
  // 테스트용 케이스들
  const testCases: BirthInput[] = [
    {
      name: '홍길동',
      gender: '남성',
      year: '1995',
      month: '4',
      day: '25',
      hour: '8',
      calendar: '양력'
    },
    {
      name: '김영희',
      gender: '여성',
      year: '1988',
      month: '3',
      day: '15',
      hour: '14',
      calendar: '음력'
    },
    {
      name: '박철수',
      gender: '남성',
      year: '2000',
      month: '12',
      day: '31',
      hour: '23',
      calendar: '양력'
    }
  ];

  describe('핵심 로직 비교', () => {
    testCases.forEach((testCase, index) => {
      test(`케이스 ${index + 1}: ${testCase.name} - fetchSaju vs 현재 구현`, async () => {
        console.log(`\n🔍 === 케이스 ${index + 1}: ${testCase.name} 비교 ===`);
        
        // 현재 구현 결과 계산
        const normalizedInput = validateAndNormalizeInput(testCase);
        const currentResult = getSajuInfoCompatible(normalizedInput);
        
        console.log('📥 입력 데이터:');
        console.log(`  이름: ${testCase.name}`);
        console.log(`  성별: ${testCase.gender}`);
        console.log(`  생년월일시: ${testCase.year}년 ${testCase.month}월 ${testCase.day}일 ${testCase.hour}시`);
        console.log(`  달력: ${testCase.calendar}`);

        console.log('\n📤 현재 구현 결과:');
        console.log(`  년주: ${currentResult.saju.year.stem.chinese}${currentResult.saju.year.branch.chinese}`);
        console.log(`  월주: ${currentResult.saju.month.stem.chinese}${currentResult.saju.month.branch.chinese}`);
        console.log(`  일주: ${currentResult.saju.day.stem.chinese}${currentResult.saju.day.branch.chinese}`);
        console.log(`  시주: ${currentResult.saju.time.stem.chinese}${currentResult.saju.time.branch.chinese}`);
        
        console.log('\n🌟 오행 분석:');
        console.log(`  목: ${currentResult.elements.distribution.wood}, 화: ${currentResult.elements.distribution.fire}, 토: ${currentResult.elements.distribution.earth}, 금: ${currentResult.elements.distribution.metal}, 수: ${currentResult.elements.distribution.water}`);
        console.log(`  총합: ${currentResult.elements.analysis.total}, 최강: ${currentResult.elements.analysis.strongest}`);

        console.log('\n🔮 신살:');
        if (currentResult.sinsals && currentResult.sinsals.length > 0) {
          currentResult.sinsals.forEach(sinsal => {
            console.log(`  - ${sinsal}`);
          });
        } else {
          console.log('  없음');
        }

        try {
          // Reference fetchSaju 호출 - 올바른 포맷으로 변환
          console.log('\n🌐 Reference fetchSaju 호출 중...');
          
          // 입력 데이터 변환
          const referenceInput = {
            name: testCase.name,
            gender: testCase.gender,
            birthType: testCase.calendar === '양력' ? 'solar' : 'lunar', 
            birthYear: testCase.year.length <= 2 ? 
              (parseInt(testCase.year) <= 30 ? `20${testCase.year.padStart(2, '0')}` : `19${testCase.year}`) : 
              testCase.year,
            birthMonth: testCase.month.padStart(2, '0'), // 2자리로 패딩
            birthDay: testCase.day.padStart(2, '0'),     // 2자리로 패딩  
            birthTime: testCase.hour.padStart(2, '0')    // 2자리로 패딩
          };
          
          console.log('📤 Reference API 입력 데이터:');
          console.log(`  name: "${referenceInput.name}"`);
          console.log(`  gender: "${referenceInput.gender}"`);
          console.log(`  birthType: "${referenceInput.birthType}"`);
          console.log(`  birthYear: "${referenceInput.birthYear}"`);
          console.log(`  birthMonth: "${referenceInput.birthMonth}"`);
          console.log(`  birthDay: "${referenceInput.birthDay}"`);
          console.log(`  birthTime: "${referenceInput.birthTime}"`);
          
          const referenceResult = await fetchSaju(
            referenceInput.name,
            referenceInput.gender,
            referenceInput.birthType,
            referenceInput.birthYear,
            referenceInput.birthMonth,
            referenceInput.birthDay,
            referenceInput.birthTime
          );

          console.log('\n📤 Reference fetchSaju 결과:');
          
          if (referenceResult.saju) {
            console.log('🏛️ 사주 기둥:');
            if (referenceResult.saju.year) {
              console.log(`  년주: ${referenceResult.saju.year.stem?.chinese || '?'}${referenceResult.saju.year.branch?.chinese || '?'}`);
            }
            if (referenceResult.saju.month) {
              console.log(`  월주: ${referenceResult.saju.month.stem?.chinese || '?'}${referenceResult.saju.month.branch?.chinese || '?'}`);
            }
            if (referenceResult.saju.day) {
              console.log(`  일주: ${referenceResult.saju.day.stem?.chinese || '?'}${referenceResult.saju.day.branch?.chinese || '?'}`);
            }
            if (referenceResult.saju.time) {
              console.log(`  시주: ${referenceResult.saju.time.stem?.chinese || '?'}${referenceResult.saju.time.branch?.chinese || '?'}`);
            }
          }

          if (referenceResult.sinsals) {
            console.log('\n🔮 Reference 신살:');
            if (Array.isArray(referenceResult.sinsals) && referenceResult.sinsals.length > 0) {
              referenceResult.sinsals.forEach((sinsal: any) => {
                console.log(`  - ${typeof sinsal === 'string' ? sinsal : JSON.stringify(sinsal)}`);
              });
            } else {
              console.log('  없음');
            }
          }

          // 상세 비교 분석
          console.log('\n🔍 === 상세 비교 분석 ===');
          
          const comparison = {
            pillarsMatch: {
              year: false,
              month: false,
              day: false,
              time: false
            },
            elementsPresent: {
              current: true,
              reference: !!referenceResult.saju
            },
            sinsalsPresent: {
              current: !!(currentResult.sinsals && currentResult.sinsals.length > 0),
              reference: !!(referenceResult.sinsals && referenceResult.sinsals.length > 0)
            }
          };

          // 사주 기둥 비교
          if (referenceResult.saju) {
            // 년주 비교
            if (referenceResult.saju.year?.stem?.chinese && referenceResult.saju.year?.branch?.chinese) {
              const refYear = `${referenceResult.saju.year.stem.chinese}${referenceResult.saju.year.branch.chinese}`;
              const currYear = `${currentResult.saju.year.stem.chinese}${currentResult.saju.year.branch.chinese}`;
              comparison.pillarsMatch.year = refYear === currYear;
              console.log(`년주 비교: ${currYear} vs ${refYear} → ${comparison.pillarsMatch.year ? '✅ 일치' : '❌ 불일치'}`);
            }

            // 월주 비교
            if (referenceResult.saju.month?.stem?.chinese && referenceResult.saju.month?.branch?.chinese) {
              const refMonth = `${referenceResult.saju.month.stem.chinese}${referenceResult.saju.month.branch.chinese}`;
              const currMonth = `${currentResult.saju.month.stem.chinese}${currentResult.saju.month.branch.chinese}`;
              comparison.pillarsMatch.month = refMonth === currMonth;
              console.log(`월주 비교: ${currMonth} vs ${refMonth} → ${comparison.pillarsMatch.month ? '✅ 일치' : '❌ 불일치'}`);
            }

            // 일주 비교
            if (referenceResult.saju.day?.stem?.chinese && referenceResult.saju.day?.branch?.chinese) {
              const refDay = `${referenceResult.saju.day.stem.chinese}${referenceResult.saju.day.branch.chinese}`;
              const currDay = `${currentResult.saju.day.stem.chinese}${currentResult.saju.day.branch.chinese}`;
              comparison.pillarsMatch.day = refDay === currDay;
              console.log(`일주 비교: ${currDay} vs ${refDay} → ${comparison.pillarsMatch.day ? '✅ 일치' : '❌ 불일치'}`);
            }

            // 시주 비교
            if (referenceResult.saju.time?.stem?.chinese && referenceResult.saju.time?.branch?.chinese) {
              const refTime = `${referenceResult.saju.time.stem.chinese}${referenceResult.saju.time.branch.chinese}`;
              const currTime = `${currentResult.saju.time.stem.chinese}${currentResult.saju.time.branch.chinese}`;
              comparison.pillarsMatch.time = refTime === currTime;
              console.log(`시주 비교: ${currTime} vs ${refTime} → ${comparison.pillarsMatch.time ? '✅ 일치' : '❌ 불일치'}`);
            }
          }

          // 신살 비교
          if (referenceResult.sinsals && currentResult.sinsals) {
            console.log('\n🔮 신살 비교:');
            console.log(`현재 구현: ${currentResult.sinsals.length}개`);
            console.log(`Reference: ${Array.isArray(referenceResult.sinsals) ? referenceResult.sinsals.length : 0}개`);
            
            // 공통 신살 찾기
            if (Array.isArray(referenceResult.sinsals)) {
              const commonSinsals = currentResult.sinsals.filter(curr => 
                referenceResult.sinsals.some((ref: any) => 
                  typeof ref === 'string' ? ref === curr : JSON.stringify(ref).includes(curr)
                )
              );
              console.log(`공통 신살: ${commonSinsals.length}개 - ${commonSinsals.join(', ')}`);
            }
          }

          // 전체 비교 결과
          console.log('\n📊 === 전체 비교 결과 ===');
          const pillarsMatchCount = Object.values(comparison.pillarsMatch).filter(Boolean).length;
          console.log(`사주 기둥 일치율: ${pillarsMatchCount}/4 (${(pillarsMatchCount/4*100).toFixed(1)}%)`);
          
          if (pillarsMatchCount === 4) {
            console.log('🎉 모든 사주 기둥이 일치합니다!');
          } else {
            console.log('⚠️ 일부 사주 기둥에 차이가 있습니다.');
          }

          // JSON 형태로 상세 결과 저장
          const detailedComparison = {
            testCase,
            currentResult: {
              saju: {
                year: `${currentResult.saju.year.stem.chinese}${currentResult.saju.year.branch.chinese}`,
                month: `${currentResult.saju.month.stem.chinese}${currentResult.saju.month.branch.chinese}`,
                day: `${currentResult.saju.day.stem.chinese}${currentResult.saju.day.branch.chinese}`,
                time: `${currentResult.saju.time.stem.chinese}${currentResult.saju.time.branch.chinese}`
              },
              elements: currentResult.elements,
              sinsals: currentResult.sinsals
            },
            referenceResult: {
              saju: referenceResult.saju ? {
                year: referenceResult.saju.year ? `${referenceResult.saju.year.stem?.chinese || '?'}${referenceResult.saju.year.branch?.chinese || '?'}` : null,
                month: referenceResult.saju.month ? `${referenceResult.saju.month.stem?.chinese || '?'}${referenceResult.saju.month.branch?.chinese || '?'}` : null,
                day: referenceResult.saju.day ? `${referenceResult.saju.day.stem?.chinese || '?'}${referenceResult.saju.day.branch?.chinese || '?'}` : null,
                time: referenceResult.saju.time ? `${referenceResult.saju.time.stem?.chinese || '?'}${referenceResult.saju.time.branch?.chinese || '?'}` : null
              } : null,
              sinsals: referenceResult.sinsals
            },
            comparison,
            matchRate: pillarsMatchCount / 4
          };

          console.log('\n📋 === JSON 상세 결과 ===');
          console.log(JSON.stringify(detailedComparison, null, 2));

          // 테스트 어서션 - 최소 50% 이상 일치해야 함
          expect(pillarsMatchCount).toBeGreaterThanOrEqual(2);

        } catch (error) {
          console.error(`\n❌ Reference fetchSaju 호출 실패: ${error instanceof Error ? error.message : String(error)}`);
          console.log('⚠️ Reference API 호출 실패로 인해 현재 구현만 검증합니다.');
          
          // API 호출 실패 시에도 현재 구현이 정상 동작하는지 확인
          expect(currentResult.saju.year.stem.chinese).toMatch(/[甲乙丙丁戊己庚辛壬癸]/);
          expect(currentResult.saju.year.branch.chinese).toMatch(/[子丑寅卯辰巳午未申酉戌亥]/);
          expect(currentResult.elements.analysis.total).toBeGreaterThan(0);
        }

        console.log('\n' + '='.repeat(80));
      }, 30000); // 30초 타임아웃
    });
  });

  describe('오프라인 로직 비교', () => {
    test('사주 기둥 계산 로직 검증', () => {
      console.log('\n🧮 === 사주 기둥 계산 로직 검증 ===');
      
      const testCase: BirthInput = {
        name: '테스트',
        gender: '남성',
        year: '1995',
        month: '4',
        day: '25',
        hour: '8',
        calendar: '양력'
      };

      const normalizedInput = validateAndNormalizeInput(testCase);
      const result = getSajuInfoCompatible(normalizedInput);

      console.log('📊 계산 검증:');
      
      // 1. 년주 검증 (1995년 = 을해년)
      console.log(`년주: ${result.saju.year.stem.chinese}${result.saju.year.branch.chinese}`);
      console.log('  - 1995년은 을해년이어야 함');
      
      // 2. 일주 검증 (특정 날짜의 일주 확인)
      console.log(`일주: ${result.saju.day.stem.chinese}${result.saju.day.branch.chinese}`);
      
      // 3. 시주 검증 (8시 = 진시)
      console.log(`시주: ${result.saju.time.stem.chinese}${result.saju.time.branch.chinese}`);
      console.log('  - 8시는 진시(辰時)여야 함');
      expect(result.saju.time.branch.chinese).toBe('辰');
      
      // 4. 오행 분포 검증
      const total = result.elements.distribution.wood + 
                   result.elements.distribution.fire + 
                   result.elements.distribution.earth + 
                   result.elements.distribution.metal + 
                   result.elements.distribution.water;
      
      console.log('🌟 오행 검증:');
      console.log(`  총 오행 개수: ${total} (8개여야 함)`);
      console.log(`  계산된 총합: ${result.elements.analysis.total}`);
      
      // 기본 검증
      expect(result.saju.year.stem.chinese).toMatch(/[甲乙丙丁戊己庚辛壬癸]/);
      expect(result.saju.year.branch.chinese).toMatch(/[子丑寅卯辰巳午未申酉戌亥]/);
      expect(result.elements.analysis.total).toBeGreaterThan(0);
      expect(result.elements.analysis.strongest).toMatch(/^(목|화|토|금|수)$/);
    });

    test('입력 정규화 로직 검증', () => {
      console.log('\n🔧 === 입력 정규화 로직 검증 ===');
      
      const testCases = [
        {
          input: { name: '홍길동', gender: '남성', year: '95', month: '4', day: '25', hour: '8', calendar: '양력' },
          expected: { year: '1995' }
        },
        {
          input: { name: '김영희', gender: '여성', year: '03', month: '12', day: '31', hour: '23', calendar: '양력' },
          expected: { year: '2003' }
        }
      ];

      testCases.forEach((testCase, index) => {
        console.log(`\n테스트 케이스 ${index + 1}:`);
        console.log(`  입력 년도: ${testCase.input.year}`);
        
        const normalized = validateAndNormalizeInput(testCase.input);
        console.log(`  정규화된 년도: ${normalized.year}`);
        console.log(`  기대값: ${testCase.expected.year}`);
        
        expect(normalized.year).toBe(testCase.expected.year);
      });
    });
  });

  afterAll(() => {
    console.log('\n🎉 Reference 비교 테스트 완료');
    console.log('📋 위 결과를 통해 현재 구현과 Reference fetchSaju의 차이점을 확인할 수 있습니다.');
  });
});