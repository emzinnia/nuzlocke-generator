import { matchSpeciesToTypes } from "../matchSpeciesToTypes";
import { Types } from "../../Types";

describe(matchSpeciesToTypes.name, () => {
    it("returns the Aron line types in canonical order", () => {
        expect(matchSpeciesToTypes("Aron")).toEqual([
            Types.Steel,
            Types.Rock,
        ]);
        expect(matchSpeciesToTypes("Lairon")).toEqual([
            Types.Steel,
            Types.Rock,
        ]);
        expect(matchSpeciesToTypes("Aggron")).toEqual([
            Types.Steel,
            Types.Rock,
        ]);
    });

    it("returns Mega Lopunny's Fighting secondary type", () => {
        expect(matchSpeciesToTypes("Lopunny", "Mega")).toEqual([
            Types.Normal,
            Types.Fighting,
        ]);
    });
});
