import * as React from "react";
import { render, screen } from "utils/testUtils";
import { styleDefaults } from "utils";
import { TrainerResultBase } from "../TrainerResult";

describe("<TrainerResult />", () => {
    it("labels randomized runs in the trainer section", () => {
        render(
            <TrainerResultBase
                orientation="horizontal"
                checkpoints={[]}
                trainer={{ badges: [] }}
                game={{ name: "White", customName: "", randomized: true }}
                style={{ ...styleDefaults, displayBadges: false }}
                rules={[]}
            />,
        );

        expect(screen.getByText("Randomized")).toBeTruthy();
        expect(screen.getByText("White Randomized Nuzlocke")).toBeTruthy();
    });
});
