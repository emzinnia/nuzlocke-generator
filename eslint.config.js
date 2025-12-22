import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        ignores: [
            "**/node_modules/**",
            "**/dist/**",
            "**/build/**",
            "**/coverage/**",
            "**/lighthouse/**",
            "webpack.config.ts",
            ".eslintrc.js",
            ".babelrc",
            "jest-config.json",
            "server.ts",
            "setupTests.ts",
            "stylus.config.ts",
            "babel.config.js",
            "imageCheck.ts",
            "massRename.ts",
            "scraper.js",
            "**/__tests__/*.ts",
            "vite.config.js",
            "e2e/screenshots/**",
            ".cursor/**",
            "dist/**",
        ],
        linterOptions: {
            reportUnusedDisableDirectives: "off",
        },
    },
    {
        files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
        plugins: { js },
        extends: ["js/recommended"],
    },
    {
        files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
        languageOptions: { globals: { ...globals.browser, ...globals.node } },
        settings: { react: { version: "detect" } },
    },
    tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
    {
        rules: {
            "react/prop-types": "off",
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-empty-object-type": "warn",
            "@typescript-eslint/no-unsafe-function-type": "warn",
            "no-prototype-builtins": "off",
            "jsx-a11y/no-onchange": "off",
            "@typescript-eslint/quotes": "off",
            "no-useless-escape": "off",
        },
    },
]);
