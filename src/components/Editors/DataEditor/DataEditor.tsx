import * as React from "react";
import { connect } from "react-redux";
import {
    Button,
    ButtonGroup,
    Dialog,
    Callout,
    TextArea,
    Intent,
    Switch,
    Classes,
    HTMLSelect,
} from "@blueprintjs/core";
import { PokemonIcon } from "components/Pokemon/PokemonIcon";
import { ErrorBoundary, HotkeyIndicator } from "components/Common/Shared";
import { v4 as uuid } from "uuid";
import { persistor } from "store";
import { newNuzlocke, replaceState } from "actions";
import { Game, Pokemon, Trainer } from "models";
import { omit } from "ramda";
import { BaseEditor } from "components/Editors/BaseEditor/BaseEditor";
import { State } from "state";
import { noop } from "redux-saga/utils";
import {
    gameOfOriginToColor,
    GameSaveFormat,
    Styles,
    Game as GameName,
} from "utils";
import { DeleteAlert } from "./DeleteAlert";
import { isEmpty } from "utils/isEmpty";
import { showToast } from "components/Common/Shared/appToaster";
// @TODO: fix codegen imports
// import codegen from 'codegen.macro';
import { BoxMappings } from "parsers/utils/boxMappings";
import SaveFileWorker from "parsers/worker?worker";
import { cx } from "emotion";

export interface DataEditorProps {
    state: State;
    replaceState: replaceState;
    newNuzlocke: newNuzlocke;
}

export interface DataEditorState {
    isOpen: boolean;
    isClearAllDataOpen: boolean;
    mode: "import" | "export";
    data: string;
    href: string;
    selectedGame: GameSaveFormat;
    mergeDataMode: boolean;
    showSaveFileUI: boolean;
    overrideImport: boolean;
    isSettingsOpen: boolean;
    boxMappings: BoxMappings;
}

const getGameNumberOfBoxes = (game: GameSaveFormat) => {
    switch (game) {
        case "Auto":
            // Default to 14 so box mappings are available for Gen 2/3; Gen 1 will only read the first 12.
            return 14;
        case "RBY":
            return 12;
        case "GS":
        case "Crystal":
            return 14;
        case "Emerald":
        case "RS":
        case "FRLG":
            return 14;
        default:
            return 12;
    }
};

const isValidJSON = (data: string): boolean => {
    try {
        JSON.parse(data);
        return true;
    } catch {
        return false;
    }
};

// This is to handle very weird/rare edge cases where data
// can be parsed, but then in turn has to be "double-parsed"
const handleExceptions = (data: State | Record<string, unknown>) => {
    let updated: Partial<State> = {};

    if (typeof (data as State).pokemon === "string") {
        showToast({
            message: "Issue with data detected. Attempting to fix...",
            intent: Intent.DANGER,
        });
        for (const prop in data) {
            try {
                updated = {
                    ...updated,
                    [prop]: JSON.parse((data as Record<string, string>)[prop]),
                };
            } catch {
                console.log(`Failed to parse on ${prop}`);
            }
        }
    }

    return isEmpty(updated) ? data : updated;
};

