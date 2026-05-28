import * as React from "react";
import {
    Popover,
    Button,
    Menu,
    Position,
    MenuItem,
    Intent,
    Icon,
} from "@blueprintjs/core";
import { connect } from "store/reactZustand";
import { State } from "state";
import {
    updateNuzlocke,
    deleteNuzlocke,
    newNuzlocke,
    switchNuzlocke,
    replaceState,
    updateSwitchNuzlocke,
    selectPokemon,
} from "actions";
import {
    feature,
    gameOfOriginToColor,
    getContrastColor,
    Styles,
} from "utils";
import { omit } from "ramda";
import { createDefaultState } from "store";
import { NuzlockeGameTags } from "./NuzlockeGameTags";
import { DeleteAlert } from "components/Editors/DataEditor/DeleteAlert";
import { HallOfFameDialog } from "./HallOfFameDialog";
import { showToast } from "components/Common/Shared/appToaster";
import { HotkeyIndicator } from "components/Common/Shared";
import { copyNuzlockeData, CopyNuzlockeDataMode } from "./copyNuzlockeData";

export interface NuzlockeSaveControlsProps {
    nuzlockes: State["nuzlockes"];
    darkMode?: boolean;
    state: string;
    updateNuzlocke: updateNuzlocke;
    deleteNuzlocke: deleteNuzlocke;
    newNuzlocke: newNuzlocke;
    switchNuzlocke: switchNuzlocke;
    replaceState: replaceState;
    updateSwitchNuzlocke: updateSwitchNuzlocke;
    selectPokemon: selectPokemon;
}

export interface NuzlockeSaveControlsState {
    isDeletingNuzlocke: boolean;
    isHofOpen: boolean;
    deletionFunction?: () => void;
}

const sort = (
    a: State["nuzlockes"]["saves"][number],
    b: State["nuzlockes"]["saves"][number],
) => a.id.localeCompare(b.id);

const stripEditorDarkModeFromState = (state: State) => {
    const baseState = omit(["nuzlockes", "editorHistory"], state) as {
        style?: Styles;
        [key: string]: unknown;
    };
    const { editorDarkMode: _omit, ...styleWithoutDarkMode } =
        baseState.style || {};

    return {
        ...baseState,
        style: styleWithoutDarkMode,
    };
};

export class NuzlockeSaveBase extends React.Component<
    NuzlockeSaveControlsProps,
    NuzlockeSaveControlsState
