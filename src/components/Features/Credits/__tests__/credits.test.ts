import credits from "../credits.json";
import type { CreditsData } from "../Credits";

const porygon2ArtworkLink =
    "https://www.deviantart.com/krisantyne/art/Gotta-Draw-em-All-Collab-Porygon2-487217458";

describe("credits data", () => {
    it("credits Krisantyne's Porygon2 art with the source artwork link", () => {
        const porygon2Credits = (credits as CreditsData).art.filter(
            (credit) => credit.role === "Porygon2",
        );

        expect(porygon2Credits.length).toBeGreaterThan(0);
        expect(porygon2Credits).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: "Krisantyne",
                    link: porygon2ArtworkLink,
                    role: "Porygon2",
                }),
            ]),
        );
        expect(
            porygon2Credits.every(
                (credit) => credit.link === porygon2ArtworkLink,
            ),
        ).toBe(true);
    });
});
