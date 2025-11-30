import * as React from "react";
import { useLoaderData } from "react-router-dom";
import type { Run } from "api/runs";

interface RunLoaderData {
    run: Run;
}

export const RunPage: React.FC = () => {
    const { run } = useLoaderData() as RunLoaderData;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{run.name}</h1>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4">
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span>Revision: {run.revision}</span>
                    <span>Updated: {new Date(run.updated_at).toLocaleString()}</span>
                </div>
                <details className="mt-4">
                    <summary className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                        View Raw Data
                    </summary>
                    <pre className="mt-2 p-4 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-300 rounded-md overflow-auto text-xs">
                        {JSON.stringify(run.data, null, 2)}
                    </pre>
                </details>
            </div>
        </div>
    );
};
