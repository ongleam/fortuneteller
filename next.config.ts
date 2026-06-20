import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // ppr: true,  // PPR 기능 비활성화
  },
  images: {
    remotePatterns: [
      {
        hostname: "avatar.vercel.sh",
      },
      {
        hostname: "k.kakaocdn.net",
      },
    ],
  },
};

export default nextConfig;
