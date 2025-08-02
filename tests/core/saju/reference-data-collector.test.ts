/**
 * Reference API 데이터 수집기
 * Reference API를 통해 정답 데이터를 수집하여 각 모듈 테스트에 활용
 */

import { fetchSaju } from '@/lib/core/saju/reference';
import fs from 'fs';
import path from 'path';

describe('Reference 데이터 수집기', () => {
  const testCases = [
    // 양력 케이스들
    { name: '홍길동', gender: '남성', birthType: 'solar', birthYear: '1995', birthMonth: '04', birthDay: '25', birthTime: '08' },
    { name: '김철수', gender: '남성', birthType: 'solar', birthYear: '1988', birthMonth: '12', birthDay: '31', birthTime: '23' },
    { name: '박영수', gender: '남성', birthType: 'solar', birthYear: '2000', birthMonth: '01', birthDay: '01', birthTime: '00' },
    { name: '김영희', gender: '여성', birthType: 'solar', birthYear: '1992', birthMonth: '07', birthDay: '15', birthTime: '12' },
    { name: '이미나', gender: '여성', birthType: 'solar', birthYear: '1985', birthMonth: '03', birthDay: '08', birthTime: '06' },
    
    // 음력 케이스들
    { name: '최민수', gender: '남성', birthType: 'lunar', birthYear: '1990', birthMonth: '05', birthDay: '20', birthTime: '14' },
    { name: '정수연', gender: '여성', birthType: 'lunar', birthYear: '1987', birthMonth: '11', birthDay: '03', birthTime: '18' },
    { name: '김대중', gender: '남성', birthType: 'lunar', birthYear: '1980', birthMonth: '02', birthDay: '29', birthTime: '09' },
    { name: '송하늘', gender: '여성', birthType: 'lunar', birthYear: '1995', birthMonth: '06', birthDay: '10', birthTime: '15' },
    { name: '윤바다', gender: '남성', birthType: 'lunar', birthYear: '2003', birthMonth: '09', birthDay: '27', birthTime: '21' },
    
    // 특수 케이스들
    { name: '윤년케이스', gender: '남성', birthType: 'solar', birthYear: '2000', birthMonth: '02', birthDay: '29', birthTime: '12' },
    { name: '자정케이스', gender: '여성', birthType: 'solar', birthYear: '1995', birthMonth: '06', birthDay: '15', birthTime: '00' },
    { name: '정오케이스', gender: '남성', birthType: 'solar', birthYear: '1995', birthMonth: '06', birthDay: '15', birthTime: '12' },
    { name: '2자리년도1', gender: '여성', birthType: 'solar', birthYear: '1995', birthMonth: '06', birthDay: '10', birthTime: '15' },
    { name: '2자리년도2', gender: '남성', birthType: 'solar', birthYear: '2003', birthMonth: '09', birthDay: '27', birthTime: '03' }
  ];

  test('Reference API 데이터 수집 및 저장', async () => {
    const collectedData: any[] = [];
    
    console.log(`\n📊 Reference API 데이터 수집 시작 - ${testCases.length}개 케이스`);
    
    for (const [index, testCase] of testCases.entries()) {
      console.log(`\n🔍 === 케이스 ${index + 1}: ${testCase.name} ===`);
      
      try {
        const result = await fetchSaju(
          testCase.name,
          testCase.gender,
          testCase.birthType,
          testCase.birthYear,
          testCase.birthMonth,
          testCase.birthDay,
          testCase.birthTime
        );

        // 사주 정보 추출
        let sajuData = null;
        let elementsData = null;
        let sinsalsData = [];

        if (result.saju?.fortuneList) {
          const fortuneList = result.saju.fortuneList;
          
          // 사주 기둥 추출
          if (fortuneList.saju) {
            const saju = fortuneList.saju;
            sajuData = {
              year: {
                stem: { chinese: saju.yearSky?.chinese, korean: saju.yearSky?.korean },
                branch: { chinese: saju.yearGround?.chinese, korean: saju.yearGround?.korean }
              },
              month: {
                stem: { chinese: saju.monthSky?.chinese, korean: saju.monthSky?.korean },
                branch: { chinese: saju.monthGround?.chinese, korean: saju.monthGround?.korean }
              },
              day: {
                stem: { chinese: saju.daySky?.chinese, korean: saju.daySky?.korean },
                branch: { chinese: saju.dayGround?.chinese, korean: saju.dayGround?.korean }
              },
              time: {
                stem: { chinese: saju.timeSky?.chinese, korean: saju.timeSky?.korean },
                branch: { chinese: saju.timeGround?.chinese, korean: saju.timeGround?.korean }
              }
            };
          }

          // 오행 데이터 추출
          if (fortuneList.storedUnse) {
            const unse = fortuneList.storedUnse;
            elementsData = {
              wood: unse.fiveTreeNum || 0,
              fire: unse.fiveFireNum || 0,
              earth: unse.fiveSoilNum || 0,
              metal: unse.fiveIronNum || 0,
              water: unse.fiveWaterNum || 0
            };
          }

          // 신살 데이터 추출
          if (fortuneList.saju) {
            const saju = fortuneList.saju;
            [saju.yearGround, saju.monthGround, saju.dayGround, saju.timeGround].forEach(ground => {
              if (ground?.sinsal && ground.sinsal !== '') {
                sinsalsData.push(ground.sinsal);
              }
              if (ground?.etcSinsal && Array.isArray(ground.etcSinsal)) {
                sinsalsData.push(...ground.etcSinsal);
              }
            });
          }
        }

        const processedData = {
          input: testCase,
          reference: {
            saju: sajuData,
            elements: elementsData,
            sinsals: sinsalsData
          },
          raw: result // 원본 데이터도 보관
        };

        collectedData.push(processedData);

        console.log(`✅ 수집 완료: ${testCase.name}`);
        if (sajuData) {
          console.log(`  사주: ${sajuData.year.stem.chinese}${sajuData.year.branch.chinese} ${sajuData.month.stem.chinese}${sajuData.month.branch.chinese} ${sajuData.day.stem.chinese}${sajuData.day.branch.chinese} ${sajuData.time.stem.chinese}${sajuData.time.branch.chinese}`);
        }
        if (elementsData) {
          console.log(`  오행: 목${elementsData.wood} 화${elementsData.fire} 토${elementsData.earth} 금${elementsData.metal} 수${elementsData.water}`);
        }
        console.log(`  신살: ${sinsalsData.length}개`);

      } catch (error) {
        console.error(`❌ 실패: ${testCase.name} - ${error instanceof Error ? error.message : String(error)}`);
        
        collectedData.push({
          input: testCase,
          error: error instanceof Error ? error.message : String(error),
          reference: null
        });
      }

      // API 호출 간격 조절
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 데이터 저장
    const outputPath = path.join(__dirname, '../../fixtures/data/reference-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(collectedData, null, 2), 'utf8');
    
    console.log(`\n💾 데이터 저장 완료: ${outputPath}`);
    console.log(`📊 총 ${collectedData.length}개 케이스 처리 완료`);
    
    // 성공률 계산
    const successCount = collectedData.filter(data => data.reference !== null).length;
    const successRate = (successCount / collectedData.length) * 100;
    
    console.log(`✅ 성공률: ${successCount}/${collectedData.length} (${successRate.toFixed(1)}%)`);

    expect(collectedData.length).toBe(testCases.length);
    expect(successCount).toBeGreaterThan(0);
  }, 180000); // 3분 타임아웃

  test('수집된 데이터 검증', () => {
    const dataPath = path.join(__dirname, '../../fixtures/data/reference-data.json');
    
    if (!fs.existsSync(dataPath)) {
      console.warn('⚠️ Reference 데이터 파일이 없습니다. 먼저 데이터 수집을 실행하세요.');
      return;
    }

    const referenceData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    console.log(`\n📋 수집된 데이터 검증: ${referenceData.length}개 케이스`);

    const validData = referenceData.filter((data: any) => data.reference !== null);
    
    console.log(`✅ 유효한 데이터: ${validData.length}개`);
    
    // 각 케이스별 데이터 구조 검증
    validData.forEach((data: any, index: number) => {
      if (data.reference?.saju) {
        const saju = data.reference.saju;
        
        // 사주 기둥 검증
        expect(saju.year.stem.chinese).toMatch(/[甲乙丙丁戊己庚辛壬癸]/);
        expect(saju.year.branch.chinese).toMatch(/[子丑寅卯辰巳午未申酉戌亥]/);
        expect(saju.month.stem.chinese).toMatch(/[甲乙丙丁戊己庚辛壬癸]/);
        expect(saju.month.branch.chinese).toMatch(/[子丑寅卯辰巳午未申酉戌亥]/);
        expect(saju.day.stem.chinese).toMatch(/[甲乙丙丁戊己庚辛壬癸]/);
        expect(saju.day.branch.chinese).toMatch(/[子丑寅卯辰巳午未申酉戌亥]/);
        expect(saju.time.stem.chinese).toMatch(/[甲乙丙丁戊己庚辛壬癸]/);
        expect(saju.time.branch.chinese).toMatch(/[子丑寅卯辰巳午未申酉戌亥]/);
      }

      if (data.reference?.elements) {
        const elements = data.reference.elements;
        const total = elements.wood + elements.fire + elements.earth + elements.metal + elements.water;
        
        // 오행 합이 8이어야 함 (사주 8자)
        expect(total).toBe(8);
        expect(elements.wood).toBeGreaterThanOrEqual(0);
        expect(elements.fire).toBeGreaterThanOrEqual(0);
        expect(elements.earth).toBeGreaterThanOrEqual(0);
        expect(elements.metal).toBeGreaterThanOrEqual(0);
        expect(elements.water).toBeGreaterThanOrEqual(0);
      }

      if (data.reference?.sinsals) {
        expect(Array.isArray(data.reference.sinsals)).toBe(true);
      }
    });

    console.log('✅ 모든 데이터 구조 검증 완료');
  });
});