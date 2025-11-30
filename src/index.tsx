import * as React from "react";
import { injectGlobal } from "emotion";
import { RouterProvider } from "react-router-dom";
import { ErrorBoundary } from "components";
import { DarkModeProvider } from "./hooks/useDarkMode";
import { router } from "./router";
import "./index.css";

void injectGlobal`
    *,
    *::before,
    *::after {
        box-sizing: border-box;
    }

    a {
        text-decoration: none;
    }
`;

const mountNode = document.getElementById("app");

async function createRender() {
    const { createRoot } = await import("react-dom/client");

    const root = createRoot(mountNode!);
    root.render(
        <ErrorBoundary>
            <DarkModeProvider>
                <RouterProvider router={router} />
            </DarkModeProvider>
        </ErrorBoundary>
    );
}

createRender().catch((err) => {
    console.error("Failed to create render:", err);
    document.body.innerHTML = `<div style="color: red; padding: 20px;"><h1>Failed to start app</h1><pre>${err.message}\n${err.stack}</pre></div>`;
});
