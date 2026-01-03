import * as React from "react";
import { Play, ChevronDown, Gamepad2 } from "lucide-react";
import type { Game } from "utils";

const GAMES_BY_GENERATION: { name: string; games: Game[] }[] = [
    { name: "Gen I", games: ["Red", "Blue", "Green", "Yellow"] },
    { name: "Gen II", games: ["Gold", "Silver", "Crystal"] },
    { name: "Gen III", games: ["Ruby", "Sapphire", "Emerald", "FireRed", "LeafGreen", "Colosseum", "XD Gale of Darkness"] },
    { name: "Gen IV", games: ["Diamond", "Pearl", "Platinum", "HeartGold", "SoulSilver"] },
    { name: "Gen V", games: ["Black", "White", "Black 2", "White 2"] },
    { name: "Gen VI", games: ["X", "Y", "OmegaRuby", "AlphaSapphire"] },
    { name: "Gen VII", games: ["Sun", "Moon", "Ultra Sun", "Ultra Moon", "Let's Go Pikachu", "Let's Go Eevee"] },
    { name: "Gen VIII", games: ["Sword", "Shield", "Brilliant Diamond", "Shining Pearl", "Legends: Arceus"] },
    { name: "Gen IX", games: ["Scarlet", "Violet", "Legends: Z-A"] },
    { name: "Other", games: ["Custom"] },
];

interface GameSelectorProps {
    selectedGame: Game | null;
    onGameSelect: (game: Game) => void;
    onStartGame: () => void;
}

export function GameSelector({ selectedGame, onGameSelect, onStartGame }: GameSelectorProps) {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className="group cursor-pointer">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-4 p-4 rounded-lg bg-bg-secondary border border-border hover:border-primary-400/50 hover:bg-bg-tertiary transition-all duration-200 text-left"
            >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                    <Play className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-medium text-fg-primary text-sm">Start New Run</div>
                    <div className="text-xs text-fg-tertiary mt-0.5">Choose a game to begin tracking</div>
                </div>
                <ChevronDown 
                    className={`w-5 h-5 text-fg-tertiary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                />
            </button>

            <div 
                className={`overflow-hidden transition-all duration-300 ease-out ${
                    isOpen ? 'max-h-[400px] opacity-100 mt-2' : 'max-h-0 opacity-0'
                }`}
            >
                <div className="bg-bg-secondary border border-border rounded-lg p-4 relative z-10">
                    <div className="max-h-64 overflow-y-auto space-y-4 pr-2 -mr-2 routes-scrollbar relative z-20">
                        {GAMES_BY_GENERATION.map((gen) => (
                            <div key={gen.name}>
                                <div className="text-xs font-semibold text-fg-tertiary uppercase tracking-wider mb-2">
                                    {gen.name}
                                </div>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {gen.games.map((game) => (
                                        <button
                                            key={game}
                                            onClick={() => onGameSelect(game)}
                                            className={`px-3 py-2 text-xs rounded-md transition-all duration-150 text-left truncate ${
                                                selectedGame === game
                                                    ? 'bg-primary-500 text-white font-medium shadow-sm'
                                                    : 'bg-bg-tertiary hover:bg-primary-100 dark:hover:bg-primary-900/30 text-fg-secondary hover:text-fg-primary'
                                            }`}
                                            title={game}
                                        >
                                            {game}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {selectedGame && selectedGame !== "None" && (
                        <div className="mt-4 pt-4 border-t border-border">
                            <button
                                onClick={onStartGame}
                                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 flex items-center justify-center gap-2"
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

