import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: [String.raw`[/\\]e2e[/\\]`],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
    "!app/**/__tests__/**",
    "!components/**/__tests__/**",
    "!lib/**/__tests__/**",
    "!app/generated/**",
    "!lib/prisma.ts",
    "!**/*.d.ts",
  ],
};

export default createJestConfig(config);
