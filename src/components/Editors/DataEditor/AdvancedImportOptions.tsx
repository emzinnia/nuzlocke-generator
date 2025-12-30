import * as React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    Button,
    ButtonGroup,
    Classes,
    Dialog,
    HTMLSelect,
    Intent,
} from "@blueprintjs/core";
import { GameSaveFormat } from "utils";
import { State } from "state";
import { BoxMappings } from "parsers/utils/boxMappings";
import { SaveGameSettingsDialog } from "./DataEditor";
import { updateSaveUploadSettings } from "actions";

export interface AdvancedImportSettings {
    selectedGame: GameSaveFormat;
    boxMappings: BoxMappings;
    mergeDataMode: boolean;
}

export interface AdvancedImportOptionsProps {
    boxes: State["box"];
    isDarkMode: boolean;
    onFileSelect: (file: File, settings: AdvancedImportSettings) => void;
    onShowdownImport: () => void;
}

export interface AdvancedImportOptionsHandle {
    openFileDialog: () => void;
}

export const AdvancedImportOptions = React.forwardRef<
    AdvancedImportOptionsHandle,
    AdvancedImportOptionsProps
>(function AdvancedImportOptions(
    { boxes, isDarkMode, onFileSelect, onShowdownImport },
    ref
) {
    const dispatch = useDispatch();
    const { selectedGame, boxMappings, mergeDataMode } = useSelector(
        (state: State) => state.saveUploadSettings
    );

    const [isOpen, setIsOpen] = React.useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
    const [fileName, setFileName] = React.useState<string>("");

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const gen3Enabled = import.meta.env.VITE_GEN3_SAVES === "true";
    const allowedGames: GameSaveFormat[] = gen3Enabled
        ? ["RBY", "GS", "Crystal", "RS", "FRLG", "Emerald"]
        : ["RBY", "GS", "Crystal"];

    // Expose openFileDialog to parent via ref
    React.useImperativeHandle(ref, () => ({
        openFileDialog: () => {
            fileInputRef.current?.click();
        },
    }));

    const handleGameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const game = e.target.value as GameSaveFormat;
        dispatch(updateSaveUploadSettings({ selectedGame: game }));
    };

    const handleBoxMappingChange = ({ key, status }: { key: number; status: string }) => {
        const updatedMappings = boxMappings.map((mapping) =>
            mapping.key === key ? { ...mapping, status } : mapping
        );
        dispatch(updateSaveUploadSettings({ boxMappings: updatedMappings }));
    };

    const handleMergeDataChange = () => {
        dispatch(updateSaveUploadSettings({ mergeDataMode: !mergeDataMode }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            onFileSelect(file, {
                selectedGame,
                boxMappings,
                mergeDataMode,
            });
        }
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

            {/* Single hidden file input - always available for both panel button and parent's Import Save button */}
            <input
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={handleFileChange}
                type="file"
                id="file-hidden"
                name="file-hidden"
                accept=".sav"
            />

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
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            icon="document-open"
                        >
                            {fileName || "Choose .sav file..."}
                        </Button>
                    </ButtonGroup>

                    <Button
                        icon="document"
                        data-testid="import-showdown-button"
                        onClick={onShowdownImport}
                    >
                        Import from Showdown
                    </Button>
                </div>
            )}

            <Dialog
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                title="Save Upload Settings"
                className={isDarkMode ? Classes.DARK : ""}
                icon="floppy-disk"
                style={{ width: "700px" }}
            >
                <SaveGameSettingsDialog
                    mergeDataMode={mergeDataMode}
                    onMergeDataChange={handleMergeDataChange}
                    boxes={boxes}
                    selectedGame={selectedGame}
                    boxMappings={boxMappings}
                    setBoxMappings={handleBoxMappingChange}
                    isDarkMode={isDarkMode}
                />
            </Dialog>
        </div>
    );
});
