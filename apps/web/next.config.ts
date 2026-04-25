import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "*": ["./app/generated/prisma/**/*"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "comidadibuteco.com.br",
      },
      {
        protocol: "https",
        hostname: "*.comidadibuteco.com.br",
      },
    ],
  },
};

export default nextConfig;
