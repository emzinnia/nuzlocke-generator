import { GenderElement } from "../GenderElement";
import { render, screen } from "utils/testUtils";

describe(GenderElement.name, () => {
    it("renders its contents [male]", () => {
        const subject = GenderElement("m");
        render(subject!);
        expect(screen.getByTestId("gender-text").textContent).toBe("♂");
    });

    it("renders its contents [female]", () => {
        const subject = GenderElement("f");
        render(subject!);
        expect(screen.getByTestId("gender-text").textContent).toBe("♀");
    });

    it("renders its content [neutral]", () => {
        const subject = GenderElement(null);
        expect(subject).toBeNull();
    });
});
