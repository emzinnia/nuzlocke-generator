import * as React from "react";
import { useParams } from "react-router-dom";
import { PokemonEditor } from "components/Editors/PokemonEditor/PokemonEditor";
import { PokemonBoxes } from "components/Editors/PokemonEditor/PokemonBoxes";
import { TrainerEditor } from "components/Editors/TrainerEditor/TrainerEditor";
import { ErrorBoundary } from "components/Common/Shared/ErrorBoundary";
import { Icon } from "./Icon";
import { Button } from "./Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Pokemon } from "models/Pokemon";

const MIN_WIDTH = 0;
const MAX_WIDTH = 500;
const DEFAULT_WIDTH = 256;
const STORAGE_KEY = "sidebar-width";
const COLLAPSED_KEY = "sidebar-collapsed";

interface SidebarProps {
    onRunsChange: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onRunsChange }) => {
    const { id: runId } = useParams<{ id: string }>();
    const [isCollapsed, setIsCollapsed] = React.useState(() => {
        return localStorage.getItem(COLLAPSED_KEY) === "true";
    });
    const [width, setWidth] = React.useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        const parsed = saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
        return localStorage.getItem(COLLAPSED_KEY) === "true" ? 0 : parsed;
    });
    const [isResizing, setIsResizing] = React.useState(false);
    const [selectedPokemonId, setSelectedPokemonId] = React.useState<string | null>(null);
    const [pokemonList, setPokemonList] = React.useState<Pokemon[]>([]);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const lastWidthRef = React.useRef<number>(width || DEFAULT_WIDTH);

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

    const handleCollapse = () => {
        lastWidthRef.current = width || DEFAULT_WIDTH;
        setIsCollapsed(true);
        setWidth(0);
        localStorage.setItem(COLLAPSED_KEY, "true");
    };

    const handleExpand = () => {
        setIsCollapsed(false);
        const nextWidth = lastWidthRef.current || DEFAULT_WIDTH;
        setWidth(nextWidth);
        localStorage.setItem(COLLAPSED_KEY, "false");
        localStorage.setItem(STORAGE_KEY, nextWidth.toString());
    };

    if (isCollapsed) {
        return (
            <Button
                onClick={handleExpand}
                variant="outline"
                className="fixed top-4 left-0 z-50 bg-sidebar text-sidebar-foreground border border-sidebar-border shadow w-8 h-10 p-0 rounded-r-md hover:bg-sidebar/80 transition-colors flex items-center justify-center"
                aria-label="Open sidebar"
            >
                <Icon icon={ChevronRight} size={18} />
            </Button>
        );
    }

    if (!runId) return null;

    return (
        <aside
            className="bg-sidebar text-sidebar-foreground border-r border-sidebar-border h-screen relative flex-shrink-0 transition-colors flex flex-col overflow-hidden group/sidebar"
            style={{ width }}
        >
            <div className="absolute top-4 -right-3 z-10">
                <Button
                    onClick={handleCollapse}
                    variant="outline"
                    className="w-8 h-10 p-0 bg-sidebar text-sidebar-foreground border border-sidebar-border rounded-r-md hover:bg-sidebar/80 flex items-center justify-center shadow"
                    aria-label="Collapse sidebar"
                >
                    <Icon icon={ChevronLeft} size={18} />
                </Button>
            </div>
            <div ref={scrollContainerRef} className="@container p-0 pl-4 overflow-x-hidden overflow-y-auto flex-1 scrollbar-gutter-stable sidebar-scroll">
                <div className="grid gap-4 grid-cols-1 @[350px]:grid-cols-2">
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
