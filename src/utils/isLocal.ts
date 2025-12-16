// Checks if it's the local build of the nuzlocke generator
export const isLocal = () =>
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
