/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-function-type */
import * as React from "react";
import { injectGlobal } from "emotion";
import { createRoot } from "react-dom/client";

// Base styles and design tokens
import "normalize.css/normalize.css";
import "./styles/tokens.css";

import { isLocal } from "utils";
import { ErrorBoundary } from "components";
import { AppToasterHost } from "components/Common/Shared/appToaster";

(window as any).global = window;

// @TODO: add back Buffer/Path
// // @ts-ignore
// window.Buffer = window.Buffer || require('buffer').Buffer;
// // @ts-ignore
// window.path = window.path || require('path').path;

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

    .opacity-medium {
        opacity: 0.5;
    }

    .flex { display: flex; }
    .p-6 { padding: 6rem; }
    .center-text { text-align: center; }
    .font-bold { font-weight: bold; }
    .items-center { align-items: center; }
    .content-center { align-content: center; }
    .justify-between { justify-content: space-between; }
    .m-1 { margin: 0.25rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .cursor-pointer { cursor: pointer; }
    .inline-flex { display: inline-flex !important; }
    .full-width { width: 100%; }
`;

const mountNode = document.getElementById("app");

async function createRender() {
    const { Provider } = await import("react-redux");

    const { DndProvider } = await import("react-dnd");
    const { HTML5Backend } = await import("react-dnd-html5-backend");
    const { PersistGate } = await import("redux-persist/es/integration/react");
    const { store, persistor } = await import("./store");
    // @TODO: add back check for tests mode
    const isTest = false;

    const App = React.lazy(() =>
        import("components/Layout/App").then((res) => ({ default: res.App })),
    );

    const ReduxProvider = Provider as any;

    if (!mountNode) {
        throw new Error("Failed to locate app mount node");
    }

    const root = createRoot(mountNode);

    root.render(
        <ReduxProvider store={store}>
            <AppToasterHost />
            {isTest ? (
                <PersistGate
                    loading={<div>Loading...</div>}
                    onBeforeLift={null}
                    persistor={persistor}
                >
                    <DndProvider backend={HTML5Backend}>
                        <ErrorBoundary>
                            <React.Suspense fallback={"Loading App..."}>
                                <App />
                            </React.Suspense>
                        </ErrorBoundary>
                    </DndProvider>
                </PersistGate>
            ) : (
                <DndProvider backend={HTML5Backend}>
                    <ErrorBoundary>
                        <React.Suspense fallback={"Loading App..."}>
                            <App />
                        </React.Suspense>
                    </ErrorBoundary>
                </DndProvider>
            )}
        </ReduxProvider>,
    );
}

createRender().catch((err) => {
    console.error("Failed to create render:", err);
    document.body.innerHTML = `<div style="color: red; padding: 20px;"><h1>Failed to start app</h1><pre>${err.message}\n${err.stack}</pre></div>`;
});
getRollbar().catch((err) => console.error("Failed to init Rollbar:", err));
