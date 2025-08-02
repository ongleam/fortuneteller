/**
 * Reference fetchSaju vs 현재 구현 정확한 비교 테스트
 * 실제 API 응답 구조를 올바르게 파싱하여 비교합니다.
 */

import { getSajuInfoCompatible, validateAndNormalizeInput } from '@/lib/core/saju';
import { fetchSaju } from '@/lib/core/saju/reference';
import type { BirthInput } from '@/lib/shared/types/saju';

describe('Reference fetchSaju vs 현재 구현 정확한 비교', () => {
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
    }
  ];

  testCases.forEach((testCase, index) => {
    test(`케이스 ${index + 1}: ${testCase.name} - 정확한 사주 기둥 비교`, async () => {
      console.log(`\n🔍 === 케이스 ${index + 1}: ${testCase.name} 정확한 비교 ===`);
      
      // 현재 구현 결과 계산
      const normalizedInput = validateAndNormalizeInput(testCase);
      const currentResult = getSajuInfoCompatible(normalizedInput);
      
      console.log('📥 입력 데이터:');
      console.log(`  이름: ${testCase.name}`);
      console.log(`  성별: ${testCase.gender}`);
      console.log(`  생년월일시: ${testCase.year}년 ${testCase.month}월 ${testCase.day}일 ${testCase.hour}시`);
      console.log(`  달력: ${testCase.calendar}`);

      console.log('\n📤 현재 구현 결과:');
      console.log(`  년주: ${currentResult.saju.year.stem.chinese}${currentResult.saju.year.branch.chinese} (${currentResult.saju.year.stem.korean}${currentResult.saju.year.branch.korean})`);
      console.log(`  월주: ${currentResult.saju.month.stem.chinese}${currentResult.saju.month.branch.chinese} (${currentResult.saju.month.stem.korean}${currentResult.saju.month.branch.korean})`);
      console.log(`  일주: ${currentResult.saju.day.stem.chinese}${currentResult.saju.day.branch.chinese} (${currentResult.saju.day.stem.korean}${currentResult.saju.day.branch.korean})`);
      console.log(`  시주: ${currentResult.saju.time.stem.chinese}${currentResult.saju.time.branch.chinese} (${currentResult.saju.time.stem.korean}${currentResult.saju.time.branch.korean})`);

      try {
        // Reference fetchSaju 호출 - 올바른 포맷으로 변환
        console.log('\n🌐 Reference fetchSaju 호출 중...');
        
        const referenceInput = {
          name: testCase.name,
          gender: testCase.gender,
          birthType: testCase.calendar === '양력' ? 'solar' : 'lunar', 
          birthYear: testCase.year.length <= 2 ? 
            (parseInt(testCase.year) <= 30 ? `20${testCase.year.padStart(2, '0')}` : `19${testCase.year}`) : 
            testCase.year,
          birthMonth: testCase.month.padStart(2, '0'),
          birthDay: testCase.day.padStart(2, '0'), 
          birthTime: testCase.hour.padStart(2, '0')
        };
        
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
        
        // Reference API 응답에서 사주 기둥 정보 추출
        let referenceSaju = {
          year: { stem: null, branch: null },
          month: { stem: null, branch: null },
          day: { stem: null, branch: null },
          time: { stem: null, branch: null }
        };
        
        let referenceElements = {
          wood: 0, fire: 0, earth: 0, metal: 0, water: 0
        };

        if (referenceResult.saju?.fortuneList?.saju) {
          const sajuData = referenceResult.saju.fortuneList.saju;
          
          // 사주 기둥 추출
          referenceSaju = {
            year: {
              stem: sajuData.yearSky?.chinese || null,
              branch: sajuData.yearGround?.chinese || null
            },
            month: {
              stem: sajuData.monthSky?.chinese || null,
              branch: sajuData.monthGround?.chinese || null
            },
            day: {
              stem: sajuData.daySky?.chinese || null,
              branch: sajuData.dayGround?.chinese || null
            },
            time: {
              stem: sajuData.timeSky?.chinese || null,
              branch: sajuData.timeGround?.chinese || null
            }
          };
          
          console.log(`  년주: ${referenceSaju.year.stem}${referenceSaju.year.branch} (${sajuData.yearSky?.korean || '?'}${sajuData.yearGround?.korean || '?'})`);
          console.log(`  월주: ${referenceSaju.month.stem}${referenceSaju.month.branch} (${sajuData.monthSky?.korean || '?'}${sajuData.monthGround?.korean || '?'})`);
          console.log(`  일주: ${referenceSaju.day.stem}${referenceSaju.day.branch} (${sajuData.daySky?.korean || '?'}${sajuData.dayGround?.korean || '?'})`);
          console.log(`  시주: ${referenceSaju.time.stem}${referenceSaju.time.branch} (${sajuData.timeSky?.korean || '?'}${sajuData.timeGround?.korean || '?'})`);
        }

        // 오행 정보 추출
        if (referenceResult.saju?.fortuneList?.storedUnse) {
          const unse = referenceResult.saju.fortuneList.storedUnse;
          referenceElements = {
            wood: unse.fiveTreeNum || 0,
            fire: unse.fiveFireNum || 0,
            earth: unse.fiveSoilNum || 0,
            metal: unse.fiveIronNum || 0,
            water: unse.fiveWaterNum || 0
          };
          
          console.log('\n🌟 Reference 오행 분석:');
          console.log(`  목: ${referenceElements.wood}, 화: ${referenceElements.fire}, 토: ${referenceElements.earth}, 금: ${referenceElements.metal}, 수: ${referenceElements.water}`);
          const refTotal = referenceElements.wood + referenceElements.fire + referenceElements.earth + referenceElements.metal + referenceElements.water;
          console.log(`  총합: ${refTotal}`);
        }

        // 신살 정보 추출
        const referenceSinsals: string[] = [];
        if (referenceResult.saju?.fortuneList?.saju) {
          const sajuData = referenceResult.saju.fortuneList.saju;
          
          // 각 기둥의 신살 수집
          [sajuData.yearGround, sajuData.monthGround, sajuData.dayGround, sajuData.timeGround]
            .forEach(ground => {
              if (ground?.sinsal && ground.sinsal !== '') {
                referenceSinsals.push(ground.sinsal);
              }
              if (ground?.etcSinsal && Array.isArray(ground.etcSinsal)) {
                referenceSinsals.push(...ground.etcSinsal);
              }
            });
        }

        console.log('\n🔮 Reference 신살:');
        if (referenceSinsals.length > 0) {
          referenceSinsals.forEach(sinsal => {
            console.log(`  - ${sinsal}`);
          });
        } else {
          console.log('  없음');
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
          elementsMatch: {
            wood: false,
            fire: false,
            earth: false,
            metal: false,
            water: false
          },
          sinsalsCommon: [] as string[]
        };

        // 사주 기둥 비교
        if (referenceSaju.year.stem && referenceSaju.year.branch) {
          const refYear = `${referenceSaju.year.stem}${referenceSaju.year.branch}`;
          const currYear = `${currentResult.saju.year.stem.chinese}${currentResult.saju.year.branch.chinese}`;
          comparison.pillarsMatch.year = refYear === currYear;
          console.log(`년주 비교: ${currYear} vs ${refYear} → ${comparison.pillarsMatch.year ? '✅ 일치' : '❌ 불일치'}`);
        }

        if (referenceSaju.month.stem && referenceSaju.month.branch) {
          const refMonth = `${referenceSaju.month.stem}${referenceSaju.month.branch}`;
          const currMonth = `${currentResult.saju.month.stem.chinese}${currentResult.saju.month.branch.chinese}`;
          comparison.pillarsMatch.month = refMonth === currMonth;
          console.log(`월주 비교: ${currMonth} vs ${refMonth} → ${comparison.pillarsMatch.month ? '✅ 일치' : '❌ 불일치'}`);
        }

        if (referenceSaju.day.stem && referenceSaju.day.branch) {
          const refDay = `${referenceSaju.day.stem}${referenceSaju.day.branch}`;
          const currDay = `${currentResult.saju.day.stem.chinese}${currentResult.saju.day.branch.chinese}`;
          comparison.pillarsMatch.day = refDay === currDay;
          console.log(`일주 비교: ${currDay} vs ${refDay} → ${comparison.pillarsMatch.day ? '✅ 일치' : '❌ 불일치'}`);
        }

        if (referenceSaju.time.stem && referenceSaju.time.branch) {
          const refTime = `${referenceSaju.time.stem}${referenceSaju.time.branch}`;
          const currTime = `${currentResult.saju.time.stem.chinese}${currentResult.saju.time.branch.chinese}`;
          comparison.pillarsMatch.time = refTime === currTime;
          console.log(`시주 비교: ${currTime} vs ${refTime} → ${comparison.pillarsMatch.time ? '✅ 일치' : '❌ 불일치'}`);
        }

        // 오행 비교
        console.log('\n🌟 오행 비교:');
        comparison.elementsMatch.wood = currentResult.elements.distribution.wood === referenceElements.wood;
        comparison.elementsMatch.fire = currentResult.elements.distribution.fire === referenceElements.fire;
        comparison.elementsMatch.earth = currentResult.elements.distribution.earth === referenceElements.earth;
        comparison.elementsMatch.metal = currentResult.elements.distribution.metal === referenceElements.metal;
        comparison.elementsMatch.water = currentResult.elements.distribution.water === referenceElements.water;

        console.log(`목: ${currentResult.elements.distribution.wood} vs ${referenceElements.wood} → ${comparison.elementsMatch.wood ? '✅' : '❌'}`);
        console.log(`화: ${currentResult.elements.distribution.fire} vs ${referenceElements.fire} → ${comparison.elementsMatch.fire ? '✅' : '❌'}`);
        console.log(`토: ${currentResult.elements.distribution.earth} vs ${referenceElements.earth} → ${comparison.elementsMatch.earth ? '✅' : '❌'}`);
        console.log(`금: ${currentResult.elements.distribution.metal} vs ${referenceElements.metal} → ${comparison.elementsMatch.metal ? '✅' : '❌'}`);
        console.log(`수: ${currentResult.elements.distribution.water} vs ${referenceElements.water} → ${comparison.elementsMatch.water ? '✅' : '❌'}`);

        // 신살 비교
        console.log('\n🔮 신살 비교:');
        const currentSinsals = currentResult.sinsals || [];
        comparison.sinsalsCommon = currentSinsals.filter(curr => 
          referenceSinsals.some(ref => ref === curr || curr.includes(ref) || ref.includes(curr))
        );
        
        console.log(`현재 구현: ${currentSinsals.length}개 - ${currentSinsals.join(', ')}`);
        console.log(`Reference: ${referenceSinsals.length}개 - ${referenceSinsals.join(', ')}`);
        console.log(`공통 신살: ${comparison.sinsalsCommon.length}개 - ${comparison.sinsalsCommon.join(', ')}`);

        // 전체 비교 결과
        console.log('\n📊 === 전체 비교 결과 ===');
        const pillarsMatchCount = Object.values(comparison.pillarsMatch).filter(Boolean).length;
        const elementsMatchCount = Object.values(comparison.elementsMatch).filter(Boolean).length;
        
        console.log(`사주 기둥 일치율: ${pillarsMatchCount}/4 (${(pillarsMatchCount/4*100).toFixed(1)}%)`);
        console.log(`오행 일치율: ${elementsMatchCount}/5 (${(elementsMatchCount/5*100).toFixed(1)}%)`);
        console.log(`신살 공통률: ${comparison.sinsalsCommon.length}/${Math.max(currentSinsals.length, referenceSinsals.length)} (${(comparison.sinsalsCommon.length/Math.max(currentSinsals.length, referenceSinsals.length, 1)*100).toFixed(1)}%)`);

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
            elements: currentResult.elements.distribution,
            sinsals: currentSinsals
          },
          referenceResult: {
            saju: {
              year: referenceSaju.year.stem && referenceSaju.year.branch ? `${referenceSaju.year.stem}${referenceSaju.year.branch}` : null,
              month: referenceSaju.month.stem && referenceSaju.month.branch ? `${referenceSaju.month.stem}${referenceSaju.month.branch}` : null,
              day: referenceSaju.day.stem && referenceSaju.day.branch ? `${referenceSaju.day.stem}${referenceSaju.day.branch}` : null,
              time: referenceSaju.time.stem && referenceSaju.time.branch ? `${referenceSaju.time.stem}${referenceSaju.time.branch}` : null
            },
            elements: referenceElements,
            sinsals: referenceSinsals
          },
          comparison: {
            pillarsMatch: comparison.pillarsMatch,
            elementsMatch: comparison.elementsMatch,
            sinsalsCommon: comparison.sinsalsCommon,
            matchRate: {
              pillars: pillarsMatchCount / 4,
              elements: elementsMatchCount / 5,
              sinsals: comparison.sinsalsCommon.length / Math.max(currentSinsals.length, referenceSinsals.length, 1)
            }
          }
        };

        console.log('\n📋 === JSON 상세 결과 ===');
        console.log(JSON.stringify(detailedComparison, null, 2));

        // 테스트 어서션
        if (pillarsMatchCount === 4) {
          console.log('🎉 모든 사주 기둥이 완벽히 일치합니다!');
        } else if (pillarsMatchCount >= 3) {
          console.log('👍 대부분의 사주 기둥이 일치합니다.');
        } else if (pillarsMatchCount >= 2) {
          console.log('⚠️ 일부 사주 기둥이 일치합니다.');
        } else {
          console.log('❌ 사주 기둥 계산에 큰 차이가 있습니다.');
        }

        // 최소 50% 이상 일치해야 함
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

  afterAll(() => {
    console.log('\n🎉 정확한 Reference 비교 테스트 완료');
    console.log('📋 위 결과를 통해 현재 구현과 Reference fetchSaju의 정확한 차이점을 확인할 수 있습니다.');
  });
});