const path = require("path");

module.exports = function (api) {
  api.cache(true);
  const projectRoot = __dirname;
  const nodeModulesPaths = [path.join(projectRoot, "node_modules")];
  return {
    presets: [require.resolve("babel-preset-expo")],
    plugins: [
      require.resolve("nativewind/babel"),
      require.resolve("react-native-reanimated/plugin"),
    ],
    env: {
      production: { compact: true },
    },
    babelrcRoots: [
      ".",
      "node_modules/expo-router"
    ],
  };
};
