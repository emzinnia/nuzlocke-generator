import * as React from "react";
import { Collapsible, Select } from "components/Common/ui";
import { getRun, patchRun } from "api/runs";
import { listOfGames, Game } from "utils";
import { debounce } from "utils/debounce";

interface GameSelectorProps {
    runId: string;
    onGameUpdated?: () => void;
}

export const GameSelector: React.FC<GameSelectorProps> = ({ runId, onGameUpdated }) => {
    const [game, setGame] = React.useState<{ name: Game; customName: string }>({ name: "None", customName: "" });
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Fetch game data on mount and when runId changes
    React.useEffect(() => {
        const fetchGame = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const run = await getRun(runId);
                setGame(run.data.game || { name: "None", customName: "" });
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load game');
            } finally {
                setIsLoading(false);
            }
        };

        fetchGame();
    }, [runId]);

    // Debounced save function
    const saveGame = React.useMemo(
        () =>
            debounce(async (updatedGame: { name: Game; customName: string }) => {
                setIsSaving(true);
                try {
                    await patchRun(runId, { game: updatedGame });
                    onGameUpdated?.();
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to save game');
                } finally {
                    setIsSaving(false);
                }
            }, 500),
        [runId, onGameUpdated]
    );

    const handleGameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const updatedGame = { ...game, name: e.target.value as Game };
        setGame(updatedGame);
        saveGame(updatedGame);
    };

    const title = isSaving ? "Game (Saving...)" : "Game";

    if (isLoading) {
        return (
            <Collapsible title="Game" defaultOpen={true}>
                <div className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
                    Loading...
                </div>
            </Collapsible>
        );
    }

    return (
        <Collapsible title={title} defaultOpen={true}>
            {error && (
                <div className="mb-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <div className="flex gap-1 w-full justify-between items-center">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Version</label>
                    <Select
                        value={game.name}
                        onChange={handleGameChange}
                        options={listOfGames}
                        className="flex-1 max-w-[140px]"
                    />
                </div>
            </div>
        </Collapsible>
    );
};

