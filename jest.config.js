module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/tests/fixtures/setup.ts'],
  verbose: true,
  testTimeout: 10000,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  // E2E 테스트(tests/e2e)는 Playwright로 실행하므로 jest 수집에서 제외
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/tests/e2e/'],
  collectCoverageFrom: ['lib/**/*.ts', '!lib/**/*.test.ts', '!lib/**/*.d.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};
