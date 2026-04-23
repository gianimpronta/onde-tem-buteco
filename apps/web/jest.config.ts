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
  collectCoverageFrom: ["app/api/**/*.ts", "lib/**/*.ts", "!lib/**/__tests__/**", "!**/*.d.ts"],
};

export default createJestConfig(config);
