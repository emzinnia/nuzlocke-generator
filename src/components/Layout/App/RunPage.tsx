import * as React from "react";
import { useLoaderData } from "react-router-dom";
import deepmerge from "deepmerge";
import type { Run } from "api/runs";
import { useRunChannel } from "api/useRunChannel";
import { RunInfographic } from "./RunInfographic";

interface RunLoaderData {
    run: Run;
}

// Custom merge strategy: replace arrays instead of concatenating
const overwriteArrays: deepmerge.Options = {
    arrayMerge: (_target, source) => source,
};

export const RunPage: React.FC = () => {
    const { run } = useLoaderData() as RunLoaderData;
    
    // Local state for real-time updates
    const [runData, setRunData] = React.useState(run);
    
    // Reset local state when navigating to a different run OR when loader brings newer data
    React.useEffect(() => {
        setRunData(prev => {
            // Always reset when switching to a different run
            if (prev.id !== run.id) {
                return run;
            }
            // Only update from loader if it has equal or newer revision
            if (run.revision >= prev.revision) {
                return run;
            }
            // Keep local state if it has newer data from real-time updates
            return prev;
        });
    }, [run]);
    
    // Subscribe to real-time updates via Phoenix Channel
    const { isConnected } = useRunChannel(run.id, {
        // Handle initial state when channel connects
        onJoin: React.useCallback((state) => {
            setRunData(prev => {
                // Only update if channel has newer data
                if (state.revision > prev.revision) {
                    return {
                        ...prev,
                        revision: state.revision,
                        data: state.data as Run["data"],
                    };
                }
                return prev;
            });
        }, []),
        // Handle real-time patch updates
        onUpdate: React.useCallback((update) => {
            setRunData(prev => ({
                ...prev,
                revision: update.revision,
                data: deepmerge(prev.data || {}, update.data || {}, overwriteArrays) as Run["data"],
            }));
        }, []),
    });

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{runData.name}</h1>
                {/* Real-time connection indicator */}
                <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                        isConnected
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                    }`}
                    title={isConnected ? "Connected to real-time sync" : "Connecting..."}
                >
                    <span
                        className={`w-1.5 h-1.5 rounded-full ${
                            isConnected ? "bg-green-500" : "bg-gray-400"
                        }`}
                    />
                    {isConnected ? "Live" : "..."}
                </span>
            </div>
            <RunInfographic data={runData.data} />
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4">
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span>Revision: {runData.revision}</span>
                    <span>Updated: {new Date(runData.updated_at).toLocaleString()}</span>
                </div>
                <details className="mt-4">
                    <summary className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                        View Raw Data
                    </summary>
                    <pre className="mt-2 p-4 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-300 rounded-md overflow-auto text-xs">
                        {JSON.stringify(runData.data, null, 2)}
                    </pre>
                </details>
            </div>
        </div>
    );
};
