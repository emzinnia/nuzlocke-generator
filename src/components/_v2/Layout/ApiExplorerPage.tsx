import * as React from "react";
import { ApiExplorer } from "./ApiExplorer";

export const ApiExplorerPage: React.FC = () => {
    return (
        <div className="p-6 max-w-4xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">API Explorer</h1>
            <ApiExplorer />
        </div>
    );
};

