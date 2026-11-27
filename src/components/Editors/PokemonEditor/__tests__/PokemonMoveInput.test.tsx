import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { editPokemon } from "actions";
import {
    PokemonMoveInput,
    setMoveAtSlot,
} from "../CurrentPokemonInput";
import type { PokemonInputProps } from "../CurrentPokemonInput";

const dispatchMock = vi.hoisted(() => vi.fn());

vi.mock("store/reactZustand", async (importOriginal) => {
    const actual = await importOriginal<typeof import("store/reactZustand")>();

    return {
        ...actual,
        useDispatch: () => dispatchMock,
    };
});

describe(setMoveAtSlot.name, () => {
    it("replaces one move without shifting later slots", () => {
        expect(
            setMoveAtSlot(
                ["Tackle", "Quick Attack", "Iron Tail", "Volt Tackle"],
                0,
                "Thunderbolt",
            ),
        ).toEqual(["Thunderbolt", "Quick Attack", "Iron Tail", "Volt Tackle"]);
    });

    it("preserves later moves when a middle slot is cleared", () => {
        expect(
            setMoveAtSlot(
                ["Tackle", "Quick Attack", "Iron Tail", "Volt Tackle"],
                1,
                "",
            ),
        ).toEqual(["Tackle", "", "Iron Tail", "Volt Tackle"]);
    });

    it("trims empty trailing slots", () => {
        expect(setMoveAtSlot(["Tackle", "Growl"], 1, "")).toEqual(["Tackle"]);
    });
});

describe(PokemonMoveInput.name, () => {
    beforeEach(() => {
        dispatchMock.mockClear();
    });

    const renderMoveInput = (value: string[]) => {
        const props: PokemonInputProps = {
            edit: { moves: value },
            inputName: "moves",
            key: "moves",
            labelName: "Moves",
            onChange: vi.fn(),
            selectedId: "pokemon-1",
            setEdit: vi.fn(),
            type: "moves",
            value,
        };

        const { key, ...inputProps } = props;

        return render(<PokemonMoveInput key={key} {...inputProps} />);
    };

    it("renders four independently editable move slots", () => {
        renderMoveInput(["Tackle", "Quick Attack"]);

        expect(screen.getByLabelText("Move 1")).toBeTruthy();
        expect(screen.getByLabelText("Move 2")).toBeTruthy();
        expect(screen.getByLabelText("Move 3")).toBeTruthy();
        expect(screen.getByLabelText("Move 4")).toBeTruthy();
    });

    it("updates the edited slot while keeping later moves in place", () => {
        renderMoveInput([
            "Tackle",
            "Quick Attack",
            "Iron Tail",
            "Volt Tackle",
        ]);

        fireEvent.change(screen.getByLabelText("Move 1"), {
            target: { value: "Thunderbolt" },
        });

        expect(dispatchMock).toHaveBeenCalledWith(
            editPokemon(
                {
                    moves: [
                        "Thunderbolt",
                        "Quick Attack",
                        "Iron Tail",
                        "Volt Tackle",
                    ],
                },
                "pokemon-1",
            ),
        );
    });

    it("can clear an earlier slot without removing later moves", () => {
        renderMoveInput([
            "Tackle",
            "Quick Attack",
            "Iron Tail",
            "Volt Tackle",
        ]);

        fireEvent.change(screen.getByLabelText("Move 2"), {
            target: { value: "" },
        });

        expect(dispatchMock).toHaveBeenCalledWith(
            editPokemon(
                {
                    moves: ["Tackle", "", "Iron Tail", "Volt Tackle"],
                },
                "pokemon-1",
            ),
        );
    });
});
