import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import {
    Popover,
    Button,
    Menu,
    Position,
    MenuItem,
    Intent,
} from "components/ui/shims";
import { ButtonGroup, Icon } from "components/ui";
import { useSelector, useDispatch } from "react-redux";
import { State } from "state";
import {
    updateNuzlocke,
    deleteNuzlocke,
    newNuzlocke,
    switchNuzlocke,
    replaceState,
    updateSwitchNuzlocke,
} from "actions";
import { feature, gameOfOriginToColor, getContrastColor, Styles } from "utils";
import { omit } from "ramda";
import { createStore } from "redux";
import { appReducers } from "reducers";
import { NuzlockeGameTags } from "./NuzlockeGameTags";
import { DeleteAlert } from "components/Editors/DataEditor/DeleteAlert";
import { HallOfFameDialog } from "./HallOfFameDialog";
import { showToast } from "components/Common/Shared/appToaster";
import { HotkeyIndicator } from "components/Common/Shared";
import { PokemonIcon } from "components/Pokemon/PokemonIcon";

interface NuzlockeSaveData {
    id: string;
    data: string;
    isCopy?: boolean;
}

const sortById = (a: NuzlockeSaveData, b: NuzlockeSaveData) =>
    a.id.localeCompare(b.id);

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

interface NuzlockeSaveItemProps {
    nuzlocke: NuzlockeSaveData;
    currentId: string;
    stateString: string;
    darkMode?: boolean;
    saves: NuzlockeSaveData[];
    onDelete: (deletionFn: () => void) => void;
    onToggleHof: () => void;
}

function NuzlockeSaveItem({
    nuzlocke,
    currentId,
    stateString,
    darkMode,
    saves,
    onDelete,
    onToggleHof,
}: NuzlockeSaveItemProps) {
    const dispatch = useDispatch();

    const id = nuzlocke.id;
    const { isCopy } = nuzlocke;
    const isCurrent = currentId === id;
    const data = nuzlocke.data;

    if (!data || data === "{}" || data === "{ }") {
        return null;
    }

    let parsedData: State | null = null;

    try {
        parsedData = isCurrent ? JSON.parse(stateString) : JSON.parse(data);
    } catch (_e) {
        // Ignore parse errors
    }

    if (!parsedData) {
        return null;
    }

    const game = parsedData?.game?.name;
    const color = getContrastColor(gameOfOriginToColor(game));

    const handleSwitch = () => {
        try {
            dispatch(updateSwitchNuzlocke(currentId, id, stateString));
            dispatch(replaceState(parsedData));
        } catch (e) {
            showToast({
                message: `Failed to switch nuzlockes. ${e}`,
                intent: Intent.DANGER,
            });
        }
    };

    const handleCopy = () => {
        try {
            if (typeof data !== "string") {
                throw new Error("Data is not in correct format.");
            }
            dispatch(newNuzlocke(data, { isCopy: true }));
        } catch (e) {
            showToast({
                message: `Failed to copy nuzlocke. ${e}`,
                intent: Intent.DANGER,
            });
        }
    };

    const handleDeleteClick = () => {
        const deletionFn = () => {
            try {
                dispatch(deleteNuzlocke(id));
                if (isCurrent) {
                    dispatch(switchNuzlocke(saves[0].id));
                    dispatch(replaceState(JSON.parse(saves[0].data)));
                }
            } catch (e) {
                showToast({
                    message: `Failed to delete nuzlocke. ${e}`,
                    intent: Intent.DANGER,
                });
            }
        };
        onDelete(deletionFn);
    };

    return (
        <div
            className={`
                flex flex-col items-center justify-between
                rounded-md
                p-2
                ${darkMode ? "border border-[#444]" : "border border-[#ccc]"}
                shadow-[0_0_4px_rgba(0,0,0,0.1)]
            `}
        >
            <div className="flex flex-row ">
                {parsedData?.pokemon
                    ?.filter((p) => p.status === "Team")
                    .map((poke) => (
                        <PokemonIcon key={poke.id} {...poke} />
                    ))}
            </div>
            <NuzlockeGameTags
                darkMode={darkMode}
                game={game}
                color={color}
                data={parsedData}
                isCurrent={isCurrent}
                isCopy={isCopy ?? false}
                size={((data.length * 2) / 1024).toFixed(2)}
            />

            <ButtonGroup>
                <Button
                    disabled={isCurrent}
                    icon="arrow-left-right"
                    onClick={handleSwitch}
                    minimal
                >
                    Switch
                </Button>
                <Button icon="clipboard" onClick={handleCopy}>
                    Copy
                </Button>
                <Button onClick={onToggleHof} icon="crown">
                    Hall of Fame
                </Button>
                <Button
                    disabled={saves.length === 1}
                    icon="trash"
                    intent={Intent.DANGER}
                    onClick={handleDeleteClick}
                    minimal
                >
                    Delete
                </Button>
            </ButtonGroup>

            <Icon
                style={{
                    transform: "rotate(90deg)",
                    marginLeft: "auto",
                    cursor: "pointer",
                }}
                icon="more"
            />
        </div>
    );
}

