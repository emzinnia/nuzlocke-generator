import * as React from "react";
import { render, screen } from "utils/testUtils";
import { TrainerResultBase } from "../TrainerResult";
import { styleDefaults } from "utils";

describe("<TrainerResult />", () => {
    it("uses a custom version name in the badge and default title", () => {
        render(
            <TrainerResultBase
                orientation="vertical"
                checkpoints={[]}
                trainer={{ badges: [] }}
                game={{ name: "FireRed", customName: "Radical Red" }}
                style={{
                    ...styleDefaults,
                    displayBadges: false,
                    displayRules: false,
                }}
                rules={[]}
            />,
        );

        expect(screen.getByText("Radical Red")).toBeDefined();
        expect(screen.getByText("Radical Red Nuzlocke")).toBeDefined();
        expect(screen.queryByText("FireRed Nuzlocke")).toBeNull();
    });
});
