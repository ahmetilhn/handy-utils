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
  globals: {
    branches: 94,
    functions: 100,
    lines: 100,
    statements: 97,
  },
  collectCoverage: true,
  coverageDirectory: "coverage",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
