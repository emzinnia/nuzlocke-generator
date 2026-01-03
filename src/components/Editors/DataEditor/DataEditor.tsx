import * as React from "react";
import { connect } from "react-redux";
import {
    Button,
    ButtonGroup,
    Dialog,
    DialogBody,
    DialogFooter,
    TextArea,
    Intent,
    Switch,
} from "components/ui";
import { Classes } from "components/ui/shims";
import { PokemonIcon } from "components/Pokemon/PokemonIcon";
import { ErrorBoundary } from "components/Common/Shared";
import { v4 as uuid } from "uuid";
import { persistor } from "store";
import { newNuzlocke, replaceState } from "actions";
import { Database, Download, Check, Save } from "lucide-react";
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
import { AdvancedImportOptions } from "./AdvancedImportOptions";
import { isEmpty } from "utils/isEmpty";
import { showToast } from "components/Common/Shared/appToaster";
// @TODO: fix codegen imports
// import codegen from 'codegen.macro';
import { BoxMappings } from "parsers/utils/boxMappings";
import SaveFileWorker from "parsers/worker?worker";
import { cx } from "emotion";
import { StatusDropZone } from "./StatusDropZone";

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
    overrideImport: boolean;
}

const isValidJSON = (data: string): boolean => {
    try {
        JSON.parse(data);
        return true;
    } catch {
        return false;
    }
};

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
    setBoxMappings: ({ key, status }: { key: number; status: string }) => void;
    isDarkMode: boolean;
}

