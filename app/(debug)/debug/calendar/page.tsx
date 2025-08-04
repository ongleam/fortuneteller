'use client';

import { useState } from 'react';
import { convertSolarToLunarAction, convertLunarToSolarAction } from '@/lib/interfaces/actions/calendar';

export default function CalendarConverterPage() {
  // 양력 → 음력 변환
  const [solarInput, setSolarInput] = useState({
    year: '1995',
    month: '4',
    day: '25'
  });

  // 음력 → 양력 변환
  const [lunarInput, setLunarInput] = useState({
    year: '1995',
    month: '3',
    day: '26',
    isLeapMonth: false
  });

  const [solarResult, setSolarResult] = useState<{
    year: number;
    month: number;
    day: number;
    isLeapMonth: boolean;
  } | null>(null);

  const [lunarResult, setLunarResult] = useState<{
    year: number;
    month: number;
    day: number;
  } | null>(null);

  const [solarError, setSolarError] = useState<string>('');
  const [lunarError, setLunarError] = useState<string>('');

  // 양력 → 음력 변환
  const convertSolarToLunar = async () => {
    setSolarError('');
    setSolarResult(null);

    try {
      const year = parseInt(solarInput.year);
      const month = parseInt(solarInput.month);
      const day = parseInt(solarInput.day);

      if (year < 1900 || year > 2040) {
        setSolarError('년도는 1900-2040 범위에서 입력해주세요.');
        return;
      }

      if (month < 1 || month > 12) {
        setSolarError('월은 1-12 범위에서 입력해주세요.');
        return;
      }

      if (day < 1 || day > 31) {
        setSolarError('일은 1-31 범위에서 입력해주세요.');
        return;
      }

      const result = await convertSolarToLunarAction(year, month, day);

      if (result) {
        setSolarResult(result);
      } else {
        setSolarError('변환할 수 없는 날짜입니다. 입력값을 확인해주세요.');
      }
    } catch (error) {
      setSolarError('변환 중 오류가 발생했습니다.');
    }
  };

  // 음력 → 양력 변환
  const convertLunarToSolar = async () => {
    setLunarError('');
    setLunarResult(null);

    try {
      const year = parseInt(lunarInput.year);
      const month = parseInt(lunarInput.month);
      const day = parseInt(lunarInput.day);

      if (year < 1900 || year > 2040) {
        setLunarError('년도는 1900-2040 범위에서 입력해주세요.');
        return;
      }

      if (month < 1 || month > 12) {
        setLunarError('월은 1-12 범위에서 입력해주세요.');
        return;
      }

      if (day < 1 || day > 30) {
        setLunarError('일은 1-30 범위에서 입력해주세요.');
        return;
      }

      const result = await convertLunarToSolarAction(year, month, day, lunarInput.isLeapMonth);

      if (result) {
        setLunarResult(result);
      } else {
        setLunarError('변환할 수 없는 날짜입니다. 입력값을 확인해주세요.');
      }
    } catch (error) {
      setLunarError('변환 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="container mx-auto max-w-6xl p-6">
      <h1 className="mb-8 text-center text-3xl font-bold">양력/음력 변환 계산기</h1>
      
      <div className="grid gap-8 lg:grid-cols-2">
        {/* 양력 → 음력 변환 */}
        <div className="rounded-lg border bg-white p-6 shadow-lg">
          <h2 className="mb-6 text-xl font-semibold text-blue-600">양력 → 음력 변환</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium">년도</label>
                <input
                  type="number"
                  value={solarInput.year}
                  onChange={(e) => setSolarInput(prev => ({ ...prev, year: e.target.value }))}
                  className="w-full rounded-md border px-3 py-2"
                  min="1900"
                  max="2040"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">월</label>
                <input
                  type="number"
                  value={solarInput.month}
                  onChange={(e) => setSolarInput(prev => ({ ...prev, month: e.target.value }))}
                  className="w-full rounded-md border px-3 py-2"
                  min="1"
                  max="12"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">일</label>
                <input
                  type="number"
                  value={solarInput.day}
                  onChange={(e) => setSolarInput(prev => ({ ...prev, day: e.target.value }))}
                  className="w-full rounded-md border px-3 py-2"
                  min="1"
                  max="31"
                />
              </div>
            </div>
            
            <button
              onClick={convertSolarToLunar}
              className="w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              양력 → 음력 변환
            </button>
            
            {solarError && (
              <div className="rounded-md bg-red-50 p-3 text-red-600 text-sm">
                {solarError}
              </div>
            )}
            
            {solarResult && (
              <div className="rounded-md bg-blue-50 p-4">
                <h3 className="mb-2 font-semibold text-blue-800">변환 결과</h3>
                <div className="text-lg font-bold text-blue-900">
                  음력 {solarResult.year}년 {solarResult.month}월 {solarResult.day}일
                  {solarResult.isLeapMonth && ' (윤달)'}
                </div>
                <div className="mt-2 text-sm text-blue-700">
                  입력: 양력 {solarInput.year}년 {solarInput.month}월 {solarInput.day}일
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 음력 → 양력 변환 */}
        <div className="rounded-lg border bg-white p-6 shadow-lg">
          <h2 className="mb-6 text-xl font-semibold text-green-600">음력 → 양력 변환</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium">년도</label>
                <input
                  type="number"
                  value={lunarInput.year}
                  onChange={(e) => setLunarInput(prev => ({ ...prev, year: e.target.value }))}
                  className="w-full rounded-md border px-3 py-2"
                  min="1900"
                  max="2040"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">월</label>
                <input
                  type="number"
                  value={lunarInput.month}
                  onChange={(e) => setLunarInput(prev => ({ ...prev, month: e.target.value }))}
                  className="w-full rounded-md border px-3 py-2"
                  min="1"
                  max="12"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">일</label>
                <input
                  type="number"
                  value={lunarInput.day}
                  onChange={(e) => setLunarInput(prev => ({ ...prev, day: e.target.value }))}
                  className="w-full rounded-md border px-3 py-2"
                  min="1"
                  max="30"
                />
              </div>
            </div>
            
            <div>
              <label className="mb-2 flex items-center">
                <input
                  type="checkbox"
                  checked={lunarInput.isLeapMonth}
                  onChange={(e) => setLunarInput(prev => ({ ...prev, isLeapMonth: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm font-medium">윤달</span>
              </label>
            </div>
            
            <button
              onClick={convertLunarToSolar}
              className="w-full rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600"
            >
              음력 → 양력 변환
            </button>
            
            {lunarError && (
              <div className="rounded-md bg-red-50 p-3 text-red-600 text-sm">
                {lunarError}
              </div>
            )}
            
            {lunarResult && (
              <div className="rounded-md bg-green-50 p-4">
                <h3 className="mb-2 font-semibold text-green-800">변환 결과</h3>
                <div className="text-lg font-bold text-green-900">
                  양력 {lunarResult.year}년 {lunarResult.month}월 {lunarResult.day}일
                </div>
                <div className="mt-2 text-sm text-green-700">
                  입력: 음력 {lunarInput.year}년 {lunarInput.month}월 {lunarInput.day}일
                  {lunarInput.isLeapMonth && ' (윤달)'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 양방향 변환 결과 비교 */}
      {solarResult && lunarResult && (
        <div className="mt-8 rounded-lg border bg-white p-6 shadow-lg">
          <h3 className="mb-4 text-xl font-semibold text-purple-600">변환 결과 비교</h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg bg-blue-50 p-4">
              <h4 className="font-semibold text-blue-800">양력 → 음력</h4>
              <p className="text-sm text-gray-700">
                양력 {solarInput.year}.{solarInput.month}.{solarInput.day}
              </p>
              <p className="text-lg font-bold text-blue-900">
                ↓
              </p>
              <p className="text-lg font-bold text-blue-900">
                음력 {solarResult.year}.{solarResult.month}.{solarResult.day}
                {solarResult.isLeapMonth && ' (윤달)'}
              </p>
            </div>
            
            <div className="rounded-lg bg-green-50 p-4">
              <h4 className="font-semibold text-green-800">음력 → 양력</h4>
              <p className="text-sm text-gray-700">
                음력 {lunarInput.year}.{lunarInput.month}.{lunarInput.day}
                {lunarInput.isLeapMonth && ' (윤달)'}
              </p>
              <p className="text-lg font-bold text-green-900">
                ↓
              </p>
              <p className="text-lg font-bold text-green-900">
                양력 {lunarResult.year}.{lunarResult.month}.{lunarResult.day}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 사용 안내 */}
      <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="mb-3 text-lg font-semibold text-gray-800">사용 안내</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>• 양력(그레고리력)과 음력(농력) 날짜를 상호 변환합니다.</p>
          <p>• 지원 범위: 1900년 ~ 2040년</p>
          <p>• 음력 날짜에는 윤달 옵션이 있습니다.</p>
          <p>• 예시: 양력 1995년 4월 25일 = 음력 1995년 3월 26일</p>
        </div>
      </div>
    </div>
  );
}