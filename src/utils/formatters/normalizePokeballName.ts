export const normalizePokeballName = (name?: string | null) => {
    if (!name) return name ?? undefined;

    // Strip diacritics so "Poké Ball" behaves like "Poke Ball"
    const ascii = name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    if (ascii.toLowerCase() === "poke ball") return "Poke Ball";

    return ascii;
};


