import { vi } from "vitest";

import {
    CurrentPokemonEditBase,
    CurrentPokemonEditProps,
} from "../CurrentPokemonEdit";

describe("<CurrentPokemonEdit />", () => {
    it("uses the current game generation when evolving Pokemon", () => {
        const editPokemon = vi.fn();
        const props = {
            selectedId: "togepi",
            box: [],
            pokemon: [
                {
                    id: "togepi",
                    position: 0,
                    species: "Togepi",
                    status: "Team",
                    gender: "genderless",
                    met: "",
                    nature: "None",
                    ability: "",
                    types: ["Normal", "Normal"],
                    egg: false,
                    gameOfOrigin: "SoulSilver",
                },
            ],
            selectPokemon: vi.fn(),
            editPokemon,
            addPokemon: vi.fn(),
            game: { name: "SoulSilver", customName: "" },
            editor: { minimized: false },
            customTypes: [],
            customAreas: [],
        } as CurrentPokemonEditProps;
        const subject = new CurrentPokemonEditBase(props);

        subject.state = { ...subject.state, selectedId: "togepi" };
        subject["evolvePokemon"]("Togetic")({});

        expect(editPokemon).toHaveBeenCalledWith(
            {
                species: "Togetic",
                types: ["Normal", "Flying"],
            },
            "togepi",
        );
    });
});
