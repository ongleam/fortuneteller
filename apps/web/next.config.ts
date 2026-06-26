import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 모노레포 워크스페이스 패키지(TS 소스)를 그대로 트랜스파일한다.
  transpilePackages: ["@fortuneteller/saju", "@fortuneteller/core"],
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
