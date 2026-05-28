import * as React from "react";
import {
    BadgeInput,
    isAliveForCheckpointAward,
    mergeCheckpointAwards,
} from "..";
import { render, screen } from "utils/testUtils";

describe("<BadgeInput />", () => {
    it("renders its contents", () => {
        render(<BadgeInput />);
        expect(screen).toBeDefined();
    });

    it("renders a batch checkpoint award button for trainer checkpoints", () => {
        render(<BadgeInput />);
        expect(
            screen.getByRole("button", {
                name: "Award Checkpoints to Alive Pokemon",
            }),
        ).toBeDefined();
    });
});

describe("checkpoint batch award helpers", () => {
    it("merges awarded checkpoints without duplicating existing badges", () => {
        const basicBadge = { name: "Basic Badge", image: "basic-badge" };
        const toxicBadge = { name: "Toxic Badge", image: "toxic-badge" };

        expect(mergeCheckpointAwards([basicBadge], [basicBadge, toxicBadge]))
            .toEqual([basicBadge, toxicBadge]);
    });

    it("only considers non-dead Pokemon alive for checkpoint awards", () => {
        expect(
            isAliveForCheckpointAward({
                id: "team-1",
                species: "Pikachu",
                status: "Team",
            }),
        ).toBe(true);
        expect(
            isAliveForCheckpointAward({
                id: "dead-1",
                species: "Pikachu",
                status: "Dead",
            }),
        ).toBe(false);
    });
});
