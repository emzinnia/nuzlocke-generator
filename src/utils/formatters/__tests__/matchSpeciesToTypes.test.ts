import { matchSpeciesToTypes } from "../matchSpeciesToTypes";
import { Types } from "../../Types";

describe(matchSpeciesToTypes.name, () => {
    it("returns Aggron's types in the correct order without changing its pre-evolutions", () => {
        expect(matchSpeciesToTypes("Aggron")).toEqual([
            Types.Steel,
            Types.Rock,
        ]);
        expect(matchSpeciesToTypes("Aron")).toEqual([Types.Rock, Types.Steel]);
        expect(matchSpeciesToTypes("Lairon")).toEqual([
            Types.Rock,
            Types.Steel,
        ]);
    });
});
