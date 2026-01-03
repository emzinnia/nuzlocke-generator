import * as React from "react";
import { useDispatch } from "react-redux";
import { FileUp, FolderOpen } from "lucide-react";
import { editGame, editStyle, resetCheckpoints, replaceState, newNuzlocke } from "actions";
import { gameOfOriginToColor, Game } from "utils";
import { showToast } from "components/Common/Shared/appToaster";
import { Intent } from "components/ui";
import { GameSelector } from "components/Common/ui/GameSelector";
import nuzlockeGeneratorBall from "assets/nuzlocke-generator-ball.png";

function isValidJSON(str: string): boolean {
    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
}

export function EmptyStateView() {
    const dispatch = useDispatch();
    const [selectedGame, setSelectedGame] = React.useState<Game | null>(null);
    const jsonInputRef = React.useRef<HTMLInputElement>(null);
    const saveInputRef = React.useRef<HTMLInputElement>(null);

    const handleGameSelect = (gameName: Game) => {
        setSelectedGame(gameName);
    };

    const handleStartGame = () => {
        if (!selectedGame || selectedGame === "None") {
            showToast({
                message: "Please select a game first",
                intent: Intent.WARNING,
            });
            return;
        }

        dispatch(editGame({ name: selectedGame }));
        dispatch(editStyle({
            bgColor: gameOfOriginToColor(selectedGame),
        }));
        dispatch(resetCheckpoints(selectedGame));
    };

    const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsText(file, "utf-8");
        reader.addEventListener("load", (event) => {
            const content = event?.target?.result as string;
            if (isValidJSON(content)) {
                const data = JSON.parse(content);
                const safeguards = {
                    customTypes: [],
                    customMoveMap: [],
                    stats: [],
                    excludedAreas: [],
                    customAreas: [],
                };
                dispatch(replaceState({
                    ...safeguards,
                    ...data,
                }));
                dispatch(newNuzlocke(content, { isCopy: false }));
                showToast({
                    message: "Nuzlocke imported successfully!",
                    intent: Intent.SUCCESS,
                });
            } else {
                showToast({
                    message: "Failed to parse invalid JSON",
                    intent: Intent.DANGER,
                });
            }
        });
        
        if (jsonInputRef.current) {
            jsonInputRef.current.value = "";
        }
    };

    const handleSaveFileClick = () => {
        showToast({
            message: "For save file import, use the Data panel in the editor sidebar",
            intent: Intent.PRIMARY,
        });
    };

    return (
        <div className="flex-1 flex items-center justify-center p-8 min-h-0 overflow-auto">
            <input
                ref={jsonInputRef}
                type="file"
                accept=".json"
                onChange={handleJsonImport}
                className="hidden"
            />
            <input
                ref={saveInputRef}
                type="file"
                accept=".sav"
                className="hidden"
            />
            <div className="max-w-lg w-full relative z-0">
                <div className="text-center mb-10">
                    <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent rounded-full blur-2xl scale-150" />
                        <img 
                            src={nuzlockeGeneratorBall} 
                            alt="" 
                            className="relative w-20 h-20 opacity-80 animate-[pulse_3s_ease-in-out_infinite]" 
                        />
                    </div>
                    <h1 className="text-2xl justify-center font-bold text-fg-primary mb-2 tracking-tight flex items-center text-center gap-2">
                        Nuzlocke Generator
                        <span className="text-sm text-fg-secondary align-text-top -mt-8 text-center text-[var(--color-success-500)]">v2</span>
                    </h1>
                    <p className="text-fg-secondary text-sm">
                        Track your Nuzlocke run, manage your team, and generate shareable images
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <ActionCard
                        icon={<FileUp className="w-5 h-5" />}
                        title="Import from JSON"
                        description="Load a previously exported run"
                        onClick={() => jsonInputRef.current?.click()}
                    />

                    <ActionCard
                        icon={<FolderOpen className="w-5 h-5" />}
                        title="Import from Save File"
                        description="Extract data from .sav files (Gen 1-3)"
                        onClick={handleSaveFileClick}
                    />

                    <GameSelector
                        selectedGame={selectedGame}
                        onGameSelect={handleGameSelect}
                        onStartGame={handleStartGame}
                    />
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-fg-tertiary">
                        Your progress is saved locally in your browser
                    </p>
                </div>
            </div>
        </div>
    );
}

interface ActionCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
}

function ActionCard({ icon, title, description, onClick }: ActionCardProps) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-4 p-4 rounded-lg bg-bg-secondary border border-border hover:border-primary-400/50 hover:bg-[var(--color-bg-tertiary)] cursor-pointer transition-all duration-200 text-left group"
        >
            <div className="shrink-0 w-10 h-10 rounded-lg bg-linear-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/30 transition-shadow">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-medium text-fg-primary text-sm">{title}</div>
                <div className="text-xs text-fg-tertiary mt-0.5">{description}</div>
            </div>
        </button>
    );
}

