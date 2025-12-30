import * as React from "react";
import { injectGlobal } from "emotion";
import { RouterProvider } from "react-router-dom";
import { ErrorBoundary } from "components";
import { DarkModeProvider } from "./hooks/useDarkMode";
import { router } from "./router";
import { isLocal } from "utils";
import { AppToasterHost } from "components/Common/Shared/appToaster";

import "normalize.css/normalize.css";
import "./styles/tokens.css";
import "./index.css";

(window as any).global = window;

async function getRollbar() {
    const { default: Rollbar } = await import("rollbar");

    const rollbarConfig = new Rollbar({
        accessToken: "357eab6297524e6facb1c48b0403d869",
        captureUncaught: true,
        payload: {
            environment: "production",
        },
        autoInstrument: {
            network: false,
            log: false,
            dom: true,
            navigation: false,
            connectivity: true,
        },
        maxItems: 20,
        captureIp: false,
        enabled: isLocal() ? false : true,
    });

    Rollbar.init(rollbarConfig as any);
}

getRollbar().then((res) => res);

void injectGlobal`
    *,
    *::before,
    *::after {
        box-sizing: border-box;
    }

    a {
        text-decoration: none;
    }

    body {
        background: var(--color-bg-primary);
        font-family: var(--font-sans);
        color: var(--color-text-primary);
    }

    .app {
        display: flex;
        height: 100vh;
        min-width: 100%;
        overflow-y: hidden;
    }
`;

const mountNode = document.getElementById("app");

async function createRender() {
    const { createRoot } = await import("react-dom/client");

    const root = createRoot(mountNode!);
    root.render(
        <ErrorBoundary>
            <DarkModeProvider>
                <AppToasterHost />
                <RouterProvider router={router} />
            </DarkModeProvider>
        </ErrorBoundary>
    );
}

createRender().catch((err) => {
    console.error("Failed to create render:", err);
    document.body.innerHTML = `<div style="color: red; padding: 20px;"><h1>Failed to start app</h1><pre>${err.message}\n${err.stack}</pre></div>`;
});
