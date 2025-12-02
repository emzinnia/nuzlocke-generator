import * as React from "react";
import {
    createBrowserRouter,
    redirect,
    type LoaderFunctionArgs,
} from "react-router-dom";
import { getAuthToken } from "api/client";
import { getRun, listRuns } from "api/runs";

// Lazy load route components
const RootLayout = React.lazy(() =>
    import("./components/Layout/App/RootLayout").then((m) => ({ default: m.RootLayout }))
);
const HomePage = React.lazy(() =>
    import("./components/Layout/App/HomePage").then((m) => ({ default: m.HomePage }))
);
const ApiExplorerPage = React.lazy(() =>
    import("./components/Layout/App/ApiExplorerPage").then((m) => ({ default: m.ApiExplorerPage }))
);
const RunPage = React.lazy(() =>
    import("./components/Layout/App/RunPage").then((m) => ({ default: m.RunPage }))
);
const DataPage = React.lazy(() =>
    import("./components/Layout/App/DataPage").then((m) => ({ default: m.DataPage }))
);

// Auth check helper
function requireAuth() {
    const token = getAuthToken();
    if (!token) {
        throw redirect("/");
    }
    return token;
}

// Loaders
async function rootLoader() {
    const token = getAuthToken();
    if (token) {
        try {
            const runs = await listRuns();
            return { runs, isAuthenticated: true };
        } catch {
            return { runs: [], isAuthenticated: false };
        }
    }
    return { runs: [], isAuthenticated: false };
}

async function runLoader({ params }: LoaderFunctionArgs) {
    requireAuth();
    if (!params.id) {
        throw new Response("Run ID required", { status: 400 });
    }
    const run = await getRun(params.id);
    return { run };
}

// Error boundary component
function RouteErrorBoundary() {
    return (
        <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-red-800">Something went wrong</h2>
                <p className="text-red-600 mt-1">Failed to load this page. Please try again.</p>
                <a href="/" className="inline-block mt-3 text-blue-600 hover:underline">
                    Go back home
                </a>
            </div>
        </div>
    );
}

// Loading component
function RouteLoading() {
    return (
        <div className="p-6 flex items-center gap-2 text-gray-500">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
            </svg>
            Loading...
        </div>
    );
}

// Create the router with data APIs
export const router = createBrowserRouter([
    {
        id: "root",
        path: "/",
        element: (
            <React.Suspense fallback={<RouteLoading />}>
                <RootLayout />
            </React.Suspense>
        ),
        loader: rootLoader,
        errorElement: <RouteErrorBoundary />,
        children: [
            {
                index: true,
                element: (
                    <React.Suspense fallback={<RouteLoading />}>
                        <HomePage />
                    </React.Suspense>
                ),
            },
            {
                path: "api-explorer",
                element: (
                    <React.Suspense fallback={<RouteLoading />}>
                        <ApiExplorerPage />
                    </React.Suspense>
                ),
                loader: () => {
                    requireAuth();
                    return null;
                },
            },
            {
                path: "data",
                element: (
                    <React.Suspense fallback={<RouteLoading />}>
                        <DataPage />
                    </React.Suspense>
                ),
            },
            {
                path: "runs/:id",
                element: (
                    <React.Suspense fallback={<RouteLoading />}>
                        <RunPage />
                    </React.Suspense>
                ),
                loader: runLoader,
                errorElement: <RouteErrorBoundary />,
            },
        ],
    },
]);

