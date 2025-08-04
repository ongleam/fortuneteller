'use client';

import { useState } from 'react';
import { calculateSajuAction } from '@/lib/interfaces/actions/debug';
import type { BirthInput, SajuPillars } from '@/lib/shared/types/saju';

export default function DebugPage() {
  const [birthInput, setBirthInput] = useState<BirthInput>({
    name: '테스트',
    gender: '남성',
    calendar: '양력',
    year: '1995',
    month: '4',
    day: '25',
    hour: '14',
  });

  const [sajuResult, setSajuResult] = useState<{
    local?: SajuPillars;
    reference?: SajuPillars;
    error?: string;
    loading?: boolean;
  }>({});

  const calculateSaju = async () => {
    setSajuResult({ loading: true });

    try {
      const result = await calculateSajuAction(birthInput);

      setSajuResult({
        ...result,
        loading: false,
      });
    } catch (error) {
      setSajuResult({
        error: (error as Error).message,
        loading: false,
      });
    }
  };

  const formatPillar = (pillar: { stem: string; branch: string }) => {
    return `${pillar.stem}${pillar.branch}`;
  };

  // 한자의 음(音) 매핑
  const getHanjaSound = (hanja: string): string => {
    const hanjaMap: { [key: string]: string } = {
      // 천간
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
      // 지지
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

  const formatPillars = (pillars: SajuPillars) => {
    return `${formatPillar(pillars.year)} ${formatPillar(pillars.month)} ${formatPillar(pillars.day)} ${formatPillar(pillars.time)}`;
  };

  return (
    <div className="container mx-auto max-w-6xl p-6">
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
                value={birthInput.hour}
                onChange={(e) => setBirthInput((prev) => ({ ...prev, hour: e.target.value }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="00">00시 (자시 00:00 ~ 01:29)</option>
                <option value="02">02시 (축시 01:30 ~ 03:29)</option>
                <option value="04">04시 (인시 03:30 ~ 05:29)</option>
                <option value="06">06시 (묘시 05:30 ~ 07:29)</option>
                <option value="08">08시 (진시 07:30 ~ 09:29)</option>
                <option value="10">10시 (사시 09:30 ~ 11:29)</option>
                <option value="12">12시 (오시 11:30 ~ 13:29)</option>
                <option value="14">14시 (미시 13:30 ~ 15:29)</option>
                <option value="16">16시 (신시 15:30 ~ 17:29)</option>
                <option value="18">18시 (유시 17:30 ~ 19:29)</option>
                <option value="20">20시 (술시 19:30 ~ 21:29)</option>
                <option value="22">22시 (해시 21:30 ~ 23:29)</option>
                <option value="24">24시 (자시 23:30 ~ 24:00)</option>
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
          {/* 사주 팔자 결과 */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* 로컬 계산 결과 */}
            {sajuResult.local && (
              <div className="rounded-lg border bg-white p-6 shadow-lg">
                <h3 className="mb-4 text-xl font-semibold text-blue-600">
                  로컬 계산 (데이터베이스 기반)
                </h3>

                <div className="space-y-4">
                  <div className="text-center">
                    <div className="mb-2 text-2xl font-bold text-gray-800">
                      {formatPillars(sajuResult.local)}
                    </div>
                    <div className="text-sm text-gray-600">년주 월주 일주 시주</div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="rounded bg-blue-50 p-3">
                      <div className="font-semibold text-blue-800">년주</div>
                      <div className="mt-1 text-lg font-bold">
                        {formatPillar(sajuResult.local.year)}
                      </div>
                      <div className="mt-1 text-xs text-gray-600">
                        ({getHanjaSound(sajuResult.local.year.stem)}
                        {getHanjaSound(sajuResult.local.year.branch)})
                      </div>
                    </div>

                    <div className="rounded bg-green-50 p-3">
                      <div className="font-semibold text-green-800">월주</div>
                      <div className="mt-1 text-lg font-bold">
                        {formatPillar(sajuResult.local.month)}
                      </div>
                      <div className="mt-1 text-xs text-gray-600">
                        ({getHanjaSound(sajuResult.local.month.stem)}
                        {getHanjaSound(sajuResult.local.month.branch)})
                      </div>
                    </div>

                    <div className="rounded bg-yellow-50 p-3">
                      <div className="font-semibold text-yellow-800">일주</div>
                      <div className="mt-1 text-lg font-bold">
                        {formatPillar(sajuResult.local.day)}
                      </div>
                      <div className="mt-1 text-xs text-gray-600">
                        ({getHanjaSound(sajuResult.local.day.stem)}
                        {getHanjaSound(sajuResult.local.day.branch)})
                      </div>
                    </div>

                    <div className="rounded bg-purple-50 p-3">
                      <div className="font-semibold text-purple-800">시주</div>
                      <div className="mt-1 text-lg font-bold">
                        {formatPillar(sajuResult.local.time)}
                      </div>
                      <div className="mt-1 text-xs text-gray-600">
                        ({getHanjaSound(sajuResult.local.time.stem)}
                        {getHanjaSound(sajuResult.local.time.branch)})
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reference API 결과 */}
            {sajuResult.reference && (
              <div className="rounded-lg border bg-white p-6 shadow-lg">
                <h3 className="mb-4 text-xl font-semibold text-green-600">Reference API 결과</h3>

                <div className="space-y-4">
                  <div className="text-center">
                    <div className="mb-2 text-2xl font-bold text-gray-800">
                      {formatPillars(sajuResult.reference)}
                    </div>
                    <div className="text-sm text-gray-600">년주 월주 일주 시주</div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="rounded bg-blue-50 p-3">
                      <div className="font-semibold text-blue-800">년주</div>
                      <div className="mt-1 text-lg font-bold">
                        {formatPillar(sajuResult.reference.year)}
                      </div>
                      <div className="mt-1 text-xs text-gray-600">
                        ({getHanjaSound(sajuResult.reference.year.stem)}
                        {getHanjaSound(sajuResult.reference.year.branch)})
                      </div>
                    </div>

                    <div className="rounded bg-green-50 p-3">
                      <div className="font-semibold text-green-800">월주</div>
                      <div className="mt-1 text-lg font-bold">
                        {formatPillar(sajuResult.reference.month)}
                      </div>
                      <div className="mt-1 text-xs text-gray-600">
                        ({getHanjaSound(sajuResult.reference.month.stem)}
                        {getHanjaSound(sajuResult.reference.month.branch)})
                      </div>
                    </div>

                    <div className="rounded bg-yellow-50 p-3">
                      <div className="font-semibold text-yellow-800">일주</div>
                      <div className="mt-1 text-lg font-bold">
                        {formatPillar(sajuResult.reference.day)}
                      </div>
                      <div className="mt-1 text-xs text-gray-600">
                        ({getHanjaSound(sajuResult.reference.day.stem)}
                        {getHanjaSound(sajuResult.reference.day.branch)})
                      </div>
                    </div>

                    <div className="rounded bg-purple-50 p-3">
                      <div className="font-semibold text-purple-800">시주</div>
                      <div className="mt-1 text-lg font-bold">
                        {formatPillar(sajuResult.reference.time)}
                      </div>
                      <div className="mt-1 text-xs text-gray-600">
                        ({getHanjaSound(sajuResult.reference.time.stem)}
                        {getHanjaSound(sajuResult.reference.time.branch)})
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 비교 결과 */}
          {sajuResult.local && sajuResult.reference && (
            <div className="rounded-lg border bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-xl font-semibold text-orange-600">계산 결과 비교</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left">항목</th>
                      <th className="py-2 text-center">로컬 계산</th>
                      <th className="py-2 text-center">Reference API</th>
                      <th className="py-2 text-center">일치 여부</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 font-medium">년주</td>
                      <td className="py-2 text-center">{formatPillar(sajuResult.local.year)}</td>
                      <td className="py-2 text-center">
                        {formatPillar(sajuResult.reference.year)}
                      </td>
                      <td className="py-2 text-center">
                        <span
                          className={`rounded px-2 py-1 text-xs ${
                            formatPillar(sajuResult.local.year) ===
                            formatPillar(sajuResult.reference.year)
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {formatPillar(sajuResult.local.year) ===
                          formatPillar(sajuResult.reference.year)
                            ? '일치'
                            : '불일치'}
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium">월주</td>
                      <td className="py-2 text-center">{formatPillar(sajuResult.local.month)}</td>
                      <td className="py-2 text-center">
                        {formatPillar(sajuResult.reference.month)}
                      </td>
                      <td className="py-2 text-center">
                        <span
                          className={`rounded px-2 py-1 text-xs ${
                            formatPillar(sajuResult.local.month) ===
                            formatPillar(sajuResult.reference.month)
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {formatPillar(sajuResult.local.month) ===
                          formatPillar(sajuResult.reference.month)
                            ? '일치'
                            : '불일치'}
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium">일주</td>
                      <td className="py-2 text-center">{formatPillar(sajuResult.local.day)}</td>
                      <td className="py-2 text-center">{formatPillar(sajuResult.reference.day)}</td>
                      <td className="py-2 text-center">
                        <span
                          className={`rounded px-2 py-1 text-xs ${
                            formatPillar(sajuResult.local.day) ===
                            formatPillar(sajuResult.reference.day)
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {formatPillar(sajuResult.local.day) ===
                          formatPillar(sajuResult.reference.day)
                            ? '일치'
                            : '불일치'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium">시주</td>
                      <td className="py-2 text-center">{formatPillar(sajuResult.local.time)}</td>
                      <td className="py-2 text-center">
                        {formatPillar(sajuResult.reference.time)}
                      </td>
                      <td className="py-2 text-center">
                        <span
                          className={`rounded px-2 py-1 text-xs ${
                            formatPillar(sajuResult.local.time) ===
                            formatPillar(sajuResult.reference.time)
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {formatPillar(sajuResult.local.time) ===
                          formatPillar(sajuResult.reference.time)
                            ? '일치'
                            : '불일치'}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 입력 정보 요약 */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h3 className="mb-3 text-lg font-semibold text-gray-800">입력 정보</h3>
            <div className="grid gap-2 text-sm md:grid-cols-2">
              <div>
                <span className="font-medium">이름:</span> {birthInput.name}
              </div>
              <div>
                <span className="font-medium">성별:</span> {birthInput.gender}
              </div>
              <div>
                <span className="font-medium">양력/음력:</span> {birthInput.calendar}
              </div>
              <div>
                <span className="font-medium">생년월일:</span> {birthInput.year}년{' '}
                {birthInput.month}월 {birthInput.day}일
              </div>
              <div>
                <span className="font-medium">생시:</span> {birthInput.hour}시
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 사용 예시 */}
      <div className="mt-8 rounded-lg border border-yellow-200 bg-yellow-50 p-6">
        <h3 className="mb-3 text-lg font-semibold text-yellow-800">사용 예시</h3>
        <div className="grid gap-4 text-sm md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-medium text-yellow-700">테스트 데이터</h4>
            <ul className="space-y-1 text-yellow-800">
              <li>• 1995년 4월 25일 14시 (오후 2시)</li>
              <li>• 양력/음력 선택 가능</li>
              <li>• 남성/여성 구분</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 font-medium text-yellow-700">결과 확인</h4>
            <ul className="space-y-1 text-yellow-800">
              <li>• 년주, 월주, 일주, 시주 각각 표시</li>
              <li>• 로컬 계산 vs Reference API 비교</li>
              <li>• 일치/불일치 여부 확인</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
