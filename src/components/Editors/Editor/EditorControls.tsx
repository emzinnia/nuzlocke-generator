import * as React from "react";
import { Button, ButtonGroup } from "@blueprintjs/core";
import { useDispatch, useSelector } from "react-redux";
import { State } from "state";
import { editorStyles } from "./styles";
import { redoEditorHistory, syncStateFromHistory, undoEditorHistory } from "actions";
import { useEvent } from "utils/hooks";
import { HistoryPanel } from "./HistoryPanel";
import { reconstructPreviousState, reconstructNextState } from "reducers/editorHistory";
import { HotkeyIndicator } from "components/Common/Shared";

export function EditorControls({ editorDarkMode, minimized }) {
    const editorHistory = useSelector<State, State["editorHistory"]>(
        (state) => state.editorHistory,
    );
    const customHotkeys = useSelector<State, State["hotkeys"]>((state) => state.hotkeys);
    const dispatch = useDispatch();
    const [isHistoryPanelOpen, setIsHistoryPanelOpen] = React.useState(false);

    const canUndo = editorHistory?.past?.length > 0 && editorHistory?.present != null;
    const canRedo = editorHistory?.future?.length > 0 && editorHistory?.present != null;

    const dispatchUndo = React.useCallback(() => {
        if (!canUndo) return;

        const { past, present } = editorHistory;
        const lastEntry = past[past.length - 1];
        
        // Reconstruct the previous state by applying the backward diff
        const previousState = reconstructPreviousState(present, lastEntry);
        
        // Update history stack first, then sync all reducers
        dispatch(undoEditorHistory());
        dispatch(syncStateFromHistory(previousState));
    }, [editorHistory, canUndo, dispatch]);

    const dispatchRedo = React.useCallback(() => {
        if (!canRedo) return;

        const { future, present } = editorHistory;
        const nextEntry = future[0];
        
        // Reconstruct the next state by applying the forward diff
        const nextState = reconstructNextState(present, nextEntry);
        
        // Update history stack first, then sync all reducers
        dispatch(redoEditorHistory());
        dispatch(syncStateFromHistory(nextState));
    }, [editorHistory, canRedo, dispatch]);

    const handleUndo = React.useCallback((event: KeyboardEvent) => {
        if ((event.ctrlKey || event.metaKey) && event.key === "z") {
            event.preventDefault();
            dispatchUndo();
        }
    }, [dispatchUndo]);

    const handleRedo = React.useCallback((event: KeyboardEvent) => {
        // Support both Ctrl+Y and Ctrl+Shift+Z for redo
        if ((event.ctrlKey || event.metaKey) && (event.key === "y" || (event.key === "z"))) {
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
                display: minimized ? "none" : "block",
                position: "relative",
            }}
        >
            <ButtonGroup fill className={editorStyles.buttonGroup}>
                <Button
                    onClick={() => setIsHistoryPanelOpen(!isHistoryPanelOpen)}
                    minimal
                    fill
                    icon="history"
                    active={isHistoryPanelOpen}
                    title="View History"
                    data-testid="history-timeline-button"
                >
                    <HotkeyIndicator
                        hotkey={customHotkeys?.toggleHistoryTimeline ?? "h"}
                        showModifier={false}
                    />
                </Button>
                <Button
                    disabled={!canUndo}
                    onClick={dispatchUndo}
                    minimal
                    fill
                    icon="undo"
                    title="Undo"
                    style={{ fontSize: "0.6875rem" }}
                >
                    <HotkeyIndicator hotkey="Z" />
                </Button>
                <Button
                    disabled={!canRedo}
                    onClick={dispatchRedo}
                    minimal
                    fill
                    icon="redo"
                    title="Redo"
                    style={{ fontSize: "0.6875rem" }}
                >
                    <HotkeyIndicator hotkey="Y" />
                </Button>
            </ButtonGroup>
            <HistoryPanel
                isOpen={isHistoryPanelOpen}
                onClose={() => setIsHistoryPanelOpen(false)}
                editorDarkMode={editorDarkMode}
            />
        </div>
    );
}
