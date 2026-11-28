/* eslint-env node */
module.exports = {
    future: {
        removeDeprecatedGapUtilities: true,
        purgeLayersByDefault: true,
        defaultLineHeights: true,
        standardFontWeights: true,
    },
    purge: {
        enabled: true,
        content: ["./src/**/*.tsx"],
    },
    theme: {
        extend: {},
    },
    variants: {},
    plugins: [],
};
