export const isEmpty = (value: unknown) => {
    if (value == null) return true;
    if (String(value) === "") return true;
    if ("length" in Object(value) && !((value as { length: number }).length)) return true;
    if (JSON.stringify(value) === "{}") return true;
    return false;
};
