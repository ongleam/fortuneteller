"use client";

import { useState, useEffect } from "react";
import { calculateSajuAction } from "@/lib/interfaces/actions/debug";
import type {
  BirthInput,
  FourPillars,
  TenStars,
  FiveElements,
} from "@fortuneteller/saju/output-types";

// Custom hook for responsive detection
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  return isMobile;
}

// 오행에 따른 색상을 반환하는 헬퍼 함수
const getElementColor = (element: string | undefined): string => {
  switch (element) {
    case "목":
      return "bg-blue-500 text-white";
    case "화":
      return "bg-red-500 text-white";
    case "토":
      return "bg-yellow-500 text-white";
    case "금":
      return "bg-gray-400 text-white";
    case "수":
      return "bg-gray-800 text-white";
    default:
      return "bg-gray-200 text-black";
  }
};

// 5각형 오행 차트 컴포넌트
const FiveElementsPentagon = ({
  fiveElements,
  isMobile = false,
}: {
  fiveElements?: FiveElements;
  isMobile?: boolean;
}) => {
  if (!fiveElements) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border bg-gray-50 p-4 ${
          isMobile ? "h-64 w-full" : "h-80 w-72"
        }`}
      >
        <p className="text-gray-500">오행 데이터 로딩 중...</p>
      </div>
    );
  }

  const elements = [
    { name: "화", value: fiveElements.fire, color: "#ef4444", angle: 0 }, // 위쪽 (12시)
    { name: "토", value: fiveElements.earth, color: "#eab308", angle: 72 }, // 오른쪽 위 (2시)
    { name: "금", value: fiveElements.metal, color: "#9ca3af", angle: 144 }, // 오른쪽 아래 (4시)
    { name: "수", value: fiveElements.water, color: "#3b82f6", angle: 216 }, // 왼쪽 아래 (8시)
    { name: "목", value: fiveElements.wood, color: "#22c55e", angle: 288 }, // 왼쪽 위 (10시)
  ];

  const total = elements.reduce((sum, el) => sum + el.value, 0);
  const centerX = isMobile ? 120 : 130;
  const centerY = isMobile ? 100 : 140;
  const maxRadius = isMobile ? 60 : 80;

  // 5각형의 꼭짓점 계산
  const getPoint = (angle: number, radius: number) => {
    const radian = (angle - 90) * (Math.PI / 180); // -90도로 시작점을 위쪽으로
    return {
      x: centerX + radius * Math.cos(radian),
      y: centerY + radius * Math.sin(radian),
    };
  };

  // 데이터 기반 5각형 - 3을 최대값으로 사용하여 시각적 표현 개선
  const dataPoints = elements.map((el) => {
    // 3개를 최대값으로 하여 비율 계산 (예: 2/3 = 0.67, 3/3 = 1.0)
    // 3 이상인 경우도 최대 크기로 표시
    const ratio = Math.min(el.value / 3, 1);
    return getPoint(el.angle, maxRadius * Math.max(ratio, 0.1)); // 최소 10% 크기 보장
  });

  // 라벨 위치 (꼭짓점에서 조금 더 바깥쪽)
  const labelPoints = elements.map((el) => getPoint(el.angle, maxRadius + (isMobile ? 25 : 30)));

  const svgSize = isMobile ? { width: 240, height: 200 } : { width: 260, height: 280 };
  const viewBoxSize = isMobile ? "0 0 240 200" : "0 0 260 280";

  return (
    <div
      className={`flex flex-col items-center rounded-lg border bg-white p-3 ${
        isMobile ? "w-full" : "h-80 w-72"
      }`}
    >
      <h4 className={`mb-2 font-semibold text-gray-800 ${isMobile ? "text-base" : "text-lg"}`}>
        오행 분포
      </h4>

      <svg
        width={svgSize.width}
        height={svgSize.height}
        viewBox={viewBoxSize}
        className="flex-1"
        style={{ maxWidth: "100%", height: "auto" }}
      >
        {/* 배경 그리드 5각형들 */}
        {[0.3, 0.5, 0.7, 1.0].map((ratio, i) => (
          <polygon
            key={i}
            points={elements
              .map((el) => {
                const point = getPoint(el.angle, maxRadius * ratio);
                return `${point.x},${point.y}`;
              })
              .join(" ")}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
            opacity="0.4"
          />
        ))}

        {/* 중심에서 각 꼭짓점으로의 선 */}
        {elements.map((el, i) => {
          const point = getPoint(el.angle, maxRadius);
          return (
            <line
              key={i}
              x1={centerX}
              y1={centerY}
              x2={point.x}
              y2={point.y}
              stroke="#e5e7eb"
              strokeWidth="1"
              opacity="0.4"
            />
          );
        })}

        {/* 데이터 영역 */}
        <polygon
          points={dataPoints.map((point) => `${point.x},${point.y}`).join(" ")}
          fill="url(#pentagonGradient)"
          stroke="#8b5cf6"
          strokeWidth="2.5"
          opacity="0.8"
        />

        {/* 그라데이션 정의 */}
        <defs>
          <linearGradient id="pentagonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* 각 꼭짓점의 값 표시 점 */}
        {elements.map((el, i) => {
          const point = dataPoints[i];
          return (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="5"
              fill={el.color}
              stroke="white"
              strokeWidth="2"
            />
          );
        })}

        {/* 라벨 - 오행명과 점수만 표시 */}
        {elements.map((el, i) => {
          const point = labelPoints[i];
          const circleRadius = isMobile ? 16 : 20;
          return (
            <g key={i}>
              <circle cx={point.x} cy={point.y} r={circleRadius} fill={el.color} opacity="0.9" />
              <text
                x={point.x}
                y={point.y - (isMobile ? 2 : 3)}
                textAnchor="middle"
                className={`fill-white font-bold ${isMobile ? "text-xs" : "text-sm"}`}
              >
                {el.name}
              </text>
              <text
                x={point.x}
                y={point.y + (isMobile ? 8 : 10)}
                textAnchor="middle"
                className={`fill-white font-semibold ${isMobile ? "text-xs" : "text-xs"}`}
              >
                {el.value}
              </text>
            </g>
          );
        })}

        {/* 중심점 */}
        <circle cx={centerX} cy={centerY} r="4" fill="#6b7280" />
      </svg>

      {/* 총합 표시 */}
      <div className="mt-1 text-center text-sm text-gray-600">
        <span className="font-semibold">총합: {total}</span>
      </div>
    </div>
  );
};

// 오행 점수 표시 컴포넌트
const FiveElementsDisplay = ({ fiveElements }: { fiveElements?: FiveElements }) => {
  if (!fiveElements) {
    return (
      <div className="rounded-lg border bg-gray-50 p-6">
        <h4 className="mb-4 text-lg font-semibold text-gray-700">오행 분석</h4>
        <p className="text-gray-500">오행 데이터를 불러오는 중...</p>
      </div>
    );
  }

  const elements = [
    { key: "wood", name: "목", color: "bg-green-500", value: fiveElements.wood },
    { key: "fire", name: "화", color: "bg-red-500", value: fiveElements.fire },
    { key: "earth", name: "토", color: "bg-yellow-600", value: fiveElements.earth },
    { key: "metal", name: "금", color: "bg-gray-400", value: fiveElements.metal },
    { key: "water", name: "수", color: "bg-blue-500", value: fiveElements.water },
  ];

  const total = elements.reduce((sum, el) => sum + el.value, 0);
  const maxValue = Math.max(...elements.map((el) => el.value));

  return (
    <div className="rounded-lg border bg-white p-6 shadow-lg">
      <h4 className="mb-6 text-lg font-semibold text-gray-800">오행 분석</h4>

      <div className="space-y-4">
        {elements.map((element) => {
          const percentage = total > 0 ? (element.value / total) * 100 : 0;
          const barWidth = maxValue > 0 ? (element.value / maxValue) * 100 : 0;

          return (
            <div key={element.key} className="flex items-center space-x-4">
              {/* 오행 이름 */}
              <div className="w-8 text-center">
                <span className="text-lg font-bold text-gray-700">{element.name}</span>
              </div>

              {/* 진행 바 */}
              <div className="flex-1">
                <div className="relative h-8 overflow-hidden rounded-lg bg-gray-100">
                  <div
                    className={`h-full ${element.color} transition-all duration-300 ease-out`}
                    style={{ width: `${barWidth}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">{element.value}</span>
                  </div>
                </div>
              </div>

              {/* 백분율 */}
              <div className="w-16 text-right">
                <span className="text-sm text-gray-600">{percentage.toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 총합 */}
      <div className="mt-6 border-t pt-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-800">총합</span>
          <span className="text-lg font-bold text-purple-600">{total}</span>
        </div>
      </div>
    </div>
  );
};

