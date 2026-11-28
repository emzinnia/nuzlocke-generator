import { normalizePokeballName } from "./normalizePokeballName";

export const formatBallText = (b: string) => {
    const normalized = normalizePokeballName(b);
    return normalized && normalized.replace(/\s*Ball$/i, "").toLowerCase();
};
