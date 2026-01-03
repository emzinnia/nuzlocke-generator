import * as React from "react";
import {
    createBrowserRouter,
    type LoaderFunctionArgs,
} from "react-router-dom";
import { getAuthToken } from "api/client";
import { listRuns, getRunBySlug, type RunSummary, type Run } from "api/runs";
import { ensureAuthenticated, type User } from "api/auth";

// Lazy load route components
const MainLayout = React.lazy(() =>
    import("./components/Layout/App/MainLayout").then((m) => ({ default: m.MainLayout }))
);
const EditorPage = React.lazy(() =>
    import("./components/Layout/App/EditorPage").then((m) => ({ default: m.EditorPage }))
);
const DataPage = React.lazy(() =>
    import("./components/Layout/App/DataPage").then((m) => ({ default: m.DataPage }))
);
const RunPage = React.lazy(() =>
    import("./components/Layout/App/RunPage").then((m) => ({ default: m.RunPage }))
);
const RoadmapPage = React.lazy(() =>
    import("./components/_v2/Layout/RoadmapPage").then((m) => ({ default: m.RoadmapPage }))
);
const ApiExplorerPage = React.lazy(() =>
    import("./components/_v2/Layout/ApiExplorerPage").then((m) => ({ default: m.ApiExplorerPage }))
);

export interface RootLoaderData {
    runs: RunSummary[];
    isAuthenticated: boolean;
    user: User | null;
}

// Root loader - ensures user is authenticated (creates anonymous session if needed)
async function rootLoader(): Promise<RootLoaderData> {
    try {
        const user = await ensureAuthenticated();
        const runs = await listRuns();
        return { runs, isAuthenticated: true, user };
    } catch {
        // Backend unavailable - fall back to local-only mode
        return { runs: [], isAuthenticated: false, user: null };
    }
}

// Run page loader - fetches a specific run by slug (for backend runs)
// For local runs, the RunPage component handles loading from Redux
export interface RunLoaderData {
    run: Run | null;
    isBackendRun: boolean;
    runId: string;
}

async function runLoader({ params }: LoaderFunctionArgs): Promise<RunLoaderData> {
    const { slug } = params;
    if (!slug) {
        throw new Response("Run not found", { status: 404 });
    }
    
    const token = getAuthToken();
    
    // If authenticated, try to fetch from backend
    if (token) {
        try {
            const run = await getRunBySlug(slug);
            return { run, isBackendRun: true, runId: slug };
        } catch {
            // Backend run not found - fall through to local mode
        }
    }
    
    // Return null run - RunPage will try to load from local Redux state
    return { run: null, isBackendRun: false, runId: slug };
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

// Create the router - local editor is the core experience
export const router = createBrowserRouter([
    {
        id: "root",
        path: "/",
        element: (
            <React.Suspense fallback={<RouteLoading />}>
                <MainLayout />
            </React.Suspense>
        ),
        loader: rootLoader,
        errorElement: <RouteErrorBoundary />,
        children: [
            {
                index: true,
                element: (
                    <React.Suspense fallback={<RouteLoading />}>
                        <EditorPage />
                    </React.Suspense>
                ),
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
                path: "run/:slug",
                element: (
                    <React.Suspense fallback={<RouteLoading />}>
                        <RunPage />
                    </React.Suspense>
                ),
                loader: runLoader,
                errorElement: <RouteErrorBoundary />,
            },
            {
                path: "roadmap",
                element: (
                    <React.Suspense fallback={<RouteLoading />}>
                        <RoadmapPage />
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
            },
        ],
    },
]);
