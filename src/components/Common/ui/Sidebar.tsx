import * as React from "react";
import { useParams } from "react-router-dom";
import { PokemonEditor } from "components/Editors/PokemonEditor/PokemonEditor";
import { PokemonBoxes } from "components/Editors/PokemonEditor/PokemonBoxes";
import { TrainerEditor } from "components/Editors/TrainerEditor/TrainerEditor";
import { GameSelector } from "components/Editors/GameEditor/GameSelector";
import { ErrorBoundary } from "components/Common/Shared/ErrorBoundary";
import type { Pokemon } from "models/Pokemon";

const MIN_WIDTH = 200;
const MAX_WIDTH = 500;
const DEFAULT_WIDTH = 256;
const STORAGE_KEY = "sidebar-width";

interface SidebarProps {
    onRunsChange: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onRunsChange }) => {
    const { id: runId } = useParams<{ id: string }>();
    const [width, setWidth] = React.useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
    });
    const [isResizing, setIsResizing] = React.useState(false);
    const [selectedPokemonId, setSelectedPokemonId] = React.useState<string | null>(null);
    const [pokemonList, setPokemonList] = React.useState<Pokemon[]>([]);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        setSelectedPokemonId(null);
        setPokemonList([]);
    }, [runId]);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    };

    React.useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX));
            setWidth(newWidth);
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            localStorage.setItem(STORAGE_KEY, width.toString());
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        // Prevent text selection while dragging
        document.body.style.userSelect = "none";
        document.body.style.cursor = "col-resize";

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.body.style.userSelect = "";
            document.body.style.cursor = "";
        };
    }, [isResizing, width]);

    if (!runId) return null;

    return (
        <aside
            className="bg-sidebar text-sidebar-foreground border-r border-sidebar-border h-screen relative flex-shrink-0 transition-colors flex flex-col group/sidebar"
            style={{ width }}
        >
            <div ref={scrollContainerRef} className="@container p-0 pl-4 overflow-x-hidden overflow-y-auto flex-1 scrollbar-gutter-stable sidebar-scroll">
                <div className="grid gap-4 grid-cols-1 @[350px]:grid-cols-2">
                    <div className="@[350px]:col-span-2">
                        <ErrorBoundary errorMessage="Ooops. Something failed...">
                            <GameSelector runId={runId} onGameUpdated={onRunsChange} />
                        </ErrorBoundary>
                    </div>
                    <div>
                        <ErrorBoundary errorMessage="Ooops. Something failed...">
                            <TrainerEditor runId={runId} onTrainerUpdated={onRunsChange} />
                        </ErrorBoundary>
                    </div>
                    <div>
                        <ErrorBoundary errorMessage="Ooops. Something failed...">
                            <PokemonBoxes
                                runId={runId}
                                onRefresh={onRunsChange}
                                selectedPokemonId={selectedPokemonId}
                                onSelectPokemon={setSelectedPokemonId}
                                onPokemonLoaded={setPokemonList}
                            />
                        </ErrorBoundary>
                    </div>
                    <div className="@[350px]:col-span-2">
                        <ErrorBoundary errorMessage="Ooops. Something failed...">
                            <PokemonEditor
                                runId={runId}
                                onPokemonAdded={() => {
                                    onRunsChange();
                                }}
                                selectedPokemonId={selectedPokemonId}
                                pokemonList={pokemonList}
                                onClearSelection={() => setSelectedPokemonId(null)}
                            />
                        </ErrorBoundary>
                    </div>
                </div>
            </div>

            <div
                onMouseDown={handleMouseDown}
                className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-400 transition-colors ${
                    isResizing ? "bg-blue-500" : "bg-transparent"
                }`}
                title="Drag to resize"
            />
        </aside>
    );
};
