/** @type {import("eslint").ESLint.Plugin} */
module.exports = {
  rules: {
    "no-boolean-parameters": require("./rules/no-boolean-parameters"),
    "no-restricted-imports": require("./rules/no-restricted-imports"),
    "no-return-promise-resolve": require("./rules/no-return-promise-resolve"),
    "prefer-hash-private": require("./rules/prefer-hash-private"),
    "strict-equality": require("./rules/strict-equality"),
  },
};
