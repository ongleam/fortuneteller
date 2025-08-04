'use client';

import { useState } from 'react';
import { calculateSajuAction } from '@/lib/interfaces/actions/debug';
import type { BirthInput, SajuPillars, PillarTenStars } from '@/lib/shared/types/saju';
import { getStemInfo, getBranchInfo } from '@/lib/core/saju/constants';
import { getTenStarsForPillars } from '@/lib/core/saju/ten-stars';

// 오행에 따른 색상을 반환하는 헬퍼 함수
const getElementColor = (element: string | undefined): string => {
  switch (element) {
    case '목':
      return 'bg-blue-500 text-white';
    case '화':
      return 'bg-red-500 text-white';
    case '토':
      return 'bg-yellow-500 text-white';
    case '금':
      return 'bg-gray-400 text-white';
    case '수':
      return 'bg-gray-800 text-white';
    default:
      return 'bg-gray-200 text-black';
  }
};

// 사주 팔자 표시 컴포넌트
const SajuPillarsDisplay = ({
  pillars,
  tenStars,
}: {
  pillars: SajuPillars;
  tenStars: PillarTenStars;
}) => {
  const pillarOrder: Array<{ key: keyof SajuPillars; name: string }> = [
    { key: 'time', name: '시주' },
    { key: 'day', name: '일주' },
    { key: 'month', name: '월주' },
    { key: 'year', name: '년주' },
  ];

  const getHanjaSound = (hanja: string): string => {
    const hanjaMap: { [key: string]: string } = {
      甲: '갑',
      乙: '을',
      丙: '병',
      丁: '정',
      戊: '무',
      己: '기',
      庚: '경',
      辛: '신',
      壬: '임',
      癸: '계',
      子: '자',
      丑: '축',
      寅: '인',
      卯: '묘',
      辰: '진',
      巳: '사',
      午: '오',
      未: '미',
      申: '신',
      酉: '유',
      戌: '술',
      亥: '해',
    };
    return hanjaMap[hanja] || '';
  };

  return (
    <div className="rounded-lg border bg-white p-6 shadow-lg">
      <div className="grid grid-cols-4 text-center text-gray-500">
        {pillarOrder.map((p) => (
          <div key={p.key}>{p.name}</div>
        ))}
      </div>

      <div className="my-4 rounded-lg border bg-white p-4 shadow-inner">
        <div className="grid grid-cols-4 text-center">
          {pillarOrder.map((p, index) => (
            <div
              key={p.key}
              className={`flex items-center justify-center ${index < 3 ? 'border-r' : ''}`}
            >
              <span className="font-semibold text-gray-800">
                {tenStars[p.key as keyof PillarTenStars]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {pillarOrder.map((p) => {
          const pillar = pillars[p.key];
          const stemInfo = getStemInfo(pillar.stem);
          const branchInfo = getBranchInfo(pillar.branch);

          return (
            <div key={p.key} className="space-y-2">
              {/* 천간 */}
              <div
                className={`flex flex-col items-center justify-center rounded-lg p-3 shadow ${getElementColor(stemInfo?.fiveElement)}`}
              >
                <div className="text-xs opacity-80">{`${stemInfo?.fiveElement}, ${stemInfo?.korean}`}</div>
                <div className="text-4xl font-bold">{pillar.stem}</div>
                <div className="text-sm">{getHanjaSound(pillar.stem)}</div>
              </div>
              {/* 지지 */}
              <div
                className={`flex flex-col items-center justify-center rounded-lg p-3 shadow ${getElementColor(branchInfo?.fiveElement)}`}
              >
                <div className="text-xs opacity-80">{`${branchInfo?.fiveElement}, ${branchInfo?.korean}`}</div>
                <div className="text-4xl font-bold">{pillar.branch}</div>
                <div className="text-sm">{getHanjaSound(pillar.branch)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function DebugPage() {
  const [birthInput, setBirthInput] = useState<BirthInput>({
    name: '테스트',
    gender: '남성',
    calendar: '양력',
    year: '1995',
    month: '4',
    day: '25',
    hour: '14',
    minute: '30',
  });

  const [sajuResult, setSajuResult] = useState<{
    local?: SajuPillars;
    reference?: SajuPillars;
    localTenStars?: PillarTenStars;
    referenceTenStars?: PillarTenStars;
    error?: string;
    loading?: boolean;
  }>({});

  const calculateSaju = async () => {
    setSajuResult({ loading: true });

    try {
      const result = await calculateSajuAction(birthInput);

      let localTenStars, referenceTenStars;
      if (result.local) {
        localTenStars = getTenStarsForPillars(result.local);
      }
      if (result.reference) {
        referenceTenStars = getTenStarsForPillars(result.reference);
      }

      setSajuResult({
        ...result,
        localTenStars,
        referenceTenStars,
        loading: false,
      });
    } catch (error) {
      setSajuResult({
        error: (error as Error).message,
        loading: false,
      });
    }
  };

  const handleTimeChange = (value: string) => {
    const [hour, minute] = value.split(':');
    setBirthInput((prev) => ({ ...prev, hour, minute: minute || '0' }));
  };

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <h1 className="mb-8 text-center text-3xl font-bold">사주 팔자 디버깅 도구</h1>

      {/* 입력 폼 */}
      <div className="mb-8 rounded-lg border bg-white p-6 shadow-lg">
        <h2 className="mb-6 text-xl font-semibold text-purple-600">생년월일 및 생시 입력</h2>

        <div className="grid gap-4 md:grid-cols-3">
          {/* 기본 정보 */}
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">이름</label>
              <input
                type="text"
                value={birthInput.name}
                onChange={(e) => setBirthInput((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="이름"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">성별</label>
              <select
                value={birthInput.gender}
                onChange={(e) =>
                  setBirthInput((prev) => ({ ...prev, gender: e.target.value as '남성' | '여성' }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="남성">남성</option>
                <option value="여성">여성</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">양력/음력</label>
              <select
                value={birthInput.calendar}
                onChange={(e) =>
                  setBirthInput((prev) => ({
                    ...prev,
                    calendar: e.target.value as '양력' | '음력',
                  }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="양력">양력</option>
                <option value="음력">음력</option>
              </select>
            </div>
          </div>

          {/* 생년월일 */}
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">년도</label>
              <input
                type="number"
                value={birthInput.year}
                onChange={(e) => setBirthInput((prev) => ({ ...prev, year: e.target.value }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="1995"
                min="1900"
                max="2100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">월</label>
              <input
                type="number"
                value={birthInput.month}
                onChange={(e) => setBirthInput((prev) => ({ ...prev, month: e.target.value }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="4"
                min="1"
                max="12"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">일</label>
              <input
                type="number"
                value={birthInput.day}
                onChange={(e) => setBirthInput((prev) => ({ ...prev, day: e.target.value }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="25"
                min="1"
                max="31"
              />
            </div>
          </div>

          {/* 생시 */}
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">생시 (시간)</label>
              <select
                value={`${birthInput.hour}:${birthInput.minute}`}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="00:00">자시 (23:30 ~ 01:29)</option>
                <option value="01:30">축시 (01:30 ~ 03:29)</option>
                <option value="03:30">인시 (03:30 ~ 05:29)</option>
                <option value="05:30">묘시 (05:30 ~ 07:29)</option>
                <option value="07:30">진시 (07:30 ~ 09:29)</option>
                <option value="09:30">사시 (09:30 ~ 11:29)</option>
                <option value="11:30">오시 (11:30 ~ 13:29)</option>
                <option value="13:30">미시 (13:30 ~ 15:29)</option>
                <option value="15:30">신시 (15:30 ~ 17:29)</option>
                <option value="17:30">유시 (17:30 ~ 19:29)</option>
                <option value="19:30">술시 (19:30 ~ 21:29)</option>
                <option value="21:30">해시 (21:30 ~ 23:29)</option>
              </select>
            </div>

            <div className="pt-8">
              <button
                onClick={calculateSaju}
                disabled={sajuResult.loading}
                className="w-full rounded-md bg-purple-500 px-4 py-3 font-medium text-white transition-colors hover:bg-purple-600 disabled:bg-gray-400"
              >
                {sajuResult.loading ? '계산 중...' : '사주 팔자 계산'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 결과 표시 */}
      {sajuResult.error && (
        <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-6">
          <h3 className="mb-2 text-lg font-semibold text-red-800">오류</h3>
          <p className="text-red-600">{sajuResult.error}</p>
        </div>
      )}

      {(sajuResult.local || sajuResult.reference) && (
        <div className="space-y-6">
          {sajuResult.local && sajuResult.localTenStars && (
            <div>
              <h3 className="mb-4 text-xl font-semibold text-blue-600">
                로컬 계산 (데이터베이스 기반)
              </h3>
              <SajuPillarsDisplay pillars={sajuResult.local} tenStars={sajuResult.localTenStars} />
            </div>
          )}
          {sajuResult.reference && sajuResult.referenceTenStars && (
            <div>
              <h3 className="mb-4 text-xl font-semibold text-green-600">Reference API 결과</h3>
              <SajuPillarsDisplay
                pillars={sajuResult.reference}
                tenStars={sajuResult.referenceTenStars}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
