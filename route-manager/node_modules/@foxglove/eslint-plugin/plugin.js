/** @type {import("eslint").ESLint.Plugin} */
module.exports = {
  rules: {
    "strict-equality": require("./rules/strict-equality"),
    "no-return-promise-resolve": require("./rules/no-return-promise-resolve"),
    "no-boolean-parameters": require("./rules/no-boolean-parameters"),
    "no-restricted-imports": require("./rules/no-restricted-imports"),
    "prefer-hash-private": require("./rules/prefer-hash-private"),
  },
};
