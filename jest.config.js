module.exports = {
  roots: ["<rootDir>"],
  transform: {
    "\\.[jt]sx?$": "babel-jest",
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.ts?$",
  moduleFileExtensions: ["ts", "js", "json", "node"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/lib/$1",
  },
  // `globals` was used here previously, which injects variables into tests and enforces nothing.
  // `coverageThreshold` is the key that actually gates.
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  collectCoverage: true,
  collectCoverageFrom: [
    "lib/**/*.ts",
    // Both compile to zero executable statements, so istanbul reports them as 0/0 and drags the
    // global ratio down.
    "!lib/index.ts",
    "!lib/enums/**/*.ts",
  ],
  coverageDirectory: "coverage",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
