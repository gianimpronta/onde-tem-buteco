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
      {
        protocol: "http",
        hostname: "comidadibuteco.com.br",
      },
      // Jetpack CDN — WordPress pode reescrever URLs de imagem para i{0,1,2}.wp.com
      {
        protocol: "https",
        hostname: "i0.wp.com",
      },
      {
        protocol: "https",
        hostname: "i1.wp.com",
      },
      {
        protocol: "https",
        hostname: "i2.wp.com",
      },
    ],
  },
};

export default nextConfig;
