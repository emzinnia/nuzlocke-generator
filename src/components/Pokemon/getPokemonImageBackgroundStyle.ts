import type { CSSProperties } from "react";
import type { Styles } from "utils";

type PokemonImageBackgroundStyleOptions = Pick<
    Styles,
    "scaleSprites" | "spritesMode" | "teamImages"
>;

export function getPokemonImageBackgroundStyle({
    scaleSprites,
    spritesMode,
    teamImages,
}: PokemonImageBackgroundStyleOptions): CSSProperties {
    const centeredBackgroundStyle: CSSProperties = {
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
    };

    if (spritesMode) {
        return {
            ...centeredBackgroundStyle,
            backgroundSize: scaleSprites ? "auto" : "cover",
        };
    }

    if (teamImages === "dream world") {
        return {
            ...centeredBackgroundStyle,
            backgroundSize: "contain",
        };
    }

    return {
        ...centeredBackgroundStyle,
        backgroundSize: "cover",
    };
}
