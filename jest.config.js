module.exports = {
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '.ts': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
        isolatedModules: true,
        useESM: true,
      },
    ],
  },
  verbose: true,
  testEnvironment: 'node',
  transformIgnorePatterns: ['.json', 'node_modules', 'build'],
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.ts$',
  moduleFileExtensions: ['js', 'ts'],
}
