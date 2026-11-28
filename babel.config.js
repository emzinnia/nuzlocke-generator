// eslint-disable-next-line @typescript-eslint/no-require-imports
const { resolve } = require("path");

module.exports = (api) => {
    api.cache.using(() => process.env.NODE_ENV);

    if (process.env.NODE_ENV === "test") {
        return {
            presets: ["@babel/preset-typescript", "@babel/preset-react"],
            plugins: [
                "macros",
                "@babel/plugin-transform-modules-commonjs",
                "@babel/plugin-proposal-export-namespace-from",
                "@babel/plugin-syntax-import-meta",
                ["@babel/plugin-proposal-decorators", { legacy: true }],
            ],
        };
    }

    return {
        presets: ["@babel/preset-typescript", "@babel/preset-react"],
        plugins: [
            "macros",
            "@babel/plugin-transform-modules-commonjs",
            "@babel/plugin-proposal-export-namespace-from",
            "@babel/plugin-syntax-import-meta",
            ["@babel/plugin-proposal-decorators", { legacy: true }],
        ],
    };
};
