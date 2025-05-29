module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'], // ✅ just this
        // 🚫 remove plugins: ['expo-router/babel']
    };
};
