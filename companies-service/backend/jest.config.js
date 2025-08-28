module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.module.ts',
    '!**/index.ts',
    '!**/main.ts',
    '!**/migrations/**',
    '!**/dto/**',
    '!**/entities/**',
    '!**/interfaces/**',
    '!**/guards/**',
    '!**/strategies/**',
  ],
  coverageDirectory: '../coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
  },
  // setupFilesAfterEnv: ['<rootDir>/../test/setup.ts'],
  testTimeout: 10000,
}; 