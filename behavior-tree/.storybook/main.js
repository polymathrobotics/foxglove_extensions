const config = {
  "stories": [
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": ["@storybook/preset-typescript"],
  "framework": {
    "name": "@storybook/react-webpack5",
    "options": {}
  },
  "env": (config) => ({
    ...config,
    STORYBOOK_DISABLE_TELEMETRY: true,
  }),
  "webpackFinal": async (config) => {
    // Remove fork-ts-checker-webpack-plugin to avoid Node.js v21 compatibility issues
    const forkTsCheckerIndex = config.plugins.findIndex(
      (plugin) => plugin.constructor.name === 'ForkTsCheckerWebpackPlugin'
    );
    if (forkTsCheckerIndex !== -1) {
      config.plugins.splice(forkTsCheckerIndex, 1);
    }
    return config;
  },
  "typescript": {
    "check": false,
    "reactDocgen": false
  }
};
export default config;