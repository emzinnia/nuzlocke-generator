import * as React from "react";
import {
    Button,
    ButtonGroup,
    Classes,
    Dialog,
    FileInput,
    HTMLSelect,
    Intent,
} from "@blueprintjs/core";
import { cx } from "emotion";
import { GameSaveFormat } from "utils";
import { State } from "state";
import { BoxMappings } from "parsers/utils/boxMappings";
import { SaveGameSettingsDialog } from "./DataEditor";

const getGameNumberOfBoxes = (game: GameSaveFormat) => {
    switch (game) {
        case "Auto":
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

const generateArray = (n: number): BoxMappings => {
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

const generateBoxMappingsDefault = (saveFormat: GameSaveFormat) =>
    generateArray(getGameNumberOfBoxes(saveFormat));

export interface AdvancedImportOptionsProps {
    boxes: State["box"];
    isDarkMode: boolean;
    fileInputRef: React.RefObject<HTMLInputElement>;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function AdvancedImportOptions({
    boxes,
    isDarkMode,
    fileInputRef,
    onFileChange,
}: AdvancedImportOptionsProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
    const [selectedGame, setSelectedGame] = React.useState<GameSaveFormat>("Auto");
    const [mergeDataMode, setMergeDataMode] = React.useState(true);
    const [boxMappings, setBoxMappings] = React.useState<BoxMappings>(() =>
        generateBoxMappingsDefault("Auto")
    );
    const [fileName, setFileName] = React.useState<string>("");

    const gen3Enabled = import.meta.env.VITE_GEN3_SAVES === "true";
    const allowedGames: GameSaveFormat[] = gen3Enabled
        ? ["RBY", "GS", "Crystal", "RS", "FRLG", "Emerald"]
        : ["RBY", "GS", "Crystal"];

    const handleGameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const game = e.target.value as GameSaveFormat;
        setSelectedGame(game);
        setBoxMappings(generateBoxMappingsDefault(game));
    };

    const handleBoxMappingChange = ({ key, status }: { key: number; status: string }) => {
        setBoxMappings((prev) =>
            prev.map((mapping) =>
                mapping.key === key ? { key, status } : mapping
            )
        );
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
        }
        onFileChange(e);
    };

    return (
        <div style={{ margin: "0.25rem" }}>
            <Button
                onClick={() => setIsOpen(!isOpen)}
                icon={isOpen ? "chevron-down" : "chevron-right"}
                minimal
            >
                Advanced Import Options
            </Button>

            {isOpen && (
                <div
                    className="data-editor-save-file-form"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                        marginTop: "0.5rem",
                        padding: "0.75rem",
                        borderRadius: "0.25rem",
                        background: isDarkMode
                            ? "rgba(255, 255, 255, 0.05)"
                            : "rgba(0, 0, 0, 0.05)",
                    }}
                >
                    <ButtonGroup>
                        <HTMLSelect
                            value={selectedGame}
                            onChange={handleGameChange}
                        >
                            <option key="Auto" value="Auto">
                                Auto
                            </option>
                            {allowedGames.map((game) => (
                                <option key={game} value={game}>
                                    {game}
                                </option>
                            ))}
                        </HTMLSelect>
                        <Button
                            onClick={() => setIsSettingsOpen(true)}
                            intent={Intent.PRIMARY}
                            icon="cog"
                        >
                            Options
                        </Button>
                    </ButtonGroup>

                    <FileInput
                        text={fileName || "Choose .sav file..."}
                        buttonText="Browse"
                        inputProps={{
                            accept: ".sav",
                            ref: fileInputRef,
                            onChange: handleFileChange,
                        }}
                        fill={false}
                    />
                </div>
            )}

            {/* Hidden file input ref when panel is collapsed */}
            {!isOpen && (
                <input
                    style={{ display: "none" }}
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    type="file"
                    id="file-hidden"
                    name="file-hidden"
                    accept=".sav"
                />
            )}

            <Dialog
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                title="Save Upload Settings"
                className={isDarkMode ? Classes.DARK : ""}
                icon="floppy-disk"
            >
                <SaveGameSettingsDialog
                    mergeDataMode={mergeDataMode}
                    onMergeDataChange={() => setMergeDataMode(!mergeDataMode)}
                    boxes={boxes}
                    selectedGame={selectedGame}
                    boxMappings={boxMappings}
                    setBoxMappings={handleBoxMappingChange}
                />
            </Dialog>
        </div>
    );
}

