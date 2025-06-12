const plugin = require("./plugin");

module.exports = {
  // Rules are stored in a separate file to avoid circular dependency
  ...plugin,
  configs: {
    base: require("./configs/base"),
    jest: require("./configs/jest"),
    react: require("./configs/react"),
    typescript: require("./configs/typescript"),
  },
};
