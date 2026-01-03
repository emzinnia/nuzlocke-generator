import * as React from "react";
import { Outlet, useLoaderData, useRevalidator } from "react-router-dom";
import { Provider as ReduxProvider } from "react-redux";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "store";
import { ErrorBoundary, Skeleton } from "components";
import type { RootLoaderData } from "router";

const MainHeader = React.lazy(() =>
    import("./MainHeader").then((m) => ({ default: m.MainHeader }))
);

export const MainLayout: React.FC = () => {
    const loaderData = useLoaderData() as RootLoaderData;
    const { runs, isAuthenticated, user } = loaderData;
    const revalidator = useRevalidator();

    return (
        <ReduxProvider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <DndProvider backend={HTML5Backend}>
                    <div className="h-screen flex flex-col overflow-hidden bg-bg-primary text-fg-primary font-sans duration-normal transition-colors">
                        <ErrorBoundary key="header">
                            <React.Suspense fallback={Skeleton}>
                                <MainHeader
                                    runs={runs}
                                    isAuthenticated={isAuthenticated}
                                    user={user}
                                    onRunsChange={() => revalidator.revalidate()}
                                />
                            </React.Suspense>
                        </ErrorBoundary>
                        <main className="flex-1 flex min-h-0">
                            <Outlet context={{ runs, isAuthenticated, user, onRunsChange: () => revalidator.revalidate() }} />
                        </main>
                    </div>
                </DndProvider>
            </PersistGate>
        </ReduxProvider>
    );
};

