# @foxglove/eslint-plugin

[![npm package](https://img.shields.io/npm/v/@foxglove/eslint-plugin)](https://www.npmjs.com/package/@foxglove/eslint-plugin)

Foxglove default eslint configuration & rules.

## Rules

See [rules/README.md](rules/README.md) for details on each rule.

## Installation

```sh
yarn add -D \
    @foxglove/eslint-plugin \
    typescript-eslint \
    eslint \
    prettier
```

In your `eslint.config.cjs`:

```js
const foxglove = require("@foxglove/eslint-plugin");
const tseslint = require("typescript-eslint");

module.exports = tseslint.config(
  ...foxglove.configs.base,
  ...foxglove.configs.react,
  ...foxglove.configs.jest,
  ...foxglove.configs.typescript
);
```

## License

@foxglove/eslint-plugin is released under the [MIT License](/LICENSE.md).

## Releasing

**Note**: You must use npm 7+ (not yarn) to test this repo locally, due to the self link in `package.json`.

```sh
tag=$(npm version minor) && echo "$tag"
git push && git push origin "$tag"
```

## Stay in touch

Join our [Slack channel](https://foxglove.dev/slack) to ask questions, share feedback, and stay up to date on what our team is working on.
