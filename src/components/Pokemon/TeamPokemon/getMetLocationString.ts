import { Pokemon } from "models";

export const getMetLocationString = ({
    poke,
    oldMetLocationFormat,
}: {
    poke: Pokemon;
    oldMetLocationFormat: boolean;
}): string | null => {
    const determinePreposition = () =>
        poke.met && poke.met.toLocaleLowerCase().startsWith("route")
            ? "on"
            : "in";
    const met = poke.met || "";
    const metLevel = poke.metLevel || "";
    if (poke.met) {
        if (poke.met.toLocaleLowerCase() === "starter") {
            return `Met as ${met} at lv.${metLevel}`;
        }
        if (oldMetLocationFormat) {
            return `Met ${determinePreposition()} ${met}, from lv.${metLevel}`;
        } else {
            return `Met Location: ${met} at lv.${metLevel}`;
        }
    } else {
        return null;
    }
};
