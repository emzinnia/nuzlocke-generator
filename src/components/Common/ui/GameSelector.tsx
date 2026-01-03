import * as React from "react";
import { Play, ChevronDown, Gamepad2, Check } from "lucide-react";
import type { Game } from "utils";
import { gameOfOriginToColor } from "utils";

interface GenerationData {
    id: string;
    name: string;
    games: Game[];
}

const GENERATIONS: GenerationData[] = [
    { id: "all", name: "All", games: [] },
    { id: "gen1", name: "I", games: ["Red", "Blue", "Green", "Yellow"] },
    { id: "gen2", name: "II", games: ["Gold", "Silver", "Crystal"] },
    { id: "gen3", name: "III", games: ["Ruby", "Sapphire", "Emerald", "FireRed", "LeafGreen", "Colosseum", "XD Gale of Darkness"] },
    { id: "gen4", name: "IV", games: ["Diamond", "Pearl", "Platinum", "HeartGold", "SoulSilver"] },
    { id: "gen5", name: "V", games: ["Black", "White", "Black 2", "White 2"] },
    { id: "gen6", name: "VI", games: ["X", "Y", "OmegaRuby", "AlphaSapphire"] },
    { id: "gen7", name: "VII", games: ["Sun", "Moon", "Ultra Sun", "Ultra Moon", "Let's Go Pikachu", "Let's Go Eevee"] },
    { id: "gen8", name: "VIII", games: ["Sword", "Shield", "Brilliant Diamond", "Shining Pearl", "Legends: Arceus"] },
    { id: "gen9", name: "IX", games: ["Scarlet", "Violet", "Legends: Z-A"] },
    { id: "other", name: "Other", games: ["Custom"] },
];

const ALL_GAMES = GENERATIONS.slice(1).flatMap(gen => gen.games);

function getContrastTextColor(bgColor: string): string {
    if (!bgColor) return "text-fg-primary";
    
    let r = 0, g = 0, b = 0;
    
    if (bgColor.startsWith("rgb")) {
        const match = bgColor.match(/\d+/g);
        if (match) {
            [r, g, b] = match.map(Number);
        }
    } else if (bgColor.startsWith("#")) {
        const hex = bgColor.slice(1);
        if (hex.length === 3) {
            r = parseInt(hex[0] + hex[0], 16);
            g = parseInt(hex[1] + hex[1], 16);
            b = parseInt(hex[2] + hex[2], 16);
        } else {
            r = parseInt(hex.slice(0, 2), 16);
            g = parseInt(hex.slice(2, 4), 16);
            b = parseInt(hex.slice(4, 6), 16);
        }
    }
    
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "text-gray-900" : "text-white";
}

interface GameSelectorProps {
    selectedGame: Game | null;
    onGameSelect: (game: Game) => void;
    onStartGame: () => void;
}

export function GameSelector({ selectedGame, onGameSelect, onStartGame }: GameSelectorProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [activeGenFilter, setActiveGenFilter] = React.useState("all");

    const filteredGames = React.useMemo(() => {
        if (activeGenFilter === "all") return ALL_GAMES;
        const gen = GENERATIONS.find(g => g.id === activeGenFilter);
        return gen?.games ?? [];
    }, [activeGenFilter]);

    const handleGameClick = (game: Game) => {
        onGameSelect(game);
    };

    return (
        <div className="group">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-4 p-4 rounded-lg bg-bg-secondary border border-border hover:border-emerald-400/50 hover:bg-bg-tertiary transition-all duration-200 text-left cursor-pointer"
            >
                <div className="shrink-0 w-10 h-10 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                    <Play className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-medium text-fg-primary text-sm">
                        {selectedGame && selectedGame !== "None" ? (
                            <span className="flex items-center gap-2">
                                Start New Run
                                <span 
                                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                                    style={{ 
                                        backgroundColor: gameOfOriginToColor(selectedGame),
                                        color: getContrastTextColor(gameOfOriginToColor(selectedGame)).includes("white") ? "white" : "#111"
                                    }}
                                >
                                    {selectedGame}
                                </span>
                            </span>
                        ) : (
                            "Start New Run"
                        )}
                    </div>
                    <div className="text-xs text-fg-tertiary mt-0.5">Choose a game to begin tracking</div>
                </div>
                <ChevronDown 
                    className={`w-5 h-5 text-fg-tertiary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                />
            </button>

            <div 
                className={`overflow-hidden transition-all duration-300 ease-out ${
                    isOpen ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'
                }`}
            >
                <div className="bg-bg-secondary border border-border rounded-lg overflow-hidden">
                    <div className="flex flex-wrap gap-1 p-3 border-b border-border bg-bg-tertiary/50">
                        {GENERATIONS.map((gen) => {
                            const isActive = activeGenFilter === gen.id;
                            return (
                                <button
                                    key={gen.id}
                                    onClick={() => setActiveGenFilter(gen.id)}
                                    className={`relative px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer transition-all duration-150 ${
                                        isActive
                                            ? 'bg-primary-500 text-white shadow-md scale-105'
                                            : 'bg-bg-secondary hover:bg-bg-tertiary text-fg-secondary hover:text-fg-primary hover:scale-102'
                                    }`}
                                    aria-pressed={isActive}
                                >
                                    {gen.name}
                                    {isActive && (
                                        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-white/80 rounded-full" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="max-h-72 overflow-y-auto p-3 routes-scrollbar">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {filteredGames.map((game) => {
                                const color = gameOfOriginToColor(game);
                                const isSelected = selectedGame === game;
                                const textColorClass = getContrastTextColor(color);
                                
                                return (
                                    <button
                                        key={game}
                                        onClick={() => handleGameClick(game)}
                                        className={`relative group/game px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left overflow-hidden cursor-pointer ${
                                            isSelected 
                                                ? 'ring-2 ring-offset-2 ring-primary-500 dark:ring-offset-gray-900 scale-[1.02]' 
                                                : 'hover:scale-[1.02] hover:shadow-md'
                                        }`}
                                        style={{ 
                                            backgroundColor: color || 'var(--color-bg-tertiary)',
                                        }}
                                        title={game}
                                    >
                                        <span className={`relative z-10 truncate block ${color ? textColorClass : 'text-fg-primary'}`}>
                                            {game}
                                        </span>
                                        
                                        {isSelected && (
                                            <div className="absolute top-1 right-1 w-5 h-5 bg-white/90 rounded-full flex items-center justify-center shadow-sm">
                                                <Check className="w-3 h-3 text-primary-600" />
                                            </div>
                                        )}
                                        
                                        <div 
                                            className="absolute inset-0 bg-white/0 group-hover/game:bg-white/10 transition-colors duration-200"
                                            aria-hidden="true"
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {selectedGame && selectedGame !== "None" && (
                        <div className="p-3 border-t border-border bg-bg-tertiary/30">
                            <button
                                onClick={onStartGame}
                                className="w-full py-2.5 px-4 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Gamepad2 className="w-4 h-4" />
                                Start {selectedGame}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
