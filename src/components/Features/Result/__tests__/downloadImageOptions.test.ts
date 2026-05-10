import { getDownloadImageOptions } from "../downloadImageOptions";

describe("getDownloadImageOptions", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("enables the dom-to-image CORS proxy option", () => {
        expect(getDownloadImageOptions()).toEqual({
            corsImg: {
                method: "GET",
                url: "https://cors-anywhere-nuzgen.herokuapp.com/#{cors}",
                data: {},
            },
            imagePlaceholder:
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==",
        });
    });

    it("uses the configured CORS proxy URL without duplicating slashes", () => {
        vi.stubEnv("VITE_CORS_ANYWHERE_URL", "https://cors.example/proxy/");

        expect(getDownloadImageOptions().corsImg.url).toBe(
            "https://cors.example/proxy/#{cors}",
        );
    });
});
