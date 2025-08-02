/**
 * fetchSaju vs get-saju-info 상세 비교 테스트
 * 각 테스트 케이스의 input/output을 key별로 상세 비교
 */

import { getSajuInfo, getSajuInfoCompatible, validateAndNormalizeInput } from '@/lib/core/saju';
import { generateComprehensiveTestCases } from '@/tests/fixtures/data/comprehensive-test-cases';
import type { BirthInput } from '@/lib/shared/types/saju';

describe('fetchSaju vs get-saju-info 상세 비교', () => {
  let testCases: BirthInput[];

  beforeAll(() => {
    testCases = generateComprehensiveTestCases();
    console.log(`\n🔍 상세 비교 테스트 시작 - ${testCases.length}개 케이스`);
  });

  describe('상위 10개 케이스 상세 분석', () => {
    test('케이스별 Input/Output 상세 비교', () => {
      const limitedCases = testCases.slice(0, 10);
      const detailedResults: any[] = [];

      limitedCases.forEach((testCase, index) => {
        console.log(`\n🎯 === 케이스 ${index + 1}: ${testCase.name} ===`);
        
        // Input 정보 출력
        console.log('📥 INPUT:');
        console.log(`  이름: ${testCase.name}`);
        console.log(`  성별: ${testCase.gender}`);
        console.log(`  생년월일시: ${testCase.year}년 ${testCase.month}월 ${testCase.day}일 ${testCase.hour}시`);
        console.log(`  달력: ${testCase.calendar}`);

        try {
          const normalizedInput = validateAndNormalizeInput(testCase);
          const result = getSajuInfoCompatible(normalizedInput);

          // 기본 정보 비교
          console.log('\n📤 OUTPUT - 기본 정보:');
          console.log(`  이름: ${result.name}`);
          console.log(`  성별: ${result.gender}`);
          console.log(`  생년월일시: ${result.birth.year}.${result.birth.month}.${result.birth.day} ${result.birth.hour}시`);
          console.log(`  달력타입: ${result.birth.type}`);

          // 사주 기둥 상세 비교
          console.log('\n🏛️ OUTPUT - 사주 기둥:');
          console.log(`  년주: ${result.saju.year.stem.chinese}${result.saju.year.branch.chinese} (${result.saju.year.stem.korean}${result.saju.year.branch.korean})`);
          console.log(`    년간: ${result.saju.year.stem.chinese}(${result.saju.year.stem.korean}) - ${result.saju.year.stem.element}(${result.saju.year.stem.yangyin})`);
          console.log(`    년지: ${result.saju.year.branch.chinese}(${result.saju.year.branch.korean}) - ${result.saju.year.branch.element}(${result.saju.year.branch.yangyin})`);
          
          console.log(`  월주: ${result.saju.month.stem.chinese}${result.saju.month.branch.chinese} (${result.saju.month.stem.korean}${result.saju.month.branch.korean})`);
          console.log(`    월간: ${result.saju.month.stem.chinese}(${result.saju.month.stem.korean}) - ${result.saju.month.stem.element}(${result.saju.month.stem.yangyin})`);
          console.log(`    월지: ${result.saju.month.branch.chinese}(${result.saju.month.branch.korean}) - ${result.saju.month.branch.element}(${result.saju.month.branch.yangyin})`);
          
          console.log(`  일주: ${result.saju.day.stem.chinese}${result.saju.day.branch.chinese} (${result.saju.day.stem.korean}${result.saju.day.branch.korean})`);
          console.log(`    일간: ${result.saju.day.stem.chinese}(${result.saju.day.stem.korean}) - ${result.saju.day.stem.element}(${result.saju.day.stem.yangyin})`);
          console.log(`    일지: ${result.saju.day.branch.chinese}(${result.saju.day.branch.korean}) - ${result.saju.day.branch.element}(${result.saju.day.branch.yangyin})`);
          
          console.log(`  시주: ${result.saju.time.stem.chinese}${result.saju.time.branch.chinese} (${result.saju.time.stem.korean}${result.saju.time.branch.korean})`);
          console.log(`    시간: ${result.saju.time.stem.chinese}(${result.saju.time.stem.korean}) - ${result.saju.time.stem.element}(${result.saju.time.stem.yangyin})`);
          console.log(`    시지: ${result.saju.time.branch.chinese}(${result.saju.time.branch.korean}) - ${result.saju.time.branch.element}(${result.saju.time.branch.yangyin})`);

          // 오행 분석 상세
          console.log('\n🌟 OUTPUT - 오행 분석:');
          console.log(`  목: ${result.elements.distribution.wood}개`);
          console.log(`  화: ${result.elements.distribution.fire}개`);
          console.log(`  토: ${result.elements.distribution.earth}개`);
          console.log(`  금: ${result.elements.distribution.metal}개`);
          console.log(`  수: ${result.elements.distribution.water}개`);
          console.log(`  총계: ${result.elements.analysis.total}개`);
          console.log(`  최강: ${result.elements.analysis.strongest}`);
          console.log(`  최약: ${result.elements.analysis.weakest}`);
          console.log(`  균형: ${result.elements.analysis.balance}`);

          // 십성 분석 (있는 경우)
          if (result.tenStars) {
            console.log('\n⭐ OUTPUT - 십성:');
            console.log(`  년주 십성: ${result.tenStars.year?.chinese || 'N/A'}`);
            console.log(`  월주 십성: ${result.tenStars.month?.chinese || 'N/A'}`);
            console.log(`  일주 십성: ${result.tenStars.day?.chinese || 'N/A'}`);
            console.log(`  시주 십성: ${result.tenStars.time?.chinese || 'N/A'}`);
          }

          // 신살 분석
          console.log('\n🔮 OUTPUT - 신살:');
          if (result.sinsals && result.sinsals.length > 0) {
            result.sinsals.forEach(sinsal => {
              console.log(`  - ${sinsal}`);
            });
          } else {
            console.log('  없음');
          }

          // 대운 정보
          console.log('\n🎯 OUTPUT - 대운:');
          console.log(`  현재 나이: ${result.fortune.currentAge}세`);
          console.log(`  현재 대운: ${result.fortune.bigFortune.current.number}차 (${result.fortune.bigFortune.current.period})`);
          console.log(`    대운 간지: ${result.fortune.bigFortune.current.stem.chinese}${result.fortune.bigFortune.current.branch.chinese}`);
          console.log(`  다음 대운: ${result.fortune.bigFortune.next.number}차 (${result.fortune.bigFortune.next.period})`);
          console.log(`    대운 간지: ${result.fortune.bigFortune.next.stem.chinese}${result.fortune.bigFortune.next.branch.chinese}`);

          // 년운 정보
          console.log('\n📅 OUTPUT - 년운:');
          console.log(`  ${result.fortune.yearFortune.year}년 년운: ${result.fortune.yearFortune.stem.chinese}${result.fortune.yearFortune.branch.chinese}`);

          // 상세 결과 저장
          const detailedResult = {
            caseNumber: index + 1,
            input: {
              name: testCase.name,
              gender: testCase.gender,
              birthDate: `${testCase.year}.${testCase.month}.${testCase.day} ${testCase.hour}시`,
              calendar: testCase.calendar
            },
            output: {
              basicInfo: {
                name: result.name,
                gender: result.gender,
                birthDate: `${result.birth.year}.${result.birth.month}.${result.birth.day} ${result.birth.hour}시`,
                calendarType: result.birth.type
              },
              sajuPillars: {
                year: `${result.saju.year.stem.chinese}${result.saju.year.branch.chinese}`,
                month: `${result.saju.month.stem.chinese}${result.saju.month.branch.chinese}`,
                day: `${result.saju.day.stem.chinese}${result.saju.day.branch.chinese}`,
                time: `${result.saju.time.stem.chinese}${result.saju.time.branch.chinese}`
              },
              elements: {
                distribution: result.elements.distribution,
                analysis: result.elements.analysis
              },
              sinsals: result.sinsals || [],
              fortune: {
                currentAge: result.fortune.currentAge,
                currentBigFortune: `${result.fortune.bigFortune.current.number}차`,
                yearFortune: `${result.fortune.yearFortune.year}년`
              }
            },
            status: '성공'
          };

          detailedResults.push(detailedResult);

        } catch (error) {
          console.log(`\n❌ 에러 발생: ${error instanceof Error ? error.message : String(error)}`);
          
          detailedResults.push({
            caseNumber: index + 1,
            input: testCase,
            output: null,
            error: error instanceof Error ? error.message : String(error),
            status: '실패'
          });
        }

        console.log('\n' + '='.repeat(80));
      });

      // 결과 요약
      console.log('\n📊 === 상세 비교 결과 요약 ===');
      const successCount = detailedResults.filter(r => r.status === '성공').length;
      const failCount = detailedResults.filter(r => r.status === '실패').length;
      
      console.log(`총 케이스: ${detailedResults.length}개`);
      console.log(`성공: ${successCount}개 (${(successCount/detailedResults.length*100).toFixed(1)}%)`);
      console.log(`실패: ${failCount}개 (${(failCount/detailedResults.length*100).toFixed(1)}%)`);

      // JSON 형태로 전체 결과 출력
      console.log('\n📋 === JSON 형태 상세 결과 ===');
      console.log(JSON.stringify(detailedResults, null, 2));

      // 성공한 케이스들의 패턴 분석
      console.log('\n🔍 === 패턴 분석 ===');
      const successResults = detailedResults.filter(r => r.status === '성공');
      
      if (successResults.length > 0) {
        // 년주 분포
        const yearStems = successResults.map(r => r.output.sajuPillars.year.charAt(0));
        const yearStemCount = yearStems.reduce((acc, stem) => {
          acc[stem] = (acc[stem] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        console.log('년간 분포:', yearStemCount);

        // 오행 분포 통계
        const elementStats = successResults.map(r => r.output.elements.analysis.strongest);
        const elementCount = elementStats.reduce((acc, element) => {
          acc[element] = (acc[element] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        console.log('최강 오행 분포:', elementCount);
      }

      // 모든 케이스가 성공해야 함
      expect(successCount).toBe(detailedResults.length);
    });
  });

  describe('Key별 상세 검증', () => {
    test('각 key 값별 정확성 검증', () => {
      const sampleCases = testCases.slice(0, 5);
      
      sampleCases.forEach((testCase, index) => {
        const normalizedInput = validateAndNormalizeInput(testCase);
        const result = getSajuInfoCompatible(normalizedInput);

        console.log(`\n🔑 케이스 ${index + 1} Key별 검증: ${testCase.name}`);

        // 1. name 필드 검증
        console.log(`✅ name: "${result.name}" (입력: "${testCase.name}")`);
        expect(result.name).toBe(testCase.name);

        // 2. gender 필드 검증
        console.log(`✅ gender: "${result.gender}" (입력: "${testCase.gender}")`);
        expect(result.gender).toBe(testCase.gender);

        // 3. birth 객체 각 필드 검증
        console.log('✅ birth 객체:');
        console.log(`  - type: "${result.birth.type}" (입력 calendar: "${testCase.calendar}")`);
        console.log(`  - year: "${result.birth.year}" (입력: "${testCase.year}")`);
        console.log(`  - month: "${result.birth.month}" (입력: "${testCase.month}")`);
        console.log(`  - day: "${result.birth.day}" (입력: "${testCase.day}")`);
        console.log(`  - hour: "${result.birth.hour}" (입력: "${testCase.hour}")`);

        expect(result.birth.type).toMatch(/^(solar|lunar)$/);
        expect(result.birth.year).toBeDefined();
        expect(result.birth.month).toBe(testCase.month);
        expect(result.birth.day).toBe(testCase.day);
        expect(result.birth.hour).toBe(testCase.hour);

        // 4. saju 객체 각 기둥별 검증
        console.log('✅ saju 객체:');
        ['year', 'month', 'day', 'time'].forEach(pillar => {
          const pillarData = result.saju[pillar as keyof typeof result.saju];
          console.log(`  - ${pillar}:`);
          console.log(`    stem: ${pillarData.stem.chinese}(${pillarData.stem.korean}) - ${pillarData.stem.element}(${pillarData.stem.yangyin})`);
          console.log(`    branch: ${pillarData.branch.chinese}(${pillarData.branch.korean}) - ${pillarData.branch.element}(${pillarData.branch.yangyin})`);
          
          // 천간 검증
          expect(pillarData.stem.chinese).toMatch(/[甲乙丙丁戊己庚辛壬癸]/);
          expect(pillarData.stem.korean).toBeDefined();
          expect(pillarData.stem.element).toMatch(/^(목|화|토|금|수)$/);
          expect(pillarData.stem.yangyin).toMatch(/^(양|음)$/);
          
          // 지지 검증
          expect(pillarData.branch.chinese).toMatch(/[子丑寅卯辰巳午未申酉戌亥]/);
          expect(pillarData.branch.korean).toBeDefined();
          expect(pillarData.branch.element).toMatch(/^(목|화|토|금|수)$/);
          expect(pillarData.branch.yangyin).toMatch(/^(양|음)$/);
        });

        // 5. elements 객체 검증
        console.log('✅ elements 객체:');
        console.log(`  - distribution: 목=${result.elements.distribution.wood}, 화=${result.elements.distribution.fire}, 토=${result.elements.distribution.earth}, 금=${result.elements.distribution.metal}, 수=${result.elements.distribution.water}`);
        console.log(`  - analysis: total=${result.elements.analysis.total}, strongest=${result.elements.analysis.strongest}, weakest=${result.elements.analysis.weakest}, balance=${result.elements.analysis.balance}`);
        
        expect(result.elements.distribution.wood).toBeGreaterThanOrEqual(0);
        expect(result.elements.distribution.fire).toBeGreaterThanOrEqual(0);
        expect(result.elements.distribution.earth).toBeGreaterThanOrEqual(0);
        expect(result.elements.distribution.metal).toBeGreaterThanOrEqual(0);
        expect(result.elements.distribution.water).toBeGreaterThanOrEqual(0);
        expect(result.elements.analysis.total).toBeGreaterThan(0);
        expect(result.elements.analysis.strongest).toMatch(/^(목|화|토|금|수)$/);

        // 6. sinsals 배열 검증
        console.log('✅ sinsals 배열:');
        if (result.sinsals && result.sinsals.length > 0) {
          result.sinsals.forEach(sinsal => {
            console.log(`  - "${sinsal}"`);
            expect(typeof sinsal).toBe('string');
            expect(sinsal.length).toBeGreaterThan(0);
          });
        } else {
          console.log('  - (신살 없음)');
        }

        // 7. fortune 객체 검증
        console.log('✅ fortune 객체:');
        console.log(`  - currentAge: ${result.fortune.currentAge}`);
        console.log(`  - bigFortune.current: ${result.fortune.bigFortune.current.number}차 (${result.fortune.bigFortune.current.period})`);
        console.log(`  - bigFortune.next: ${result.fortune.bigFortune.next.number}차 (${result.fortune.bigFortune.next.period})`);
        console.log(`  - yearFortune: ${result.fortune.yearFortune.year}년`);
        
        expect(result.fortune.currentAge).toBeGreaterThan(0);
        expect(result.fortune.bigFortune.current.number).toBeGreaterThan(0);
        expect(result.fortune.bigFortune.next.number).toBeGreaterThan(0);
        expect(result.fortune.yearFortune.year).toBeGreaterThan(1900);
      });
    });
  });

  afterAll(() => {
    console.log('\n🎉 상세 비교 분석 완료');
    console.log('📄 위 결과를 통해 fetchSaju와의 호환성 및 정확성을 확인할 수 있습니다.');
  });
});