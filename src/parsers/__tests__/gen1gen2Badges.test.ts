import { describe, expect, it } from "vitest";
import { Buffer } from "buffer";
import { parseGen1Badges } from "../gen1";
import { parseJohtoBadges } from "../gen2";

describe("Gen 1 badge bitfield", () => {
    it("maps LSB-first bits to the correct gym badges", () => {
        expect(parseGen1Badges(0x01).map((b) => b.name)).toEqual([
            "Boulder Badge",
        ]);
        expect(parseGen1Badges(0x02).map((b) => b.name)).toEqual([
            "Cascade Badge",
        ]);
        expect(parseGen1Badges(0x04).map((b) => b.name)).toEqual([
            "Thunder Badge",
        ]);
        expect(parseGen1Badges(0x80).map((b) => b.name)).toEqual([
            "Earth Badge",
        ]);
        expect(parseGen1Badges(0x05).map((b) => b.name)).toEqual([
            "Boulder Badge",
            "Thunder Badge",
        ]);
        expect(parseGen1Badges(0xff).map((b) => b.name)).toEqual([
            "Boulder Badge",
            "Cascade Badge",
            "Thunder Badge",
            "Rainbow Badge",
            "Soul Badge",
            "Marsh Badge",
            "Volcano Badge",
            "Earth Badge",
        ]);
    });

    it("does not treat an unpadded binary string as a badge index map", () => {
        // Regression: (2).toString(2) === "10" used to report Boulder instead of Cascade.
        expect(parseGen1Badges(2).map((b) => b.name)).toEqual([
            "Cascade Badge",
        ]);
        expect(parseGen1Badges(2).map((b) => b.name)).not.toContain(
            "Boulder Badge",
        );
    });
});

describe("Gen 2 Johto/Kanto badge bitfields", () => {
    it("maps Johto LSB-first bits including Mineral before Storm", () => {
        expect(
            parseJohtoBadges(Buffer.from([0x01, 0x00])).map((b) => b.name),
        ).toEqual(["Zephyr Badge"]);
        expect(
            parseJohtoBadges(Buffer.from([0x80, 0x00])).map((b) => b.name),
        ).toEqual(["Rising Badge"]);
        expect(
            parseJohtoBadges(Buffer.from([0x10, 0x00])).map((b) => b.name),
        ).toEqual(["Mineral Badge"]);
        expect(
            parseJohtoBadges(Buffer.from([0x20, 0x00])).map((b) => b.name),
        ).toEqual(["Storm Badge"]);
    });

    it("maps Kanto badges from the second byte LSB-first", () => {
        expect(
            parseJohtoBadges(Buffer.from([0x00, 0x01])).map((b) => b.name),
        ).toEqual(["Boulder Badge"]);
        expect(
            parseJohtoBadges(Buffer.from([0x00, 0x80])).map((b) => b.name),
        ).toEqual(["Earth Badge"]);
        expect(
            parseJohtoBadges(Buffer.from([0xff, 0xff])).map((b) => b.name),
        ).toHaveLength(16);
    });
});