// 사주 팔자 표시 컴포넌트
const SajuPillarsDisplay = ({
  pillars,
  tenStars,
  fiveElements,
  isMobile = false,
}: {
  pillars: FourPillars;
  tenStars?: TenStars;
  fiveElements?: FiveElements;
  isMobile?: boolean;
}) => {
  const pillarOrder: Array<{ key: keyof FourPillars; name: string }> = [
    { key: "time", name: "시주" },
    { key: "day", name: "일주" },
    { key: "month", name: "월주" },
    { key: "year", name: "년주" },
  ];

  const getHanjaSound = (hanja: string): string => {
    const hanjaMap: { [key: string]: string } = {
      甲: "갑",
      乙: "을",
      丙: "병",
      丁: "정",
      戊: "무",
      己: "기",
      庚: "경",
      辛: "신",
      壬: "임",
      癸: "계",
      子: "자",
      丑: "축",
      寅: "인",
      卯: "묘",
      辰: "진",
      巳: "사",
      午: "오",
      未: "미",
      申: "신",
      酉: "유",
      戌: "술",
      亥: "해",
    };
    return hanjaMap[hanja] || "";
  };

  // 천간 정보 조회 (로컬 구현)
  const getStemInfo = (chinese: string) => {
    const stems = [
      { chinese: "甲", korean: "갑", fiveElement: "목", fiveElementHanja: "木", yangYin: "양" },
      { chinese: "乙", korean: "을", fiveElement: "목", fiveElementHanja: "木", yangYin: "음" },
      { chinese: "丙", korean: "병", fiveElement: "화", fiveElementHanja: "火", yangYin: "양" },
      { chinese: "丁", korean: "정", fiveElement: "화", fiveElementHanja: "火", yangYin: "음" },
      { chinese: "戊", korean: "무", fiveElement: "토", fiveElementHanja: "土", yangYin: "양" },
      { chinese: "己", korean: "기", fiveElement: "토", fiveElementHanja: "土", yangYin: "음" },
      { chinese: "庚", korean: "경", fiveElement: "금", fiveElementHanja: "金", yangYin: "양" },
      { chinese: "辛", korean: "신", fiveElement: "금", fiveElementHanja: "金", yangYin: "음" },
      { chinese: "壬", korean: "임", fiveElement: "수", fiveElementHanja: "水", yangYin: "양" },
      { chinese: "癸", korean: "계", fiveElement: "수", fiveElementHanja: "水", yangYin: "음" },
    ];
    return stems.find((stem) => stem.chinese === chinese);
  };

  // 지지 정보 조회 (로컬 구현)
  const getBranchInfo = (chinese: string) => {
    const branches = [
      { chinese: "子", korean: "자", fiveElement: "수", fiveElementHanja: "水", yangYin: "양" },
      { chinese: "丑", korean: "축", fiveElement: "토", fiveElementHanja: "土", yangYin: "음" },
      { chinese: "寅", korean: "인", fiveElement: "목", fiveElementHanja: "木", yangYin: "양" },
      { chinese: "卯", korean: "묘", fiveElement: "목", fiveElementHanja: "木", yangYin: "음" },
      { chinese: "辰", korean: "진", fiveElement: "토", fiveElementHanja: "土", yangYin: "양" },
      { chinese: "巳", korean: "사", fiveElement: "화", fiveElementHanja: "火", yangYin: "음" },
      { chinese: "午", korean: "오", fiveElement: "화", fiveElementHanja: "火", yangYin: "양" },
      { chinese: "未", korean: "미", fiveElement: "토", fiveElementHanja: "土", yangYin: "음" },
      { chinese: "申", korean: "신", fiveElement: "금", fiveElementHanja: "金", yangYin: "양" },
      { chinese: "酉", korean: "유", fiveElement: "금", fiveElementHanja: "金", yangYin: "음" },
      { chinese: "戌", korean: "술", fiveElement: "토", fiveElementHanja: "土", yangYin: "양" },
      { chinese: "亥", korean: "해", fiveElement: "수", fiveElementHanja: "水", yangYin: "음" },
    ];
    return branches.find((branch) => branch.chinese === chinese);
  };

  // 십성 한글 이름 변환
  const getTenStarKorean = (tenStar: string | undefined): string => {
    if (!tenStar) return "-";
    const tenStarMap: { [key: string]: string } = {
      比肩: "비견",
      劫財: "겁재",
      食神: "식신",
      傷官: "상관",
      偏財: "편재",
      正財: "정재",
      偏官: "편관",
      正官: "정관",
      偏印: "편인",
      正印: "정인",
    };
    return tenStarMap[tenStar] || tenStar;
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* 모바일: 5각형 오행 차트 */}
        {fiveElements && <FiveElementsPentagon fiveElements={fiveElements} isMobile={isMobile} />}

        {/* 모바일: 사주팔자 테이블 */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h4 className="mb-4 text-center text-lg font-semibold text-gray-800">사주 팔자</h4>

          {/* 주차 이름 */}
          <div className="mb-3 grid grid-cols-4 gap-2 text-center text-xs text-gray-500">
            {pillarOrder.map((p) => (
              <div key={p.key} className="font-medium">
                {p.name}
              </div>
            ))}
          </div>

          {/* 천간 십성 */}
          <div className="mb-2 grid grid-cols-4 gap-2">
            {pillarOrder.map((p) => {
              const skyStar = tenStars?.[`${p.key}Sky` as keyof TenStars];
              return (
                <div key={p.key} className="rounded-lg bg-purple-50 p-2 text-center">
                  <div className="text-xs font-medium text-purple-700">
                    {skyStar ? getTenStarKorean(skyStar) : "–"}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 사주 팔자 메인 */}
          <div className="grid grid-cols-4 gap-2">
            {pillarOrder.map((p) => {
              const pillar = pillars[p.key];
              const stemInfo = getStemInfo(pillar.sky);
              const branchInfo = getBranchInfo(pillar.ground);

              return (
                <div key={p.key} className="space-y-1">
                  {/* 천간 */}
                  <div
                    className={`rounded-lg p-3 text-center shadow-sm ${getElementColor(stemInfo?.fiveElement)}`}
                  >
                    <div className="text-xs opacity-80">
                      {stemInfo?.fiveElementHanja} {stemInfo?.fiveElement}
                    </div>
                    <div className="text-2xl font-bold">{pillar.sky}</div>
                    <div className="text-xs opacity-90">{getHanjaSound(pillar.sky)}</div>
                  </div>
                  {/* 지지 */}
                  <div
                    className={`rounded-lg p-3 text-center shadow-sm ${getElementColor(branchInfo?.fiveElement)}`}
                  >
                    <div className="text-xs opacity-80">
                      {branchInfo?.fiveElementHanja} {branchInfo?.fiveElement}
                    </div>
                    <div className="text-2xl font-bold">{pillar.ground}</div>
                    <div className="text-xs opacity-90">{getHanjaSound(pillar.ground)}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 지지 십성 */}
          <div className="mt-2 grid grid-cols-4 gap-2">
            {pillarOrder.map((p) => {
              const groundStar = tenStars?.[`${p.key}Ground` as keyof TenStars];
              return (
                <div key={p.key} className="rounded-lg bg-blue-50 p-2 text-center">
                  <div className="text-xs font-medium text-blue-700">
                    {groundStar ? getTenStarKorean(groundStar) : "–"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 웹: 오각형과 테이블을 가로로 배치
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h4 className="mb-6 text-center text-xl font-semibold text-gray-800">사주 팔자 분석</h4>

      <div className="flex gap-8">
        {/* 왼쪽: 5각형 오행 차트 */}
        <div className="flex-shrink-0">
          {fiveElements && <FiveElementsPentagon fiveElements={fiveElements} isMobile={false} />}
        </div>

        {/* 오른쪽: 사주팔자 테이블 */}
        <div className="flex-1">
          <h5 className="mb-4 text-center text-lg font-semibold text-gray-700">사주 팔자</h5>

          {/* 주차 이름 */}
          <div className="mb-3 grid grid-cols-4 gap-3 text-center text-sm text-gray-500">
            {pillarOrder.map((p) => (
              <div key={p.key} className="font-medium">
                {p.name}
              </div>
            ))}
          </div>

          {/* 천간 십성 */}
          <div className="mb-3 grid grid-cols-4 gap-3">
            {pillarOrder.map((p) => {
              const skyStar = tenStars?.[`${p.key}Sky` as keyof TenStars];
              return (
                <div key={p.key} className="rounded-lg bg-purple-50 p-2 text-center">
                  <div className="text-xs font-medium text-purple-700">
                    {skyStar ? getTenStarKorean(skyStar) : "–"}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 사주 팔자 메인 */}
          <div className="grid grid-cols-4 gap-3">
            {pillarOrder.map((p) => {
              const pillar = pillars[p.key];
              const stemInfo = getStemInfo(pillar.sky);
              const branchInfo = getBranchInfo(pillar.ground);

              return (
                <div key={p.key} className="space-y-2">
                  {/* 천간 */}
                  <div
                    className={`rounded-lg p-4 text-center shadow-sm ${getElementColor(stemInfo?.fiveElement)}`}
                  >
                    <div className="text-xs opacity-80">
                      {stemInfo?.fiveElementHanja} {stemInfo?.fiveElement}
                    </div>
                    <div className="text-3xl font-bold">{pillar.sky}</div>
                    <div className="text-sm opacity-90">{getHanjaSound(pillar.sky)}</div>
                  </div>
                  {/* 지지 */}
                  <div
                    className={`rounded-lg p-4 text-center shadow-sm ${getElementColor(branchInfo?.fiveElement)}`}
                  >
                    <div className="text-xs opacity-80">
                      {branchInfo?.fiveElementHanja} {branchInfo?.fiveElement}
                    </div>
                    <div className="text-3xl font-bold">{pillar.ground}</div>
                    <div className="text-sm opacity-90">{getHanjaSound(pillar.ground)}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 지지 십성 */}
          <div className="mt-3 grid grid-cols-4 gap-3">
            {pillarOrder.map((p) => {
              const groundStar = tenStars?.[`${p.key}Ground` as keyof TenStars];
              return (
                <div key={p.key} className="rounded-lg bg-blue-50 p-2 text-center">
                  <div className="text-xs font-medium text-blue-700">
                    {groundStar ? getTenStarKorean(groundStar) : "–"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DebugPage() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<"local" | "reference">("local");
  const [birthInput, setBirthInput] = useState<BirthInput>({
    name: "테스트",
    gender: "남성",
    calendar: "양력",
    year: "1995",
    month: "4",
    day: "25",
    hour: "10",
    minute: "30",
  });

  const [sajuResult, setSajuResult] = useState<{
    local?: FourPillars;
    reference?: FourPillars;
    localTenStars?: TenStars;
    referenceTenStars?: TenStars;
    localFiveElements?: FiveElements;
    referenceFiveElements?: FiveElements;
    error?: string;
    loading?: boolean;
  }>({});

  const calculateSaju = async () => {
    setSajuResult({ loading: true });

    try {
      const result = await calculateSajuAction(birthInput);

      console.log("[CLIENT] Received result:", result);
      console.log("[CLIENT] localTenStars:", result.localTenStars);
      console.log("[CLIENT] referenceTenStars:", result.referenceTenStars);
      console.log("[CLIENT] localFiveElements:", result.localFiveElements);
      console.log("[CLIENT] referenceFiveElements:", result.referenceFiveElements);

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

  const handleTimeChange = (value: string) => {
    const [hour, minute] = value.split(":");
    setBirthInput((prev) => ({ ...prev, hour, minute: minute || "0" }));
  };

  return (
    <div className={`container mx-auto p-4 ${isMobile ? "max-w-md" : "max-w-6xl"}`}>
      <div className="mb-6 text-center">
        <h1 className={`font-bold text-gray-900 ${isMobile ? "text-2xl" : "text-3xl"}`}>
          사주 팔자
        </h1>
        {!isMobile && <p className="mt-1 text-sm text-gray-600">생년월일로 운명을 확인하세요</p>}
      </div>

      {/* 입력 폼 */}
      <div
        className={`mb-6 rounded-xl bg-white p-5 shadow-sm ${isMobile ? "" : "md:mx-auto md:max-w-4xl"}`}
      >
        <h2 className="mb-4 text-lg font-semibold text-purple-600">생년월일 입력</h2>

        <div className={`${isMobile ? "space-y-4" : "grid gap-4 md:grid-cols-3"}`}>
          {/* 기본 정보 */}
          <div className="space-y-4">
            <div className={isMobile ? "grid grid-cols-2 gap-3" : ""}>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">이름</label>
                <input
                  type="text"
                  value={birthInput.name}
                  onChange={(e) => setBirthInput((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="이름"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">성별</label>
                <select
                  value={birthInput.gender}
                  onChange={(e) =>
                    setBirthInput((prev) => ({
                      ...prev,
                      gender: e.target.value as "남성" | "여성",
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="남성">남성</option>
                  <option value="여성">여성</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">달력</label>
              <div className="flex rounded-lg border border-gray-300 p-1">
                {(["양력", "음력"] as const).map((calendar) => (
                  <button
                    key={calendar}
                    onClick={() => setBirthInput((prev) => ({ ...prev, calendar }))}
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      birthInput.calendar === calendar
                        ? "bg-purple-500 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {calendar}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 생년월일 */}
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">년</label>
                <input
                  type="number"
                  value={birthInput.year}
                  onChange={(e) => setBirthInput((prev) => ({ ...prev, year: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="25"
                  min="1"
                  max="31"
                />
              </div>
            </div>
          </div>

          {/* 생시 */}
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">생시</label>
              <select
                value={`${birthInput.hour}:${birthInput.minute}`}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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

            <button
              onClick={calculateSaju}
              disabled={sajuResult.loading}
              className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-semibold text-white shadow-md transition-all hover:shadow-lg active:scale-95 disabled:opacity-50"
            >
              {sajuResult.loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>계산 중...</span>
                </div>
              ) : (
                "사주 팔자 확인하기"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 오류 메시지 */}
      {sajuResult.error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <h3 className="mb-2 font-semibold text-red-800">오류가 발생했습니다</h3>
          <p className="text-sm text-red-600">{sajuResult.error}</p>
        </div>
      )}

      {/* 결과 표시 */}
      {(sajuResult.local || sajuResult.reference) && (
        <div>
          {/* 탭 네비게이션 */}
          {sajuResult.local && sajuResult.reference && (
            <div
              className={`mb-4 flex rounded-xl bg-white p-1 shadow-sm ${
                isMobile ? "" : "md:mx-auto md:max-w-md"
              }`}
            >
              {(
                [
                  { key: "local", label: "로컬 계산", color: "blue" },
                  { key: "reference", label: "Reference API", color: "green" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? tab.color === "blue"
                        ? "bg-blue-500 text-white"
                        : "bg-green-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* 결과 컨텐츠 */}
          {activeTab === "local" && sajuResult.local && (
            <div>
              <div className="mb-3 text-center">
                <h3 className="text-lg font-semibold text-blue-600">로컬 계산 결과</h3>
                <p className="text-xs text-gray-500">데이터베이스 기반</p>
              </div>
              <SajuPillarsDisplay
                pillars={sajuResult.local}
                tenStars={sajuResult.localTenStars}
                fiveElements={sajuResult.localFiveElements}
                isMobile={isMobile}
              />
              {!sajuResult.localTenStars && (
                <div className="mt-3 rounded-lg bg-orange-50 p-3 text-center">
                  <p className="text-sm text-orange-600">⚠️ 십성 계산에 실패했습니다</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "reference" && sajuResult.reference && (
            <div>
              <div className="mb-3 text-center">
                <h3 className="text-lg font-semibold text-green-600">Reference API 결과</h3>
                <p className="text-xs text-gray-500">외부 API 기반</p>
              </div>
              <SajuPillarsDisplay
                pillars={sajuResult.reference}
                tenStars={sajuResult.referenceTenStars}
                fiveElements={sajuResult.referenceFiveElements}
                isMobile={isMobile}
              />
              {!sajuResult.referenceTenStars && (
                <div className="mt-3 rounded-lg bg-orange-50 p-3 text-center">
                  <p className="text-sm text-orange-600">⚠️ 십성 계산에 실패했습니다</p>
                </div>
              )}
            </div>
          )}

          {/* 단일 결과 표시 (탭이 없는 경우) */}
          {sajuResult.local && !sajuResult.reference && (
            <div>
              <div className="mb-3 text-center">
                <h3 className="text-lg font-semibold text-blue-600">사주 팔자 결과</h3>
              </div>
              <SajuPillarsDisplay
                pillars={sajuResult.local}
                tenStars={sajuResult.localTenStars}
                fiveElements={sajuResult.localFiveElements}
                isMobile={isMobile}
              />
            </div>
          )}

          {!sajuResult.local && sajuResult.reference && (
            <div>
              <div className="mb-3 text-center">
                <h3 className="text-lg font-semibold text-green-600">사주 팔자 결과</h3>
              </div>
              <SajuPillarsDisplay
                pillars={sajuResult.reference}
                tenStars={sajuResult.referenceTenStars}
                fiveElements={sajuResult.referenceFiveElements}
                isMobile={isMobile}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
