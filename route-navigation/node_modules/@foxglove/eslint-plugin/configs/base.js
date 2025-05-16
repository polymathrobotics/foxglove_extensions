const { fixupPluginRules } = require("@eslint/compat");
const js = require("@eslint/js");
// @ts-expect-error Missing type definitions
const es = require("eslint-plugin-es");
// @ts-expect-error Missing type definitions
const filenames = require("eslint-plugin-filenames");
// @ts-expect-error Missing type definitions
const importPlugin = require("eslint-plugin-import");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");

const foxglove = require("../plugin");

const fixedFilenames = fixupPluginRules(filenames);

/** @type {import("eslint").Linter.Config[]} */
module.exports = [
  js.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
    plugins: {
      "@foxglove": foxglove,
      import: importPlugin,
      es: fixupPluginRules(es),

      // eslint-plugin-filenames allows rules to have options, but fixupPluginRules defaults to a
      // schema that does not allow passing any options. We replace this with `false` to disable
      // validation so that options can be passed in.
      filenames: {
        ...fixedFilenames,
        rules: Object.fromEntries(
          Object.entries(fixedFilenames.rules ?? {}).map(([ruleId, rule]) => [
            ruleId,
            {
              ...rule,
              meta: {
                ...rule.meta,
                schema: rule.meta?.schema ?? false,
              },
            },
          ])
        ),
      },
    },
    rules: {
      // even new Safari versions do not support regexp lookbehinds
      "es/no-regexp-lookbehind-assertions": "error",

      // import plugin is slow, only enable the critical stuff
      "import/export": "error",
      "import/first": "error",
      "import/named": "error",
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",
      "import/no-mutable-exports": "error",
      "import/no-useless-path-segments": "error",
      "import/order": [
        "error",
        {
          alphabetize: {
            order: "asc",
          },
          "newlines-between": "always",
          groups: [
            ["builtin", "external"],
            ["internal"],
            ["parent", "sibling", "index"],
          ],
        },
      ],

      "filenames/match-exported": "error",

      // require double equal for null and undefined, triple equal everywhere else
      "@foxglove/strict-equality": "error",
      "@foxglove/no-return-promise-resolve": "error",
      "@foxglove/prefer-hash-private": "error",

      // require curly braces everywhere
      curly: "error",

      // avoid eval
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",

      // unused vars must have `_` prefix
      "no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
        },
      ],

      "no-underscore-dangle": [
        "error",
        {
          allowAfterThis: true,
        },
      ],

      // avoid TO.DO and FIX.ME comments, create a ticket to track future work
      "no-warning-comments": [
        "error",
        {
          location: "anywhere",
        },
      ],

      "no-unused-expressions": ["error", { enforceForJSX: true }],
      "no-param-reassign": "error",
      "no-useless-rename": "error",
      "object-shorthand": "error",
      "prefer-arrow-callback": ["error", { allowNamedFunctions: true }],
    },
  },
];
