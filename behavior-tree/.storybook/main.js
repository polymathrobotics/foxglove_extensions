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
    // Add path alias resolution for @/* paths
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, '../src'),
    };

    // Ensure Storybook watches src files for hot reloading
    config.watchOptions = {
      ...config.watchOptions,
      ignored: /node_modules/,
      poll: 1000,
    };

    // Remove fork-ts-checker-webpack-plugin to avoid Node.js v21 compatibility issues
    const forkTsCheckerIndex = config.plugins.findIndex(
      (plugin) => plugin.constructor.name === 'ForkTsCheckerWebpackPlugin'
    );
    if (forkTsCheckerIndex !== -1) {
      config.plugins.splice(forkTsCheckerIndex, 1);
    }
    // Filter out the existing css rule so css-loader isn't included twice
    config.module.rules = config.module.rules.filter(
      (rule) => !(rule.test && String(rule.test) === String(/\.css$/))
    );
    config.module.rules.push(
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
    )
    return config;
  },
  "typescript": {
    "check": false,
    "reactDocgen": false
  }
};
export default config;
