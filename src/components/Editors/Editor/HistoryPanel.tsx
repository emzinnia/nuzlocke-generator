import * as React from "react";
import { css, cx } from "emotion";
import { Button, Classes, Icon } from "@blueprintjs/core";
import { useDispatch, useSelector } from "react-redux";
import { State } from "state";
import { jumpToHistoryState, syncStateFromHistory } from "actions";
import { reconstructStateAtIndex } from "reducers/editorHistory";

const styles = {
    panel: css`
        position: absolute;
        top: 100%;
        left: 0;
        width: 200px;
        background: inherit;
        border: 1px solid #ccc;
        border-top: none;
        max-height: 300px;
        overflow-y: auto;
        z-index: 100;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border-radius: 0 0 4px 4px;
    `,
    panelDark: css`
        border-color: #444;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    `,
    list: css`
        list-style: none;
        margin: 0;
        padding: 0;
    `,
    item: css`
        padding: 8px 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        border-bottom: 1px solid #eee;
        font-size: 12px;
        transition: background 0.15s ease;

        &:last-child {
            border-bottom: none;
        }

        &:hover {
            background: rgba(0, 0, 0, 0.05);
        }
    `,
    itemDark: css`
        border-bottom-color: #333;

        &:hover {
            background: rgba(255, 255, 255, 0.1);
        }
    `,
    current: css`
        background: rgba(45, 114, 210, 0.15);
        font-weight: 600;

        &:hover {
            background: rgba(45, 114, 210, 0.2);
        }
    `,
    currentDark: css`
        background: rgba(45, 114, 210, 0.3);

        &:hover {
            background: rgba(45, 114, 210, 0.4);
        }
    `,
    pastItem: css`
        opacity: 0.7;
    `,
    futureItem: css`
        opacity: 0.5;
        font-style: italic;
    `,
    index: css`
        color: #888;
        font-size: 10px;
        min-width: 24px;
        text-align: right;
        font-family: monospace;
    `,
    label: css`
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    `,
    icon: css`
        opacity: 0.6;
    `,
    emptyState: css`
        padding: 16px;
        text-align: center;
        color: #888;
        font-size: 12px;
    `,
    header: css`
        padding: 8px 12px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #666;
        background: rgba(0, 0, 0, 0.03);
        border-bottom: 1px solid #eee;
    `,
    headerDark: css`
        background: rgba(255, 255, 255, 0.05);
        border-bottom-color: #333;
        color: #999;
    `,
};

interface HistoryPanelProps {
    isOpen: boolean;
    onClose: () => void;
    editorDarkMode: boolean;
}

export function HistoryPanel({ isOpen, onClose, editorDarkMode }: HistoryPanelProps) {
    const editorHistory = useSelector<State, State["editorHistory"]>(
        (state) => state.editorHistory
    );
    const dispatch = useDispatch();
    const panelRef = React.useRef<HTMLDivElement>(null);

    // Close panel when clicking outside
    React.useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        // Delay adding the listener to avoid immediate close from the button click
        const timeout = setTimeout(() => {
            document.addEventListener("mousedown", handleClickOutside);
        }, 0);

        return () => {
            clearTimeout(timeout);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const { past, present, future } = editorHistory;
    const hasHistory = past.length > 0 || future.length > 0;

    // Build the timeline items
    const timelineItems: Array<{
        index: number;
        type: "past" | "current" | "future";
        label: string;
    }> = [];

    // Add past states (oldest first)
    past.forEach((_, idx) => {
        timelineItems.push({
            index: idx,
            type: "past",
            label: `State ${idx + 1}`,
        });
    });

    // Add current state
    timelineItems.push({
        index: past.length,
        type: "current",
        label: "Current State",
    });

    // Add future states
    future.forEach((_, idx) => {
        timelineItems.push({
            index: past.length + 1 + idx,
            type: "future",
            label: `Redo ${idx + 1}`,
        });
    });

    const handleJumpTo = (index: number, type: "past" | "current" | "future") => {
        if (type === "current") return;

        // Reconstruct the target state using the helper function
        const targetState = reconstructStateAtIndex(editorHistory, index);
        
        if (targetState == null) return;

        // Dispatch jump action and sync state
        dispatch(jumpToHistoryState(index));
        dispatch(syncStateFromHistory(targetState));
        onClose();
    };

    return (
        <div
            ref={panelRef}
            className={cx(styles.panel, editorDarkMode && styles.panelDark)}
        >
            <div className={cx(styles.header, editorDarkMode && styles.headerDark)}>
                History Timeline
            </div>
            {!hasHistory && present == null ? (
                <div className={styles.emptyState}>
                    No history available yet
                </div>
            ) : (
                <ul className={styles.list}>
                    {timelineItems.map((item) => (
                        <li
                            key={item.index}
                            className={cx(
                                styles.item,
                                editorDarkMode && styles.itemDark,
                                item.type === "current" && styles.current,
                                item.type === "current" && editorDarkMode && styles.currentDark,
                                item.type === "past" && styles.pastItem,
                                item.type === "future" && styles.futureItem
                            )}
                            onClick={() => handleJumpTo(item.index, item.type)}
                            title={item.type === "current" ? "Current state" : `Click to jump to ${item.label}`}
                        >
                            <span className={styles.index}>{item.index + 1}</span>
                            <Icon
                                icon={
                                    item.type === "current"
                                        ? "record"
                                        : item.type === "past"
                                        ? "history"
                                        : "redo"
                                }
                                size={12}
                                className={styles.icon}
                            />
                            <span className={styles.label}>{item.label}</span>
                            {item.type !== "current" && (
                                <Icon icon="chevron-right" size={12} className={styles.icon} />
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
