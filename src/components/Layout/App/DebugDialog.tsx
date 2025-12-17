import * as React from "react";
import { Button } from "@blueprintjs/core";
import { noop } from "utils";

interface DebugDialogProps {
    isDarkMode: boolean;
    onAddRandomPokemon: () => void;
    onCreateBox?: () => void;
}

export const DebugDialog: React.FC<DebugDialogProps> = ({
    isDarkMode,
    onAddRandomPokemon,
    onCreateBox = noop,
}) => {
    const debugPanelClassName = ["debug-panel", isDarkMode ? "bp5-dark" : ""]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={debugPanelClassName} aria-label="Debug Panel">
            <div className="debug-panel__title">Debug Panel</div>
            <div className="debug-panel__actions">
                <Button fill small onClick={onAddRandomPokemon}>
                    Add Random Pokemon
                </Button>
                <Button fill small onClick={onCreateBox}>
                    Create a new box of 30 Pokemon
                </Button>
            </div>
        </div>
    );
};