const stripEditorDarkModeForExport = (state: State) => {
    const baseState = omit(["router", "._persist", "editorHistory"], state) as {
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

export interface SaveGameSettingsDialogProps {
    onMergeDataChange: () => void;
    mergeDataMode: boolean;
    boxes: State["box"];
    selectedGame: GameSaveFormat;
    boxMappings: BoxMappings;
    setBoxMappings: ({ key, status }) => void;
}

// Quick and dirty method of getting Array w n.length
const generateArray = (n: number) => {
    const arr: BoxMappings = [];
    for (let i = 1; i < n + 1; i++) {
        if (i === 2) {
            arr.push({ key: i, status: "Dead" });
        } else {
            arr.push({ key: i, status: "Boxed" });
        }
    }
    return arr;
};

const generateBoxMappingsDefault = (saveFormat) =>
    generateArray(getGameNumberOfBoxes(saveFormat));

export function BoxSelect({
    boxes,
    value,
    boxKey,
    setBoxMappings,
}: {
    boxes: State["box"];
    value: string;
    boxKey: number;
    setBoxMappings: SaveGameSettingsDialogProps["setBoxMappings"];
}) {
    return (
        <HTMLSelect
            value={value}
            onChange={(e) =>
                setBoxMappings({ key: boxKey, status: e.target.value })
            }
        >
            {boxes.map((box) => (
                <option key={box.id} value={box.name}>
                    {box.name}
                </option>
            ))}
        </HTMLSelect>
    );
}

export function SaveGameSettingsDialog({
    onMergeDataChange,
    mergeDataMode,
    boxes,
    boxMappings,
    setBoxMappings,
}: SaveGameSettingsDialogProps) {
    // const select = (
    //     <Select
    //         items={boxes}
    //         onItemSelect={() => {}}
    //     >
    //     </Select>
    // );

    return (
        <div className={cx(Classes.DIALOG_BODY, "has-nice-scrollbars")}>
            <Switch
                labelElement={
                    <>
                        <strong>Merge Data?</strong>
                        <p className={Classes.TEXT_MUTED}>
                            Merges your current data with that of the save file,
                            using an ID match algorithm. Disabling this will
                            overwrite your current data with that from the save
                            file. NOTE: this method of determining IDs is based
                            off IVs in Gen I &amp; II.
                        </p>
                    </>
                }
                checked={mergeDataMode}
                onChange={onMergeDataChange}
            />

            <div
                style={{
                    height: "60vh",
                    overflow: "auto",
                    display: "flex",
                    flexDirection: "column",
                    flexWrap: "wrap",
                }}
                className="has-nice-scrollbars"
            >
                {boxMappings.map((value) => {
                    return (
                        <div key={value.key} style={{ padding: "0.25rem" }}>
                            <BoxSelect
                                boxKey={value.key}
                                setBoxMappings={setBoxMappings}
                                value={value.status}
                                boxes={boxes}
                            />
                            <div
                                className={Classes.BUTTON}
                                style={{
                                    marginLeft: "0.25rem",
                                    cursor: "default",
                                    width: "8rem",
                                }}
                            >{`Box ${value.key}`}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export class DataEditorBase extends React.Component<
    DataEditorProps,
    DataEditorState
> {
    public textarea: HTMLTextAreaElement | null;
    public fileInput: HTMLInputElement | null;
    public nuzlockeJsonFileInput: HTMLInputElement | null;

    public constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isClearAllDataOpen: false,
            mode: "export",
            data: "",
            href: "",
            selectedGame: "Auto",
            mergeDataMode: true,
            showSaveFileUI: false,
            overrideImport: true,
            isSettingsOpen: false,
            boxMappings: [],
        };
    }

    public componentDidMount() {
        this.setState((state) => ({
            boxMappings: generateBoxMappingsDefault(state.selectedGame),
        }));
    }

    private uploadJSON = (e) => {
        if (isValidJSON(e.target.value)) {
            this.setState({ data: e.target.value });
        } else {
            showToast({
                message: "Failed to parse invalid JSON",
                intent: Intent.DANGER,
            });
        }
    };

    private uploadNuzlockeJsonFile = () => {
        const file = this.nuzlockeJsonFileInput?.files?.[0];
        if (!file) return;
        const reader = new FileReader();

        reader.readAsText(file, "utf-8");
        reader.addEventListener("load", (event) => {
            const file = event?.target?.result;
            const data = file;
            // @ts-expect-error - FileReader result type mismatch
            this.setState({ data });
        });
    };

    private confirmImport = () => {
        let cmm: { customMoveMap: State["customMoveMap"] } = {
            customMoveMap: [],
        };
        const override = this.state.overrideImport;
        const data = handleExceptions(JSON.parse(this.state.data));
        const nuz = this.props.state;
        // @NOTE this prevents previously undefined states from blowing up the app
        const safeguards = {
            customTypes: [],
            customMoveMap: [],
            stats: [],
            excludedAreas: [],
            customAreas: [],
        };
        if (!Array.isArray(data.customMoveMap)) {
            noop();
        } else {
            cmm = { customMoveMap: data.customMoveMap };
        }
        this.props.replaceState({
            ...safeguards,
            ...(override ? data : nuz),
            ...cmm,
        });
        this.props.newNuzlocke(this.state.data, { isCopy: false });
        this.writeAllData();
        this.setState({ isOpen: false });
    };

    private importState = () => {
        this.setState({ mode: "import" });
        this.setState({ isOpen: true });
    };

    private exportState = (state) => {
        this.setState({
            mode: "export",
        });
        this.setState({ isOpen: true });
        const stateForExport = stripEditorDarkModeForExport(state);
        this.setState({
            href: `data:text/plain;charset=utf-8,${encodeURIComponent(
                JSON.stringify(stateForExport),
            )}`,
        });
    };

    private renderTeam(data: string) {
        let d: { pokemon?: Pokemon[] };
        try {
            d = handleExceptions(JSON.parse(data)) as { pokemon?: Pokemon[] };
        } catch {
            d = {};
        }

        if (d.pokemon) {
            return (
                <div
                    className="team-icons"
                    style={{
                        background: "rgba(0, 0, 0, 0.1)",
                        borderRadius: ".25rem",
                        margin: ".25rem",
                        marginTop: ".5rem",
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    {d?.pokemon
                        ?.filter((p) => p.status === "Team")
                        ?.map((p) => {
                            return <PokemonIcon key={p.id} {...p} />;
                        })}
                </div>
            );
        } else {
            return null;
        }
    }

    private static determineGame({
        isYellow,
        selectedGame,
    }: {
        isYellow?: boolean;
        selectedGame?: GameSaveFormat;
    }): Game {
        if (isYellow) return { name: "Yellow", customName: "" };
        if (selectedGame === "GS") return { name: "Gold", customName: "" };
        if (selectedGame === "Crystal")
            return { name: "Crystal", customName: "" };
        if (selectedGame === "RS") return { name: "Ruby", customName: "" };
        if (selectedGame === "FRLG") return { name: "FireRed", customName: "" };
        if (selectedGame === "Emerald")
            return { name: "Emerald", customName: "" };
        return { name: "Red", customName: "" };
    }

    private static pokeMerge = (
        pokemonListA: Pokemon[],
        pokemonListB: Pokemon[],
    ) => {
        return pokemonListB.map((poke) => {
            const id = poke.id;
            const aListPoke = pokemonListA.find((p) => p.id === id);
            if (aListPoke) {
                return {
                    ...aListPoke,
                    ...poke,
                };
            } else {
                return poke;
            }
        });
    };

    private uploadFile = (replaceState, state) => () => {
        const t0 = performance.now();
        // @NOTE: this is a gross work-around a bug with tests and import.meta.url
        // const worker = new Worker(new URL('parsers/worker.ts', codegen`module.exports = import.meta.env.MODE === "test" ? "" : "import.meta.url"`));

        const worker = new SaveFileWorker();

        if (!this.fileInput?.files?.[0]) return;
        const file = this.fileInput.files[0];
        const reader = new FileReader();
        const componentState = this.state;

        console.log(file, reader, componentState, worker);

        reader.readAsArrayBuffer(file);

        reader.addEventListener("load", async function () {
            const save = new Uint8Array(this.result as ArrayBuffer);

            worker.postMessage({
                selectedGame: componentState.selectedGame,
                save,
                boxMappings: componentState.boxMappings,
                fileName: file.name,
            });

            worker.onmessage = (
                e: MessageEvent<{
                    pokemon: Pokemon[];
                    isYellow?: boolean;
                    trainer: Trainer;
                    detectedGame?: Game;
                    detectedSaveFormat?: GameSaveFormat;
                }>,
            ) => {
                const result = e.data;
                const mergedPokemon = componentState.mergeDataMode
                    ? DataEditorBase.pokeMerge(
                          state.pokemon,
                          result.pokemon as Pokemon[],
                      )
                    : result.pokemon;
                const game =
                    result.detectedGame ??
                    DataEditorBase.determineGame({
                        isYellow: result.isYellow,
                        selectedGame: componentState.selectedGame,
                    });
                const bgColor = gameOfOriginToColor(game.name as GameName);
                const data = {
                    game,
                    pokemon: mergedPokemon,
                    trainer: result.trainer,
                };
                console.log("data", data);
                const nextStyle: Styles = bgColor
                    ? {
                          ...state.style,
                          bgColor,
                      }
                    : state.style;

                // Back-compat for older saves that may have used `style.backgroundColor`.
                // `Styles` doesn't include it, but we can preserve/overwrite it if present.
                type LegacyStyle = Styles & { backgroundColor?: string };
                if (bgColor && "backgroundColor" in (state.style as LegacyStyle)) {
                    (nextStyle as LegacyStyle).backgroundColor = bgColor;
                }

                const newState = { ...state, ...data, style: nextStyle };
                replaceState(newState);
                if (result.detectedGame) {
                    showToast({
                        message: `Detected game: ${result.detectedGame.name}`,
                        intent: Intent.PRIMARY,
                    });
                }
            };

            worker.onmessageerror = (err) => {
                showToast({
                    message: `Failed to parse save file. ${err}`,
                    intent: Intent.DANGER,
                });
                console.error(err);
            };

            const t1 = performance.now();
            console.info(
                `Call: ${t1 - t0} ms on ${componentState.selectedGame} save file type`,
            );
        });
    };

    private clearAllData = () => {
        persistor.purge();
        window.location.reload();
    };

    private writeAllData = () => {
        Promise.resolve(persistor.flush())
            .then(() => {
                showToast({
                    message: "Saved",
                    intent: Intent.SUCCESS,
                });
            })
            .catch((err) => {
                console.error("Save failed", err);
                showToast({
                    message: "Save failed",
                    intent: Intent.DANGER,
                });
            });
    };

    private toggleClearingData = () =>
        this.setState({ isClearAllDataOpen: !this.state.isClearAllDataOpen });

    private renderSaveFileUI() {
        const gen3Enabled = import.meta.env.VITE_GEN3_SAVES === "true";
        const allowedGames: GameSaveFormat[] = gen3Enabled
            ? ["RBY", "GS", "Crystal", "RS", "FRLG", "Emerald"]
            : ["RBY", "GS", "Crystal"];

        return (
            <>
                <Button
                    onClick={() => {
                        this.setState({
                            showSaveFileUI: !this.state.showSaveFileUI,
                        });
                    }}
                >
                    Advanced Import
                </Button>
                <div
                    className="data-editor-save-file-form"
                    style={{
                        alignItems: "center",
                        flexWrap: "wrap",
                        margin: "0.25rem",
                        display: this.state.showSaveFileUI ? "flex" : "none",
                        borderRadius: "0.25rem",
                        padding: "0.25rem",
                    }}
                >
                    <div
                        className={cx(Classes.LABEL, Classes.INLINE)}
                        style={{ padding: ".25rem 0", paddingBottom: ".5rem" }}
                    >
                        <HTMLSelect
                            value={this.state.selectedGame}
                            onChange={(e) => {
                                this.setState({
                                    selectedGame: e.target
                                        .value as GameSaveFormat,
                                    boxMappings: generateBoxMappingsDefault(
                                        e.target.value as GameSaveFormat,
                                    ),
                                });
                            }}
                        >
                            <option key={"Auto"} value={"Auto"}>
                                Auto
                            </option>
                            {allowedGames.map((game) => (
                                <option key={game} value={game}>
                                    {game}
                                </option>
                            ))}
                        </HTMLSelect>
                    </div>

                    <div
                        className={cx(Classes.LABEL, Classes.INLINE)}
                        style={{
                            padding: ".25rem 0",
                            paddingBottom: ".5rem",
                            marginLeft: ".25rem",
                        }}
                    >
                        <input
                            style={{ padding: ".25rem" }}
                            className={Classes.FILE_INPUT}
                            ref={(ref) => (this.fileInput = ref)}
                            onChange={this.uploadFile(
                                this.props.replaceState,
                                this.props.state,
                            )}
                            type="file"
                            id="file"
                            name="file"
                            accept=".sav"
                        />
                    </div>

                    <Button
                        onClick={() => this.setState({ isSettingsOpen: true })}
                        minimal
                        intent={Intent.PRIMARY}
                        icon="cog"
                    >
                        Options
                    </Button>

                    <Dialog
                        isOpen={this.state.isSettingsOpen}
                        onClose={() => this.setState({ isSettingsOpen: false })}
                        title={"Save Upload Settings"}
                        className={
                            this.props.state.style.editorDarkMode
                                ? Classes.DARK
                                : ""
                        }
                        icon="floppy-disk"
                    >
                        <SaveGameSettingsDialog
                            mergeDataMode={this.state.mergeDataMode}
                            onMergeDataChange={() =>
                                this.setState({
                                    mergeDataMode: !this.state.mergeDataMode,
                                })
                            }
                            boxes={this.props.state.box}
                            selectedGame={this.state.selectedGame}
                            boxMappings={this.state.boxMappings}
                            setBoxMappings={({ key, status }) => {
                                console.log("setBoxMappings:", key, status);
                                this.setState(({ boxMappings }) => {
                                    const newBoxMappings = boxMappings.map(
                                        ({
                                            key: boxKey,
                                            status: boxStatus,
                                        }) => {
                                            if (key === boxKey) {
                                                return { key, status };
                                            }
                                            return {
                                                key: boxKey,
                                                status: boxStatus,
                                            };
                                        },
                                    );
                                    return {
                                        boxMappings: newBoxMappings,
                                    };
                                });
                            }}
                        />
                    </Dialog>
                </div>
            </>
        );
    }

    public render() {
        return (
            <BaseEditor icon="database" name="Data">
                <DeleteAlert
                    onConfirm={this.clearAllData}
                    isOpen={this.state.isClearAllDataOpen}
                    onCancel={this.toggleClearingData}
                />
                <Dialog
                    isOpen={this.state.isOpen}
                    onClose={() => this.setState({ isOpen: false })}
                    title={
                        this.state.mode === "export"
                            ? "Exported Nuzlocke Save"
                            : "Import Nuzlocke Save"
                    }
                    className={
                        this.props.state.style.editorDarkMode
                            ? Classes.DARK
                            : ""
                    }
                    icon="floppy-disk"
                >
                    {this.state.mode === "export" ? (
                        <>
                            <Callout>
                                Copy this and paste it somewhere safe!
                            </Callout>
                            <div
                                style={{ height: "40vh", overflow: "auto" }}
                                className={cx(
                                    Classes.DIALOG_BODY,
                                    "has-nice-scrollbars",
                                )}
                            >
                                <span
                                    suppressContentEditableWarning={true}
                                    contentEditable={true}
                                >
                                    {JSON.stringify(this.props.state, null, 2)}
                                </span>
                            </div>
                            <div className={Classes.DIALOG_FOOTER}>
                                <a
                                    href={this.state.href}
                                    download={`nuzlocke_${
                                        this.props?.state?.trainer?.title
                                            ?.toLowerCase()
                                            .replace(/\s/g, "-") ||
                                        this.props?.state?.game?.name
                                            ?.toLowerCase()
                                            .replace(/\s/g, "-") ||
                                        ""
                                    }_${uuid().slice(0, 4)}.json`}
                                >
                                    <Button
                                        icon={"download"}
                                        intent={Intent.PRIMARY}
                                    >
                                        Download
                                    </Button>
                                </a>
                            </div>
                        </>
                    ) : (
                        <>
                            <div
                                className={cx(
                                    Classes.DIALOG_BODY,
                                    "has-nice-scrollbars",
                                )}
                            >
                                <TextArea
                                    className={cx(
                                        "custom-css-input",
                                        Classes.FILL,
                                    )}
                                    onChange={this.uploadJSON}
                                    placeholder="Paste nuzlocke.json contents here, or use the file uploader"
                                    value={this.state.data}
                                    large={true}
                                />
                                <ErrorBoundary>
                                    {this.renderTeam(this.state.data)}
                                </ErrorBoundary>
                            </div>
                            <div className={Classes.DIALOG_FOOTER}>
                                {/*<Checkbox
                                    checked={this.state.overrideImport}
                                    label='Overwrite current save data (will otherwise merge into nuzlocke saves)'
                                    onChange={e => this.setState({ overrideImport: e.currentTarget.checked })}
                                />*/}
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <input
                                        style={{ padding: ".25rem" }}
                                        className={Classes.FILE_INPUT}
                                        ref={(ref) =>
                                            (this.nuzlockeJsonFileInput = ref)
                                        }
                                        onChange={this.uploadNuzlockeJsonFile}
                                        type="file"
                                        id="jsonFile"
                                        name="jsonFile"
                                        accept=".json"
                                    />
                                    <Button
                                        icon="tick"
                                        intent={
                                            this.state.data === ""
                                                ? Intent.NONE
                                                : Intent.SUCCESS
                                        }
                                        onClick={this.confirmImport}
                                        disabled={
                                            this.state.data === ""
                                                ? true
                                                : false
                                        }
                                        text="Confirm"
                                        style={{
                                            marginLeft: "auto",
                                        }}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </Dialog>

                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.25rem", margin: "0.25rem" }}>
                    <ButtonGroup>
                        <Button
                            data-testid="import-data-button"
                            onClick={() => this.importState()}
                            icon="import"
                            intent={Intent.PRIMARY}
                        >
                            Import Data{" "}
                            <HotkeyIndicator
                                hotkey="i"
                                showModifier={false}
                                style={{ marginLeft: "0.35rem" }}
                            />
                        </Button>
                        <Button
                            data-testid="export-data-button"
                            onClick={() => this.exportState(this.props.state)}
                            icon="export"
                        >
                            Export Data{" "}
                            <HotkeyIndicator
                                hotkey="e"
                                showModifier={false}
                                style={{ marginLeft: "0.35rem" }}
                            />
                        </Button>
                    </ButtonGroup>

                    <ButtonGroup>
                        <Button
                            icon="folder-open"
                            data-testid="import-save-file-button"
                            onClick={() => this.fileInput?.click()}
                        >
                            Import Save File{" "}
                            <HotkeyIndicator
                                hotkey="o"
                                showModifier={false}
                                style={{ marginLeft: "0.35rem" }}
                            />
                        </Button>
                    </ButtonGroup>

                    <ButtonGroup>
                        <Button
                            intent={Intent.SUCCESS}
                            onClick={this.writeAllData}
                            icon="floppy-disk"
                        >
                            Force Save{" "}
                            <HotkeyIndicator
                                hotkey="s"
                                showModifier={false}
                                style={{ marginLeft: "0.35rem" }}
                            />
                        </Button>
                        <Button
                            icon="trash"
                            onClick={this.toggleClearingData}
                            intent={Intent.DANGER}
                        >
                            Clear All Data
                        </Button>
                    </ButtonGroup>
                </div>

                {this.renderSaveFileUI()}
            </BaseEditor>
        );
    }
}

export const DataEditor = connect((state: State) => ({ state: state }), {
    replaceState,
    newNuzlocke,
})(DataEditorBase);