export function SaveGameSettingsDialog({
    onMergeDataChange,
    mergeDataMode,
    boxes,
    boxMappings,
    setBoxMappings,
    isDarkMode,
}: SaveGameSettingsDialogProps) {
    // Group boxMappings by status
    const boxesByStatus = React.useMemo(() => {
        const grouped: Record<string, typeof boxMappings> = {};
        
        // Initialize with all available statuses from app boxes
        for (const box of boxes) {
            grouped[box.name] = [];
        }
        
        // Assign each save file box to its status
        for (const mapping of boxMappings) {
            if (!grouped[mapping.status]) {
                grouped[mapping.status] = [];
            }
            grouped[mapping.status].push(mapping);
        }
        
        return grouped;
    }, [boxes, boxMappings]);

    // Get ordered list of statuses (from app boxes)
    const statusOrder = React.useMemo(() => {
        return boxes.map((box) => box.name);
    }, [boxes]);

    const handleDrop = React.useCallback(
        (boxKey: number, newStatus: string) => {
            setBoxMappings({ key: boxKey, status: newStatus });
        },
        [setBoxMappings]
    );

    return (
        <DialogBody className="has-nice-scrollbars">
            <Switch
                label={
                    <>
                        <strong>Merge Data?</strong>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
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

            <p className={Classes.TEXT_MUTED} style={{ marginBottom: "1rem" }}>
                Drag and drop the save file boxes to assign them to different statuses.
            </p>

            <div
                style={{
                    maxHeight: "50vh",
                    overflow: "auto",
                    display: "flex",
                    flexDirection: "column",
                }}
                className="has-nice-scrollbars"
            >
                {statusOrder.map((status) => (
                    <StatusDropZone
                        key={status}
                        statusName={status}
                        boxes={boxesByStatus[status] || []}
                        isDarkMode={isDarkMode}
                        showPartyBox={status === "Team"}
                        onDrop={handleDrop}
                    />
                ))}
            </div>
        </DialogBody>
    );
}

export class DataEditorBase extends React.Component<
    DataEditorProps,
    DataEditorState
> {
    public textarea: HTMLTextAreaElement | null;
    public nuzlockeJsonFileInput: HTMLInputElement | null;
    public advancedImportRef = React.createRef<import("./AdvancedImportOptions").AdvancedImportOptionsHandle>();

    public constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isClearAllDataOpen: false,
            mode: "export",
            data: "",
            href: "",
            overrideImport: true,
        };
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

    private handleFileSelect = (
        file: File,
        settings: import("./AdvancedImportOptions").AdvancedImportSettings
    ) => {
        const t0 = performance.now();
        const worker = new SaveFileWorker();
        const reader = new FileReader();
        const { replaceState, state } = this.props;
        const { selectedGame, boxMappings, mergeDataMode } = settings;

        console.log(file, reader, settings, worker);

        reader.readAsArrayBuffer(file);

        reader.addEventListener("load", async function () {
            const save = new Uint8Array(this.result as ArrayBuffer);

            worker.postMessage({
                selectedGame,
                save,
                boxMappings,
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
                const mergedPokemon = mergeDataMode
                    ? DataEditorBase.pokeMerge(
                          state.pokemon,
                          result.pokemon as Pokemon[],
                      )
                    : result.pokemon;
                const game =
                    result.detectedGame ??
                    DataEditorBase.determineGame({
                        isYellow: result.isYellow,
                        selectedGame,
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
                `Call: ${t1 - t0} ms on ${selectedGame} save file type`,
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

    public render() {
        return (
            <BaseEditor icon={<Database size={16} />} name="Data">
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
                    className={cx({
                        "dark": this.props.state.style.editorDarkMode,
                    })}
                    icon={<Save size={18} />}
                >
                    {this.state.mode === "export" ? (
                        <>
                            <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded m-4">
                                Copy this and paste it somewhere safe!
                            </div>
                            <DialogBody
                                style={{ height: "40vh", overflow: "auto" }}
                                className="has-nice-scrollbars"
                            >
                                <span
                                    suppressContentEditableWarning={true}
                                    contentEditable={true}
                                >
                                    {JSON.stringify(this.props.state, null, 2)}
                                </span>
                            </DialogBody>
                            <DialogFooter>
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
                                        icon={<Download size={16} />}
                                        intent={Intent.PRIMARY}
                                    >
                                        Download
                                    </Button>
                                </a>
                            </DialogFooter>
                        </>
                    ) : (
                        <>
                            <DialogBody className="has-nice-scrollbars">
                                <TextArea
                                    className="custom-css-input w-full"
                                    onChange={this.uploadJSON}
                                    placeholder="Paste nuzlocke.json contents here, or use the file uploader"
                                    value={this.state.data}
                                />
                                <ErrorBoundary>
                                    {this.renderTeam(this.state.data)}
                                </ErrorBoundary>
                            </DialogBody>
                            <DialogFooter>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <input
                                        style={{ padding: ".25rem" }}
                                        className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        onChange={this.uploadNuzlockeJsonFile}
                                        type="file"
                                        id="jsonFile"
                                        name="jsonFile"
                                        accept=".json"
                                    />
                                    <Button
                                        icon={<Check size={16} />}
                                        intent={
                                            this.state.data === ""
                                                ? "none"
                                                : "success"
                                        }
                                        onClick={this.confirmImport}
                                        disabled={
                                            this.state.data === ""
                                                ? true
                                                : false
                                        }
                                        style={{
                                            marginLeft: "auto",
                                        }}
                                    >
                                        Confirm
                                    </Button>
                                </div>
                            </DialogFooter>
                        </>
                    )}
                </Dialog>

                <div className="flex flex-wrap items-center gap-1 m-1">
                    <ButtonGroup>
                        <Button
                            data-testid="import-data-button"
                            onClick={() => this.importState()}
                            icon="import"
                            intent={Intent.PRIMARY}
                            hotkey={{ key: "i", showModifier: false }}
                        >
                            Import Data
                        </Button>
                        <Button
                            data-testid="export-data-button"
                            onClick={() => this.exportState(this.props.state)}
                            icon="export"
                            hotkey={{ key: "e", showModifier: false }}
                        >
                            Export Data
                        </Button>
                        <Button
                            icon="folder-open"
                            data-testid="import-save-file-button"
                            onClick={() => this.advancedImportRef.current?.openFileDialog()}
                            hotkey={{ key: "o", showModifier: false }}
                        >
                            Import Save
                        </Button>
                    </ButtonGroup>

                    <ButtonGroup>
                        <Button
                            intent={Intent.SUCCESS}
                            onClick={this.writeAllData}
                            icon="floppy-disk"
                            hotkey={{ key: "s", showModifier: false }}
                        >
                            Force Save
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

                <AdvancedImportOptions
                    ref={this.advancedImportRef}
                    boxes={this.props.state.box}
                    isDarkMode={this.props.state.style.editorDarkMode ?? false}
                    onFileSelect={this.handleFileSelect}
                />
            </BaseEditor>
        );
    }
}

export const DataEditor = connect((state: State) => ({ state: state }), {
    replaceState,
    newNuzlocke,
})(DataEditorBase);
