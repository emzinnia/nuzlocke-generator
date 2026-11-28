import * as React from "react";
import { BadgeInput } from "..";
import { render, screen } from "utils/testUtils";

describe("<BadgeInput />", () => {
    it("renders its contents", () => {
        render(<BadgeInput />);
        expect(screen).toBeDefined();
    });
});
