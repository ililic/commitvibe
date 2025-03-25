module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts', '!src/types/**/*.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  // Mock all modules properly
  moduleNameMapper: {
    '^src/providers/llm/openai$': '<rootDir>/tests/__mocks__/openai.ts',
    '^src/providers/llm/provider$': '<rootDir>/tests/__mocks__/provider.ts'
  },
  // Setup test environment
  setupFiles: ['<rootDir>/tests/setup.js'],
};
