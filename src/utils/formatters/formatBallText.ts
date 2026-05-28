import { normalizePokeballName } from "./normalizePokeballName";

export const formatBallText = (b: string) => {
    const normalized = normalizePokeballName(b);
    return (
        normalized &&
        normalized
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s*Ball$/i, "")
            .toLowerCase()
    );
};
