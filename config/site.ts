import { Metadata } from 'next';

export const siteConfig = {
  name: 'NomadLink Korea | Your Guide to Digital Nomad Life in Korea',
  description:
    'Discover everything you need for your digital nomad journey in South Korea: visa information (F-1-D), cost of living, co-working spaces, community, and travel tips. Your essential resource for working remotely in Korea.',
  urls: {
    production: 'https://nomadlink.co.kr',
    development: 'https://dev.nomadlink.co.kr',
    local: 'http://localhost:3000',
  },
  keywords: [
    'Digital Nomad Korea',
    'Korea Remote Work',
    'Korea F-1-D Visa',
    'Work in Korea for Foreigners',
    'Living in Korea as a Digital Nomad',
    'Korea Cost of Living',
    'Korea Co-working Spaces',
    'Korea Visa for Remote Workers',
    'South Korea Digital Nomad Guide',
    'Travel Korea and Work',
    'Seoul Digital Nomad',
    'Busan Digital Nomad',
    'Jeju Digital Nomad',
    'NomadLink Korea',
    'Korea Tech Visa',
    'Remote Jobs Korea',
  ],
  icons: {
    icon: [{ url: '/favicon.ico', sizes: 'any' }],
  },
  privacyPolicy: {
    url: 'https://ongleam.notion.site/1ee0ab7fb18f80a69e18df2f8052b156',
  },
  termsOfService: {
    url: 'https://ongleam.notion.site/1ee0ab7fb18f802dba22f415dbd517c7',
  },
  version: '0.1.1',
};

const siteOpenGraph = {
  title: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.urls.production,
  images: [
    {
      url: `${siteConfig.urls.production}/images/nomadlink-og-image.png`,
    },
  ],
  locale: 'en_US',
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
