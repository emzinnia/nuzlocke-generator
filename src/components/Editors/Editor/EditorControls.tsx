import * as React from "react";
import { Button, ButtonGroup } from "@blueprintjs/core";
import { useDispatch, useSelector } from "react-redux";
import { State } from "state";
import { editorStyles } from "./styles";
import { redoEditorHistory, syncStateFromHistory, undoEditorHistory } from "actions";
import { useEvent } from "utils/hooks";
import { HistoryPanel } from "./HistoryPanel";

export function EditorControls({ editorDarkMode, minimized }) {
    const editorHistory = useSelector<State, State["editorHistory"]>(
        (state) => state.editorHistory,
    );
    const dispatch = useDispatch();
    const [isHistoryPanelOpen, setIsHistoryPanelOpen] = React.useState(false);

    const canUndo = editorHistory?.past?.length > 0 && editorHistory?.present != null;
    const canRedo = editorHistory?.future?.length > 0 && editorHistory?.present != null;
    const hasHistory = editorHistory?.past?.length > 0 || editorHistory?.future?.length > 0;

    const dispatchUndo = React.useCallback(() => {
        if (!canUndo) return;

        const { past } = editorHistory;
        const lastEntry = past[past.length - 1];
        
        // Get the previous state directly from the stored entry
        const previousState = lastEntry.previousState;
        
        // Update history stack first, then sync all reducers
        dispatch(undoEditorHistory());
        dispatch(syncStateFromHistory(previousState));
    }, [editorHistory, canUndo, dispatch]);

    const dispatchRedo = React.useCallback(() => {
        if (!canRedo) return;

        const { future } = editorHistory;
        const nextEntry = future[0];
        
        // Get the next state directly from the stored entry
        const nextState = nextEntry.nextState;
        
        // Update history stack first, then sync all reducers
        dispatch(redoEditorHistory());
        dispatch(syncStateFromHistory(nextState));
    }, [editorHistory, canRedo, dispatch]);

    const handleUndo = React.useCallback((event: KeyboardEvent) => {
        if ((event.ctrlKey || event.metaKey) && event.key === "z" && !event.shiftKey) {
            event.preventDefault();
            dispatchUndo();
        }
    }, [dispatchUndo]);

    const handleRedo = React.useCallback((event: KeyboardEvent) => {
        // Support both Ctrl+Y and Ctrl+Shift+Z for redo
        if ((event.ctrlKey || event.metaKey) && (event.key === "y" || (event.key === "z" && event.shiftKey))) {
            event.preventDefault();
            dispatchRedo();
        }
    }, [dispatchRedo]);

    useEvent("keydown", handleUndo);
    useEvent("keydown", handleRedo);

    return (
        <div
            className={editorStyles.historyControls}
            style={{
                width: minimized ? "0%" : "33%",
                background: editorDarkMode ? "#222" : "#fff",
                borderBottomColor: editorDarkMode ? "#000" : "#ccc",
                display: minimized ? "none" : "block",
                position: "relative",
            }}
        >
            <ButtonGroup fill className={editorStyles.buttonGroup}>
                <Button
                    disabled={!canUndo}
                    onClick={dispatchUndo}
                    minimal
                    fill
                    icon="undo"
                    title="Undo (Ctrl+Z)"
                />
                <Button
                    disabled={!canRedo}
                    onClick={dispatchRedo}
                    minimal
                    fill
                    icon="redo"
                    title="Redo (Ctrl+Y)"
                />
                <Button
                    disabled={!hasHistory}
                    onClick={() => setIsHistoryPanelOpen(!isHistoryPanelOpen)}
                    minimal
                    fill
                    icon="history"
                    active={isHistoryPanelOpen}
                    title="View History"
                />
            </ButtonGroup>
            <HistoryPanel
                isOpen={isHistoryPanelOpen}
                onClose={() => setIsHistoryPanelOpen(false)}
                editorDarkMode={editorDarkMode}
            />
        </div>
    );
}
