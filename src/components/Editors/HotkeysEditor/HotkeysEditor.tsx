import * as React from "react";
import { connect } from "react-redux";
import { BaseEditor } from "components/Editors/BaseEditor/BaseEditor";
import { listOfHotkeys, HotkeyList } from "utils";
import { Classes, Button, Intent } from "@blueprintjs/core";
import { State } from "state";
import { editHotkey, resetHotkey, resetAllHotkeys } from "actions";
import { HotkeyBindings } from "reducers/hotkeys";
import { HotkeyIndicator } from "components/Common/Shared/HotkeyIndicator";

export interface HotkeysEditorProps {
    customHotkeys: HotkeyBindings;
    editHotkey: typeof editHotkey;
    resetHotkey: typeof resetHotkey;
    resetAllHotkeys: typeof resetAllHotkeys;
}

export interface HotkeysEditorState {
    editingAction: string | null;
}

export class HotkeysEditorBase extends React.Component<
    HotkeysEditorProps,
    HotkeysEditorState
> {
    public state: HotkeysEditorState = {
        editingAction: null,
    };

    private keyListener: ((e: KeyboardEvent) => void) | null = null;

    public componentWillUnmount() {
        this.stopCapturing();
    }

    private startCapturing = (actionName: string) => {
        this.setState({ editingAction: actionName });

        this.keyListener = (e: KeyboardEvent) => {
            e.preventDefault();
            e.stopPropagation();

            // Allow Escape to cancel
            if (e.key === "Escape") {
                this.stopCapturing();
                return;
            }

            // Capture the key
            this.props.editHotkey({
                actionName,
                key: e.key,
            });
            this.stopCapturing();
        };

        document.addEventListener("keydown", this.keyListener);
    };

    private stopCapturing = () => {
        if (this.keyListener) {
            document.removeEventListener("keydown", this.keyListener);
            this.keyListener = null;
        }
        this.setState({ editingAction: null });
    };

    private getEffectiveKey = (hotkey: HotkeyList): string => {
        if (hotkey.onKeyUp && this.props.customHotkeys[hotkey.onKeyUp]) {
            return this.props.customHotkeys[hotkey.onKeyUp];
        }
        return hotkey.key;
    };

    private getEffectiveLabel = (hotkey: HotkeyList): string => {
        if (hotkey.onKeyUp && this.props.customHotkeys[hotkey.onKeyUp]) {
            return this.props.customHotkeys[hotkey.onKeyUp];
        }
        return hotkey.label ?? hotkey.key;
    };

    private isCustomized = (hotkey: HotkeyList): boolean => {
        return !!(hotkey.onKeyUp && this.props.customHotkeys[hotkey.onKeyUp]);
    };

    private hasAnyCustomizations = (): boolean => {
        return Object.keys(this.props.customHotkeys).length > 0;
    };

    private renderHotkeyItem = (item: HotkeyList) => {
        const isEditing = this.state.editingAction === item.onKeyUp;
        const isRemappable = !!item.onKeyUp;
        const isCustomized = this.isCustomized(item);
        const effectiveLabel = this.getEffectiveLabel(item);

        return (
            <li
                key={item.onKeyUp || item.key}
                style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "4px",
                    gap: "4px",
                }}
            >
                {isEditing ? (
                    <kbd
                        style={{
                            margin: "4px",
                            minWidth: "80px",
                            textAlign: "center",
                            backgroundColor: "#137cbd",
                            color: "white",
                        }}
                        className={Classes.CODE}
                    >
                        Press a key...
                    </kbd>
                ) : (
                    
                        <HotkeyIndicator hotkey={effectiveLabel} />
                  
                )}
                <div style={{ margin: "4px", flex: 1 }}>{item.comment}</div>
                {isRemappable && (
                    <div style={{ display: "flex", gap: "2px" }}>
                        {isEditing ? (
                            <Button
                                small
                                minimal
                                intent={Intent.DANGER}
                                onClick={this.stopCapturing}
                                title="Cancel"
                                icon="cross"
                            />
                        ) : (
                            <Button
                                small
                                minimal
                                intent={Intent.PRIMARY}
                                onClick={() =>
                                    this.startCapturing(item.onKeyUp!)
                                }
                                title="Edit key binding"
                                icon="edit"
                            />
                        )}
                        {isCustomized && !isEditing && (
                            <Button
                                small
                                minimal
                                intent={Intent.WARNING}
                                onClick={() =>
                                    this.props.resetHotkey(item.onKeyUp!)
                                }
                                title="Reset to default"
                                icon="reset"
                            />
                        )}
                    </div>
                )}
            </li>
        );
    };

    public render() {
        const remappableHotkeys = listOfHotkeys.filter((h) => h.onKeyUp);
        const nonRemappableHotkeys = listOfHotkeys.filter((h) => !h.onKeyUp);

        return (
            <BaseEditor icon="key-command" name="Hotkeys">
                {this.hasAnyCustomizations() && (
                    <div style={{ marginBottom: "8px", paddingLeft: "1rem" }}>
                        <Button
                            small
                            intent={Intent.WARNING}
                            onClick={this.props.resetAllHotkeys}
                            icon="reset"
                        >
                            Reset All to Defaults
                        </Button>
                    </div>
                )}
                <ul
                    style={{
                        listStyleType: "none",
                        paddingLeft: "1rem",
                        margin: 0,
                    }}
                    className="hotkey-list hotkey-list--remappable"
                >
                    {remappableHotkeys.map(this.renderHotkeyItem)}
                </ul>
                {nonRemappableHotkeys.length > 0 && (
                    <>
                        <div
                            style={{
                                paddingLeft: "1rem",
                                marginTop: "12px",
                                marginBottom: "4px",
                                fontSize: "12px",
                                opacity: 0.7,
                            }}
                        >
                            Mouse & Modifier Actions (not remappable)
                        </div>
                        <ul
                            style={{
                                listStyleType: "none",
                                paddingLeft: "1rem",
                                margin: 0,
                                opacity: 0.8,
                            }}
                            className="hotkey-list hotkey-list--static"
                        >
                            {nonRemappableHotkeys.map((item) => (
                                <li
                                    key={item.key}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        marginBottom: "4px",
                                    }}
                                >
                                    <kbd
                                        style={{
                                            margin: "4px",
                                            minWidth: "80px",
                                            textAlign: "center",
                                        }}
                                        className={Classes.CODE}
                                    >
                                        {item.label ?? item.key}
                                    </kbd>
                                    <div style={{ margin: "4px" }}>
                                        {item.comment}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </BaseEditor>
        );
    }
}

export const HotkeysEditor = connect(
    (state: Pick<State, keyof State>) => ({
        customHotkeys: state.hotkeys,
    }),
    {
        editHotkey,
        resetHotkey,
        resetAllHotkeys,
    },
)(HotkeysEditorBase);
