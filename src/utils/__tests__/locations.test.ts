import { locations } from "utils/data/listOfLocations";

describe("location data", () => {
    it("includes requested Sinnoh and Renegade Platinum encounter locations", () => {
        expect(locations.Sinnoh).toEqual(
            expect.arrayContaining([
                "Sandgem Town",
                "Jubilife City",
                "Trainers' School",
                "Floaroma Town",
                "T.G. Eterna Bldg",
                "Pokémon Mansion",
                "Veilstone City",
            ]),
        );
    });

    it("includes requested Scarlet and Violet encounter locations", () => {
        expect(locations.Paldea).toEqual(
            expect.arrayContaining([
                "Poco Path",
                "Socarrat Trail",
                "Alfornada Cavern",
                "Inlet Grotto",
            ]),
        );
    });
});
