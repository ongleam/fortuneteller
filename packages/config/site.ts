import { Metadata } from "next";

export const siteConfig = {
  name: "점순이 | 사주 궁합으로 만나는 소개팅",
  description:
    "점순이는 사주팔자 궁합으로 인연을 이어주는 소개팅 서비스입니다. 오행·십성 기반 궁합 점수로 나와 잘 맞는 상대를 추천받고, 서로 좋아요를 누르면 매칭됩니다. 프로필만 등록하면 궁합 순으로 정렬된 추천을 만나보세요.",
  urls: {
    production: "https://ongleam-fortuneteller.vercel.app",
    development: "https://ongleam-fortuneteller.vercel.app",
    local: "http://localhost:3000",
  },
  keywords: [
    "점순이",
    "사주 소개팅",
    "사주 궁합",
    "궁합",
    "소개팅",
    "매칭",
    "인연",
    "오행 궁합",
    "십성",
    "일간 궁합",
    "궁합 점수",
    "사주팔자",
    "데이팅",
    "소개팅 앱",
    "만남",
    "이상형",
    "AI 궁합",
    "무료 궁합",
    "온라인 소개팅",
  ],
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
  },
  privacyPolicy: {
    url: "https://ongleam.notion.site/2220ab7fb18f80fba5c8e0ba61ea3910",
  },
  termsOfService: {
    url: "https://ongleam.notion.site/2220ab7fb18f80b08c5bd0513d561396",
  },
  version: "1.0.0",
};

const siteOpenGraph = {
  title: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.urls.production,
  images: [
    {
      url: `${siteConfig.urls.production}/images/jeomsuni-og-image.png`,
    },
  ],
  locale: "ko_KR",
  type: "website",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.urls.production),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: siteConfig.icons,
  keywords: siteConfig.keywords,
  openGraph: siteOpenGraph,
};
