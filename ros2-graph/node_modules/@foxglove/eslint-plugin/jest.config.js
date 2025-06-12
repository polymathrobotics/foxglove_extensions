module.exports = {
  testMatch: ["<rootDir>/**/*.test.ts"],
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
};
