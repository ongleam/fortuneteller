module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["<rootDir>/tests/fixtures/setup.ts"],
  verbose: true,
  testTimeout: 10000,
  moduleNameMapper: {
    "^@fortuneteller/saju$": "<rootDir>/../../packages/saju/src/index.ts",
    "^@fortuneteller/saju/(.*)$": "<rootDir>/../../packages/saju/src/$1.ts",
    "^@/lib/(.*)$": "<rootDir>/../../packages/core/lib/$1",
    "^@/config/(.*)$": "<rootDir>/../../packages/core/config/$1",
    "^@/app/(.*)$": "<rootDir>/app/$1",
    "^@/tests/(.*)$": "<rootDir>/tests/$1",
    "^@/(.*)$": "<rootDir>/$1",
  },
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  testPathIgnorePatterns: ["/node_modules/"],
};