export function NuzlockeSave() {
    const dispatch = useDispatch();

    const nuzlockes = useSelector((state: State) => state.nuzlockes);
    const stateString = useSelector((state: State) =>
        JSON.stringify(stripEditorDarkModeFromState(state))
    );
    const darkMode = useSelector((state: State) => state.style.editorDarkMode);

    const [isDeletingNuzlocke, setIsDeletingNuzlocke] = useState(false);
    const [isHofOpen, setIsHofOpen] = useState(false);
    const [deletionFunction, setDeletionFunction] = useState<
        (() => void) | undefined
    >(undefined);

    const { currentId } = nuzlockes;
    const saves = [...nuzlockes.saves].sort(sortById);

    // Initialize nuzlocke if none exists
    useEffect(() => {
        if (!currentId || currentId === "") {
            dispatch(newNuzlocke(stateString, { isCopy: false }));
        }
    }, []);

    const toggleIsDeletingNuzlocke = useCallback(() => {
        setIsDeletingNuzlocke((prev) => !prev);
    }, []);

    const toggleIsHofOpen = useCallback(() => {
        setIsHofOpen((prev) => !prev);
    }, []);

    const handleNewNuzlocke = () => {
        dispatch(updateNuzlocke(currentId, stateString));
        const data = createStore(appReducers)?.getState();
        const preparedData = stripEditorDarkModeFromState(
            data as unknown as State
        );
        dispatch(newNuzlocke(JSON.stringify(preparedData), { isCopy: false }));
        dispatch(replaceState(data));
    };

    const handleDelete = (deletionFn: () => void) => {
        setDeletionFunction(() => () => {
            deletionFn();
            toggleIsDeletingNuzlocke();
        });
        setIsDeletingNuzlocke(true);
    };

    return (
        <div style={{ padding: "0.5rem" }}>
            <Button
                intent={Intent.SUCCESS}
                icon="add"
                style={{ marginBottom: "0.25rem" }}
                onClick={handleNewNuzlocke}
            >
                New Nuzlocke{" "}
                <HotkeyIndicator
                    hotkey="shift+n"
                    showModifier={false}
                    style={{ marginLeft: "0.35rem" }}
                />
            </Button>

            {saves.map((nuzlocke) => (
                <NuzlockeSaveItem
                    key={nuzlocke.id}
                    nuzlocke={nuzlocke}
                    currentId={currentId}
                    stateString={stateString}
                    darkMode={darkMode}
                    saves={saves}
                    onDelete={handleDelete}
                    onToggleHof={toggleIsHofOpen}
                />
            ))}

            <DeleteAlert
                onConfirm={deletionFunction}
                isOpen={isDeletingNuzlocke}
                onClose={toggleIsDeletingNuzlocke}
                warningText="This will delete your Nuzlocke save without any to retrieve it. Are you sure you want to do this?"
            />

            {feature.hallOfFame && (
                <HallOfFameDialog
                    icon="crown"
                    isOpen={isHofOpen}
                    onClose={toggleIsHofOpen}
                    title="Hall of Fame"
                />
            )}
        </div>
    );
}
