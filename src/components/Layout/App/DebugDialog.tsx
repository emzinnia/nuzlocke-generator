import * as React from "react";
import { Button } from "@blueprintjs/core";
import { noop } from "utils";

interface DebugDialogProps {
    isDarkMode: boolean;
    onAddRandomPokemon: () => void;
    onCreateBox?: () => void;
}

const debugPanelClassName = `
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    width: 240px;
    padding: 0.75rem;
`;

export const DebugDialog: React.FC<DebugDialogProps> = ({
    isDarkMode,
    onAddRandomPokemon,
    onCreateBox = noop,
}) => {
    return (
        <div className={debugPanelClassName} aria-label="Debug Panel">
            <div className="debug-panel__title">Debug Panel</div>
            <div className="debug-panel__actions">
                <Button fill onClick={onAddRandomPokemon}>
                    Add Random Pokemon
                </Button>
                <Button fill onClick={onCreateBox}>
                    Create a new box of 30 Pokemon
                </Button>
            </div>
        </div>
    );
};

