import { v4 as uuid } from "uuid";

type DomToImage = {
    toPng: (
        node: HTMLElement,
        options?: { corsImage?: boolean },
    ) => Promise<string>;
};

const CSS_IMPORT_URL_PATTERN =
    /@import\s+(?:url\(\s*)?(?:"([^"]+)"|'([^']+)'|([^'")\s;]+))(?:\s*\))?[^;]*;/gi;

async function loadDomToImage() {
    const resource = await import("@emmaramirez/dom-to-image");
    return resource.domToImage as DomToImage;
}

export function getImportedStylesheetUrls(css: string, baseUrl = document.baseURI) {
    const urls = new Set<string>();
    let match: RegExpExecArray | null;

    while ((match = CSS_IMPORT_URL_PATTERN.exec(css))) {
        const href = match[1] ?? match[2] ?? match[3];
        if (!href) continue;

        try {
            const url = new URL(href, baseUrl);
            if (url.protocol === "http:" || url.protocol === "https:") {
                urls.add(url.href);
            }
        } catch {
            // Ignore malformed @import URLs in user-provided custom CSS.
        }
    }

    return Array.from(urls);
}

async function fetchImportedStylesheet(url: string) {
    try {
        const response = await fetch(url);
        if (!response.ok) return "";
        return response.text();
    } catch (error) {
        console.warn(`Unable to inline imported stylesheet ${url}`, error);
        return "";
    }
}

async function appendImportedStylesheets(customCSS: string) {
    if (!customCSS || typeof fetch === "undefined") return () => {};

    const urls = getImportedStylesheetUrls(customCSS);
    if (!urls.length) return () => {};

    const importedCSS = (await Promise.all(urls.map(fetchImportedStylesheet)))
        .filter(Boolean)
        .join("\n");
    if (!importedCSS) return () => {};

    const styleElement = document.createElement("style");
    styleElement.dataset.ngImageFontImports = "true";
    styleElement.textContent = importedCSS;
    document.head.appendChild(styleElement);

    return () => styleElement.remove();
}

async function waitForFonts() {
    if ("fonts" in document) {
        try {
            await document.fonts.ready;
        } catch {
            // Font readiness is best-effort; image download should still proceed.
        }
    }
}

export async function downloadResultAsPng({
    node,
    customCSS,
    filename = `nuzlocke-${uuid()}.png`,
}: {
    node: HTMLElement;
    customCSS: string;
    filename?: string;
}) {
    const cleanupImportedStylesheets = await appendImportedStylesheets(customCSS);

    try {
        await waitForFonts();
        const domToImage = await loadDomToImage();
        const dataUrl = await domToImage.toPng(node, {
            corsImage: true,
        });
        const link = document.createElement("a");
        link.download = filename;
        link.href = dataUrl;
        link.click();
        return dataUrl;
    } finally {
        cleanupImportedStylesheets();
    }
}
