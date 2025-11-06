module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'expo-router/babel',        // Handles routing transpile
      'nativewind/babel',         // Tailwind support
      'react-native-reanimated/plugin', // Must be last
    ],
  };
};
