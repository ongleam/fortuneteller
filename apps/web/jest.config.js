module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["<rootDir>/tests/fixtures/setup.ts"],
  verbose: true,
  testTimeout: 10000,
  moduleNameMapper: {
    "^server-only$": "<rootDir>/tests/stubs/server-only.js",
    "^@fortuneteller/modules/(.*)$": "<rootDir>/../../packages/modules/$1",
    "^@fortuneteller/shared/(.*)$": "<rootDir>/../../packages/shared/$1",
    "^@fortuneteller/config/(.*)$": "<rootDir>/../../packages/config/$1",
    "^@fortuneteller/db/(.*)$": "<rootDir>/../../packages/db/$1",
    "^@fortuneteller/clients/(.*)$": "<rootDir>/../../packages/clients/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  testPathIgnorePatterns: ["/node_modules/", "<rootDir>/tests/e2e/"], // E2E 테스트는 Playwright로 실행
  collectCoverageFrom: [
    "../../packages/modules/**/*.ts",
    "../../packages/shared/**/*.ts",
    "../../packages/config/**/*.ts",
    "../../packages/db/**/*.ts",
    "../../packages/clients/**/*.ts",
    "src/**/*.ts",
    "!**/*.test.ts",
    "!**/*.d.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
};
