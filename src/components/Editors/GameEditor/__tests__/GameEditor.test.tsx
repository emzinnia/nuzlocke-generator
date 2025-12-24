import * as React from "react";
import { fireEvent, render, screen } from "utils/testUtils";
import { GameEditorBase } from "..";
import { gameOfOriginToColor, listOfGames, styleDefaults, Game } from "utils";
import { vi } from "vitest";

const createProps = () => ({
    game: { name: listOfGames[0], customName: "" },
    style: styleDefaults,
    editGame: vi.fn(),
    editStyle: vi.fn(),
    resetCheckpoints: vi.fn(),
});

describe("<GameEditor />", () => {
    it("updates game and style when the version changes", () => {
        const props = createProps();
        render(<GameEditorBase {...props} />);

        const select = screen.getByRole("combobox");
        const nextGame = listOfGames.find((g) => g !== props.game.name) ?? props.game.name;

        fireEvent.change(select, { target: { value: nextGame } });

        expect(props.editGame).toHaveBeenCalledWith({ name: nextGame });
        expect(props.editStyle).toHaveBeenCalledWith({
            bgColor: gameOfOriginToColor(nextGame as Game),
        });
        expect(props.resetCheckpoints).toHaveBeenCalledWith(nextGame);
    });

    it("updates custom name when typing in the name field", () => {
        const props = createProps();
        render(<GameEditorBase {...props} />);

        const input = screen.getByPlaceholderText(props.game.name);
        fireEvent.change(input, { target: { value: "My Run" } });

        expect(props.editGame).toHaveBeenCalledWith({ customName: "My Run" });
    });
});

