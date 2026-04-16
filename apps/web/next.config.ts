import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  outputFileTracingIncludes: {
    "*": ["./app/generated/prisma/**/*"],
  },
};

export default nextConfig;
