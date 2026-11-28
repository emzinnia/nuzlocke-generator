import * as React from "react";
import { render } from "utils/testUtils";
import {
    determineNumberOfHearts,
    PokemonFriendship,
} from "../PokemonFriendship";

describe(determineNumberOfHearts.name, () => {
    it("should return 0 hearts", () => {
        expect(determineNumberOfHearts(255)).toBe(5);
        expect(determineNumberOfHearts(250)).toBe(5);
        expect(determineNumberOfHearts(33)).toBe(0);
        expect(determineNumberOfHearts(100)).toBe(2);
        // @ts-expect-error - Testing null handling
        expect(determineNumberOfHearts(null)).toBe(0);
    });
});

describe(PokemonFriendship.name, () => {
    it("should not render", async () => {
        const screen = render(<PokemonFriendship />);
        console.log(await screen.debug());
        expect(await screen.queryByTestId("friendship-icon")).toBeNull();
    });

    it("should render the correct # of hearts", async () => {
        const screen = render(<PokemonFriendship friendship={250} />);
        const icons = await screen.findAllByTestId("friendship-icon");
        expect(await icons.length).toBe(5);
    });

    it("should render a broken heart at 0 hearts", async () => {
        const screen = render(<PokemonFriendship friendship={1} />);
        expect(
            await screen.findByTestId("friendship-broken-icon"),
        ).toBeTruthy();
    });
});
