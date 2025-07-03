import { Metadata } from 'next';

export const siteConfig = {
  name: '점순이 | 당신의 운명을 알려드리는 AI 점술사',
  description:
    '신비로운 AI 점술사 점순이와 함께 오늘의 운세를 확인해보세요. 사랑운, 재물운, 직업운, 건강운까지 개인 맞춤형 운세와 조언을 제공합니다. 전통 점술의 지혜와 현대 AI 기술이 만난 새로운 운세 서비스입니다.',
  urls: {
    production: 'https://ongleam-fortuneteller.vercel.app',
    development: 'https://ongleam-fortuneteller.vercel.app',
    local: 'http://localhost:3000',
  },
  keywords: [
    '점순이',
    '운세',
    '점술',
    '사주',
    '타로',
    'AI 점술사',
    '오늘의 운세',
    '사랑운',
    '재물운',
    '직업운',
    '건강운',
    '가족운',
    '학업운',
    '개인 맞춤 운세',
    '무료 운세',
    '온라인 점술',
    '전통 점술',
    '동양 점술',
    '운세 상담',
    '점괘',
    '철학관',
    '신점',
    '궁합',
  ],
  icons: {
    icon: [{ url: '/favicon.ico', sizes: 'any' }],
  },
  privacyPolicy: {
    url: 'https://ongleam.notion.site/2220ab7fb18f80fba5c8e0ba61ea3910',
  },
  termsOfService: {
    url: 'https://ongleam.notion.site/2220ab7fb18f80b08c5bd0513d561396',
  },
  version: '1.0.0',
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
  locale: 'ko_KR',
  type: 'website',
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
  other: {
    'naver-site-verification': process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION!,
  },
};
