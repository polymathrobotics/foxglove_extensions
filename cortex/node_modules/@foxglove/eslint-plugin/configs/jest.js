// @ts-ignore
const jest = require("eslint-plugin-jest");

/** @type {import("eslint").Linter.Config[]} */
module.exports = [
  jest.configs["flat/recommended"],
  {
    rules: {
      "jest/consistent-test-it": ["error", { fn: "it" }],
    },
  },
];
