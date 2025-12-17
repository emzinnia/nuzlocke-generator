import * as React from "react";
import { Button } from "@blueprintjs/core";
import { noop } from "utils";
import { css } from "emotion";

interface DebugDialogProps {
    onAddRandomPokemon: () => void;
    onCreateBox?: () => void;
}

const debugPanelClassName = css`
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    width: 20rem;
    padding: 1rem;
    background: #222;
    color: #fff;
    border-radius: .25rem;
`;

export const DebugDialog: React.FC<DebugDialogProps> = ({
    onAddRandomPokemon,
    onCreateBox = noop,
}) => {
    return (
        <div className={debugPanelClassName} aria-label="Debug Panel">
            <div className="debug-panel__title">Debug Panel</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
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

