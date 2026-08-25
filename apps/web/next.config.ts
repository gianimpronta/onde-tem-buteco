import path from "node:path";
import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // `standalone`: o Next emite um bundle com so as dependencias rastreadas.
  // Sem isso o runner copiava a arvore inteira do builder -- node_modules com
  // dev deps, codigo-fonte e .next/cache -- e a imagem tinha 1.82GB.
  output: "standalone",
  // Necessario porque o rastreamento nao enxerga o client gerado pelo Prisma
  // (escrito em build-time, sem import estatico).
  outputFileTracingIncludes: {
    "*": [
      "./app/generated/prisma/**/*",
      // Os chunks compilados referenciam @swc/helpers pelo caminho ANINHADO
      // dentro do diretorio do next no .pnpm (link de peer dependency que o
      // rastreamento nao segue). Sem esta linha a imagem sobe e morre com
      // "Cannot find module .../next@.../node_modules/@swc/helpers/...".
      // Glob no lugar da versao pra nao quebrar no proximo bump do next.
      "./node_modules/.pnpm/next@*/node_modules/@swc/helpers/**/*",
    ],
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

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "gianimpronta",

  project: "onde-tem-buteco",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
