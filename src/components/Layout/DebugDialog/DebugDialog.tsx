import * as React from "react";
import { Button, NumericInput } from "components/ui";
import { noop } from "utils";
import { css } from "emotion";

interface DebugDialogProps {
    onAddRandomPokemon: () => void;
    onCreateRandomBox?: (count: number) => void;
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

const debugPanelHeader = css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
`;

export const DebugDialog: React.FC<DebugDialogProps> = ({
    onAddRandomPokemon,
    onCreateRandomBox = noop,
}) => {
    const [isOpen, setIsOpen] = React.useState(true);
    const [boxPokemonCount, setBoxPokemonCount] = React.useState(30);

    if (!isOpen) return null;
    return (
        <div className={debugPanelClassName} aria-label="Debug Panel">
            <div className={debugPanelHeader}>
                <h3 style={{ margin: 0, marginBottom: "0.5rem" }}>Debug Panel</h3>
                <Button minimal icon="cross" onClick={() => setIsOpen(false)} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <Button fill onClick={onAddRandomPokemon}>
                    Add Random Pokemon
                </Button>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <Button 
                        fill 
                        onClick={() => onCreateRandomBox(boxPokemonCount)}
                        style={{ flex: 1 }}
                    >
                        Create Random Box
                    </Button>
                    <NumericInput
                        value={boxPokemonCount}
                        onValueChange={(value) => setBoxPokemonCount(value ?? 30)}
                        min={1}
                        max={100}
                        style={{ width: "4rem" }}
                    />
                </div>
            </div>
        </div>
    );
};

