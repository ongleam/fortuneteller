// 점순이 브랜드 토큰 — 조선 먹(ink)·한지(parchment)·낙관(seal) 아이덴티티.
// 정의 SSOT 는 docs/BRAND.md. 코드에서 쓰는 상수는 여기 한 곳에 모은다.

export const brandColors = {
  ink: "#241c12", // 먹 — 본문·제목
  sub: "#6b5638", // 옅은 먹 — 보조 문구
  seal: "#9c2b1f", // 낙관 붉은색 — 강조·주요 버튼
  gold: "#a8842c", // 금니 — 얇은 괘선·테두리
  paper: "#ebe0c8", // 한지 바탕
  paperCard: "#f4ecd8", // 한지 카드(살짝 밝게)
  line: "rgba(60,40,20,0.28)", // 먹 괘선
} as const;

export const brandFont = {
  brush: "'Nanum Brush Script', cursive", // 붓글씨 — 브랜드·큰 제목
  serif: "'Nanum Myeongjo', serif", // 명조 — 제목·본문
} as const;

// 한지(양피지) 질감 — 따뜻한 크림 바탕 + 은은한 얼룩.
export const parchmentStyle: React.CSSProperties = {
  backgroundColor: brandColors.paper,
  backgroundImage: [
    "radial-gradient(120% 80% at 15% 10%, rgba(150,110,60,0.10), transparent 55%)",
    "radial-gradient(120% 80% at 85% 20%, rgba(120,80,40,0.10), transparent 55%)",
    "radial-gradient(100% 60% at 50% 100%, rgba(80,50,20,0.14), transparent 60%)",
    "radial-gradient(60% 40% at 90% 90%, rgba(60,40,15,0.12), transparent 55%)",
  ].join(","),
};

// 오행(五行) — 한자·색·훈. 참고 명식의 색 상자 규칙.
export const OHAENG = [
  { han: "木", ko: "나무", border: "#2b4a7a" },
  { han: "火", ko: "불", border: brandColors.seal },
  { han: "土", ko: "흙", border: brandColors.gold },
  { han: "金", ko: "쇠", border: "#8a8a86" },
  { han: "水", ko: "물", border: "#2b2b2b" },
] as const;
