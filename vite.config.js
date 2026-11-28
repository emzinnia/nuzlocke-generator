/* eslint-env node */
// vite.config.js
/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
import { viteStaticCopy } from "vite-plugin-static-copy";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
    root: "./",
    base: "/",
    plugins: [
        react(),
        tsconfigPaths(),
        // Copy static assets
        viteStaticCopy({
            targets: [
                { src: "src/img/*", dest: "img" },
                { src: "src/assets/*", dest: "assets" },
                { src: "src/assets/icons/*", dest: "icons" },
                // Copy assets/img subdirectory (box backgrounds, etc.)
                { src: "src/assets/img/*", dest: "assets/img" },
                // Copy only non-icon assets to avoid duplicating icons folder (~13MB savings)
                { src: "src/assets/*.png", dest: "assets" },
                { src: "src/assets/*.jpg", dest: "assets" },
                { src: "src/assets/*.woff", dest: "assets" },
                { src: "src/assets/*.ttf", dest: "assets" },
                { src: "src/assets/*.css", dest: "assets" },
            ],
        }),
        // Plugin to mock CSS and static files in tests only
        {
            name: "mock-css-and-assets",
            load(id) {
                // Only mock assets during test runs
                if (process.env.VITEST) {
                    if (/\.(css|styl)$/.test(id)) {
                        return "export default {}";
                    }
                    if (
                        /\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$/.test(
                            id,
                        )
                    ) {
                        return "export default {}";
                    }
                }
            },
        },
        // Plugin to fix React JSX runtime imports
        {
            name: "fix-react-jsx-runtime",
            resolveId(id) {
                if (
                    id === "react/jsx-runtime" ||
                    id === "react/jsx-dev-runtime"
                ) {
                    return id + ".js";
                }
            },
        },
    ],
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],
        alias: {
            // Prefer Node built-ins over npm packages with same name
            path: "node:path",
            // Ensure Vitest can resolve React's JSX runtime files
            "react/jsx-runtime": path.resolve(
                __dirname,
                "node_modules/react/jsx-runtime.js",
            ),
            "react/jsx-dev-runtime": path.resolve(
                __dirname,
                "node_modules/react/jsx-dev-runtime.js",
            ),
        },
        dedupe: ["react", "react-dom"],
    },
    server: {
        host: "localhost",
        port: 8080,
        historyApiFallback: true,
    },
    css: {
        preprocessorOptions: {
            scss: {
                sourceMap: true,
            },
        },
    },
    build: {
        outDir: "dist",
        minify: isProduction,
        sourcemap: !isProduction, // Disable sourcemaps in production to reduce bundle size
        // Code splitting
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ["react", "react-dom"],
                },
            },
        },
    },
    worker: {
        plugins: () => [tsconfigPaths()],
    },
    optimizeDeps: {
        include: ["react", "react-dom"],
    },
    ssr: {
        noExternal: ["react-dnd", "react-dnd-html5-backend"],
    },
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: ["./setupTests.ts"],
        deps: {
            inline: ["react-dnd", "react-dnd-html5-backend"],
        },
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            include: ["src/**/*.tsx", "src/**/*.ts"],
            exclude: ["src/parsers/*.ts"],
        },
        include: ["**/__tests__/**/*.{ts,tsx,js}"],
    },
});
