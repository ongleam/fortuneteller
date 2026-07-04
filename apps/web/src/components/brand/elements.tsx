// 점순이 브랜드 공용 요소 — 낙관 도장·붓 밑줄·폰트 링크·한지 래퍼·섹션 제목.
// 순수 프레젠테이션(훅 없음) → 서버/클라이언트 컴포넌트 어디서나 import 가능.
import type { ReactNode } from "react";
import { brandColors, brandFont, parchmentStyle, OHAENG } from "./theme";

/** 한글 붓글씨·명조 웹폰트 로드. React 가 <head> 로 hoist·dedupe. */
export function FontLinks() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Nanum+Brush+Script&family=Nanum+Myeongjo:wght@400;700;800&display=swap"
      />
    </>
  );
}

/** 낙관(도장) — 붉은 사각 테두리에 한자. */
export function Seal({ char = "緣", size = 44 }: { char?: string; size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-[6px] font-bold"
      style={{
        width: size,
        height: size,
        border: `2.5px solid ${brandColors.seal}`,
        color: brandColors.seal,
        fontSize: size * 0.5,
        transform: "rotate(-4deg)",
        boxShadow: "inset 0 0 0 1px rgba(156,43,31,0.25)",
        backgroundColor: "rgba(156,43,31,0.05)",
      }}
    >
      {char}
    </span>
  );
}

/** 붓으로 그은 듯한 거친 밑줄. */
export function BrushRule({
  color = brandColors.ink,
  className = "",
}: {
  color?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 240 14"
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
      role="presentation"
    >
      <path
        d="M3 8 C 45 3 80 11 120 6 C 160 2 200 10 236 5 L 234 9 C 198 13 160 6 120 10 C 82 13 46 7 5 12 Z"
        fill={color}
      />
    </svg>
  );
}

/** 브랜드 워드마크(도장 + 붓글씨 점순이). */
export function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2">
      <Seal char="占" size={size * 1.05} />
      <span
        style={{
          fontFamily: brandFont.brush,
          fontSize: size,
          lineHeight: 1,
          color: brandColors.ink,
        }}
      >
        점순이
      </span>
    </span>
  );
}

/** 섹션 제목 + 붓 밑줄. */
export function SectionTitle({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`text-center ${className}`}>
      <h2 className="text-3xl font-extrabold" style={{ color: brandColors.ink }}>
        {children}
      </h2>
      <div className="mx-auto mt-3 h-3 w-40">
        <BrushRule color={brandColors.ink} className="h-full w-full" />
      </div>
    </div>
  );
}

/** 오행 장식 띠. */
export function OhaengRow() {
  return (
    <div className="mx-auto flex max-w-md items-center justify-center gap-3">
      {OHAENG.map((o) => (
        <div key={o.han} className="text-center">
          <div
            className="flex h-12 w-12 items-center justify-center bg-[#f6efdd] text-2xl font-bold"
            style={{ border: `2px solid ${o.border}`, color: brandColors.ink }}
          >
            {o.han}
          </div>
          <span className="mt-1 block text-xs" style={{ color: brandColors.sub }}>
            {o.ko}
          </span>
        </div>
      ))}
    </div>
  );
}

/** 한지 배경 + 가장자리 그을림 + 브랜드 폰트를 입힌 페이지 껍데기. */
export function ParchmentShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative min-h-screen"
      style={{ ...parchmentStyle, color: brandColors.ink, fontFamily: brandFont.serif }}
    >
      <FontLinks />
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ boxShadow: "inset 0 0 220px rgba(50,30,10,0.4)" }}
        aria-hidden="true"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
