import * as React from "react";
import { useLoaderData, useRevalidator } from "react-router-dom";
import deepmerge from "deepmerge";
import type { Run } from "api/runs";
import { updateRun } from "api/runs";
import { useRunChannel } from "api/useRunChannel";
import { RunInfographic } from "./RunInfographic";
import { Button } from "components/Common/ui/Button";
import { Pencil, Check, X } from "lucide-react";

interface RunLoaderData {
    run: Run;
}

// Custom merge strategy: replace arrays instead of concatenating
const overwriteArrays: deepmerge.Options = {
    arrayMerge: (_target, source) => source,
};

export const RunPage: React.FC = () => {
    const { run } = useLoaderData() as RunLoaderData;
    const revalidator = useRevalidator();
    
    // Local state for real-time updates
    const [runData, setRunData] = React.useState(run);
    
    // Editable title state
    const [isEditingName, setIsEditingName] = React.useState(false);
    const [editedName, setEditedName] = React.useState(run.name);
    const [isSaving, setIsSaving] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    
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
        // Also reset edited name when run changes
        setEditedName(run.name);
        setIsEditingName(false);
    }, [run]);
    
    // Focus input when entering edit mode
    React.useEffect(() => {
        if (isEditingName && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditingName]);
    
    const handleStartEditing = () => {
        setEditedName(runData.name);
        setIsEditingName(true);
    };
    
    const handleCancelEditing = () => {
        setEditedName(runData.name);
        setIsEditingName(false);
    };
    
    const handleSaveName = async () => {
        const trimmedName = editedName.trim();
        if (!trimmedName || trimmedName === runData.name) {
            handleCancelEditing();
            return;
        }
        
        setIsSaving(true);
        try {
            const updatedRun = await updateRun(run.id, { name: trimmedName });
            setRunData(prev => ({ ...prev, name: updatedRun.name }));
            setIsEditingName(false);
            revalidator.revalidate();
        } catch (err) {
            console.error('Failed to rename run:', err);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSaveName();
        } else if (e.key === 'Escape') {
            handleCancelEditing();
        }
    };
    
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
        <div className="p-6 px-14">
            <div className="flex items-center gap-3 mb-4">
                {isEditingName ? (
                    <div className="flex items-center gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isSaving}
                            className="text-3xl font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-primary focus:outline-none focus:border-primary/80 disabled:opacity-50 px-1"
                        />
                        <Button
                            onClick={handleSaveName}
                            disabled={isSaving}
                            variant="ghost"
                            className="p-1.5 h-auto w-auto text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors"
                            title="Save"
                        >
                            <Check size={20} />
                        </Button>
                        <Button
                            onClick={handleCancelEditing}
                            disabled={isSaving}
                            variant="ghost"
                            className="p-1.5 h-auto w-auto text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Cancel"
                        >
                            <X size={20} />
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 group">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{runData.name}</h1>
                        <Button
                            onClick={handleStartEditing}
                            variant="ghost"
                            className="p-1.5 h-auto w-auto opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all"
                            title="Rename run"
                        >
                            <Pencil size={18} />
                        </Button>
                    </div>
                )}
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
                <Button
                    variant="secondary"
                    className="ml-auto inline-flex items-center gap-2 px-3 py-2 text-sm font-medium"
                    title="Download run"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                </Button>
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
