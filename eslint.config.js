import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        ignores: [
            "**/node_modules/**",
            "**/.venv/**",
            "**/dist/**",
            "**/build/**",
            "**/coverage/**",
            "**/lighthouse/**",
        ],
    },
    {
        files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
        plugins: { js },
        extends: ["js/recommended"],
    },
    {
        settings: {
            react: {
                version: "detect",
            },
        },
    },
    {
        files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
        languageOptions: { globals: { ...globals.browser, ...globals.node } },
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
            "no-prototype-builtins": "warn",
            "jsx-a11y/no-onchange": "off",
            "@typescript-eslint/quotes": "off",
            "no-useless-escape": "off",
        },
    },
]);