> {
    public state = {
        isDeletingNuzlocke: false,
        deletionFunction: undefined,
        isHofOpen: false,
    };

    public UNSAFE_componentWillMount() {
        const { nuzlockes, newNuzlocke, state } = this.props;
        if (!nuzlockes.currentId || nuzlockes.currentId === "") {
            newNuzlocke(state, { isCopy: false });
        }
    }

    private toggleIsDeletingNuzlocke = () => {
        this.setState((state) => ({
            isDeletingNuzlocke: !state.isDeletingNuzlocke,
        }));
    };

    private toggleIsHofOpen = () => {
        this.setState((state) => ({ isHofOpen: !state.isHofOpen }));
    };

    private copyFromNuzlocke = (
        sourceData: State,
        mode: CopyNuzlockeDataMode,
        successLabel: string,
    ) => {
        const { nuzlockes, state, replaceState, updateNuzlocke, selectPokemon } =
            this.props;
        const { currentId } = nuzlockes;

        try {
            const targetData = JSON.parse(state) as State;
            const nextData = copyNuzlockeData(targetData, sourceData, mode);
            const nextDataString = JSON.stringify(nextData);

            replaceState(nextData);
            selectPokemon(nextData.selectedId);
            updateNuzlocke(currentId, nextDataString);
            showToast({
                message: `${successLabel} copied to the current Nuzlocke.`,
                intent: Intent.SUCCESS,
            });
        } catch (e) {
            showToast({
                message: `Failed to copy data to the current Nuzlocke. ${e}`,
                intent: Intent.DANGER,
            });
        }
    };

    public renderMenu() {
        const {
            state,
            replaceState,
            updateSwitchNuzlocke,
            newNuzlocke,
            updateNuzlocke,
            deleteNuzlocke,
            switchNuzlocke,
            darkMode,
        } = this.props;
        const { nuzlockes } = this.props;
        const { currentId } = this.props.nuzlockes;
        const { isHofOpen, isDeletingNuzlocke, deletionFunction } = this.state;
        const saves = nuzlockes.saves.sort(sort);

        return (
            <div
                style={{
                    padding: "0.5rem",
                }}
            >
                <Button
                    intent={Intent.SUCCESS}
                    icon="add"
                    style={{ marginBottom: "0.25rem" }}
                    onClick={() => {
                        updateNuzlocke(currentId, state);
                        const data = createDefaultState();
                        const preparedData = stripEditorDarkModeFromState(
                            data,
                        );
                        newNuzlocke(JSON.stringify(preparedData), {
                            isCopy: false,
                        });
                        replaceState(data);
                    }}
                >
                    New Nuzlocke{" "}
                    <HotkeyIndicator
                        hotkey="shift+n"
                        showModifier={false}
                        style={{ marginLeft: "0.35rem" }}
                    />
                </Button>
                {saves.map((nuzlocke) => {
                    const id = nuzlocke.id;
                    console.log(nuzlocke.id);
                    const { isCopy } = nuzlocke;
                    const isCurrent = currentId === id;
                    const data = nuzlocke.data;

                    if (!data || data === "{}" || data === "{ }") {
                        return null;
                    }

                    let parsedData: State | null = null;

                    try {
                        parsedData = isCurrent
                            ? JSON.parse(state)
                            : JSON.parse(data);
                        //parsedData = JSON.parse(data);
                    } catch (_e) {
                        // Ignore parse errors
                    }

                    if (!parsedData) {
                        return null;
                    }

                    const game = parsedData?.game?.name;
                    const color = getContrastColor(gameOfOriginToColor(game));

                    return (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                border: darkMode
                                    ? "1px solid #444"
                                    : "1px solid #ccc",
                                padding: "0.5rem",
                                borderRadius: "0.25rem",
                                boxShadow: "0 0 4px rgba(0,0,0,0.1)",
                                marginBottom: "2px",
                                justifyContent: "space-between",
                                // width: isMobile() ? '80%' : '100%',
                            }}
                            key={id}
                        >
                            <NuzlockeGameTags
                                darkMode={darkMode}
                                game={game}
                                color={color}
                                data={parsedData}
                                isCurrent={isCurrent}
                                isCopy={Boolean(isCopy)}
                                size={((data.length * 2) / 1024).toFixed(2)}
                            />
                            <DeleteAlert
                                onConfirm={deletionFunction}
                                isOpen={isDeletingNuzlocke}
                                onCancel={this.toggleIsDeletingNuzlocke}
                                warningText="This will delete your Nuzlocke save without any to retrieve it. Are you sure you want to do this?"
                            />
                            {feature.hallOfFame && (
                                <HallOfFameDialog
                                    icon={"crown"}
                                    isOpen={isHofOpen}
                                    onClose={this.toggleIsHofOpen}
                                    title="Hall of Fame"
                                />
                            )}
                            <Popover
                                position={Position.BOTTOM_RIGHT}
                                content={
                                    <Menu>
                                        <MenuItem
                                            shouldDismissPopover={false}
                                            disabled={isCurrent}
                                            icon="swap-horizontal"
                                            onClick={() => {
                                                try {
                                                    updateSwitchNuzlocke(
                                                        currentId,
                                                        id,
                                                        state,
                                                    );
                                                    replaceState(parsedData);
                                                } catch (e) {
                                                    showToast({
                                                        message: `Failed to switch nuzlockes. ${e}`,
                                                        intent: Intent.DANGER,
                                                    });
                                                }
                                            }}
                                            text="Switch to this Nuzlocke"
                                        />
                                        <MenuItem
                                            shouldDismissPopover={false}
                                            icon="clipboard"
                                            onClick={() => {
                                                try {
                                                    if (
                                                        typeof data !== "string"
                                                    ) {
                                                        throw new Error(
                                                            "Data is not in correct format.",
                                                        );
                                                    }
                                                    newNuzlocke(data, {
                                                        isCopy: true,
                                                    });
                                                } catch (e) {
                                                    showToast({
                                                        message: `Failed to copy nuzlocke. ${e}`,
                                                        intent: Intent.DANGER,
                                                    });
                                                }
                                            }}
                                            text="Copy this Nuzlocke"
                                        ></MenuItem>
                                        <MenuItem
                                            shouldDismissPopover={false}
                                            disabled={isCurrent}
                                            icon="duplicate"
                                            onClick={() =>
                                                this.copyFromNuzlocke(
                                                    parsedData,
                                                    "pokemon",
                                                    "Pokémon",
                                                )
                                            }
                                            text="Copy Pokémon to Current Nuzlocke"
                                        />
                                        <MenuItem
                                            shouldDismissPopover={false}
                                            disabled={isCurrent}
                                            icon="box"
                                            onClick={() =>
                                                this.copyFromNuzlocke(
                                                    parsedData,
                                                    "boxes",
                                                    "Boxes",
                                                )
                                            }
                                            text="Copy Boxes to Current Nuzlocke"
                                        />
                                        <MenuItem
                                            shouldDismissPopover={false}
                                            disabled={isCurrent}
                                            icon="inbox"
                                            onClick={() =>
                                                this.copyFromNuzlocke(
                                                    parsedData,
                                                    "boxes-and-pokemon",
                                                    "Boxes and Pokémon",
                                                )
                                            }
                                            text="Copy Boxes and Pokémon to Current Nuzlocke"
                                        />
                                        {feature.hallOfFame && (
                                            <MenuItem
                                                shouldDismissPopover={false}
                                                onClick={this.toggleIsHofOpen}
                                                icon={"crown"}
                                                text="Submit to Hall of Fame"
                                            />
                                        )}
                                        <MenuItem
                                            disabled={saves.length === 1}
                                            shouldDismissPopover={false}
                                            icon="trash"
                                            intent={Intent.DANGER}
                                            onClick={() => {
                                                const deletionFunction = () => {
                                                    try {
                                                        deleteNuzlocke(id);
                                                        if (isCurrent) {
                                                            switchNuzlocke(
                                                                saves[0].id,
                                                            );
                                                            replaceState(
                                                                JSON.parse(
                                                                    saves[0]
                                                                        .data,
                                                                ),
                                                            );
                                                        }
                                                        this.toggleIsDeletingNuzlocke();
                                                    } catch (e) {
                                                        showToast({
                                                            message: `Failed to delete nuzlocke. ${e}`,
                                                            intent: Intent.DANGER,
                                                        });
                                                    }
                                                };
                                                this.setState({
                                                    deletionFunction,
                                                    isDeletingNuzlocke: true,
                                                });
                                            }}
                                            text="Delete Nuzlocke"
                                        />
                                    </Menu>
                                }
                            >
                                <Icon
                                    style={{
                                        transform: "rotate(90deg)",
                                        marginLeft: "auto",
                                        cursor: "pointer",
                                    }}
                                    icon="more"
                                />
                            </Popover>
                        </div>
                    );
                })}
            </div>
        );
    }

    public render() {
        return this.renderMenu();
    }
}

export const NuzlockeSave = connect(
    (state: State) => ({
        nuzlockes: state.nuzlockes,
        state: JSON.stringify(stripEditorDarkModeFromState(state)),
        darkMode: state.style.editorDarkMode,
    }),
    {
        updateNuzlocke,
        newNuzlocke,
        deleteNuzlocke,
        switchNuzlocke,
        replaceState,
        updateSwitchNuzlocke,
        selectPokemon,
    },
)(NuzlockeSaveBase);
