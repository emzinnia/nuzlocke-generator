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
    z-index: 1000;
`;

export const DebugDialog: React.FC<DebugDialogProps> = ({
    onAddRandomPokemon,
    onCreateBox = noop,
}) => {
    return (
        <div className={debugPanelClassName} aria-label="Debug Panel">
            <h3 style={{ margin: 0, marginBottom: "0.5rem" }}>Debug Panel</h3>
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

