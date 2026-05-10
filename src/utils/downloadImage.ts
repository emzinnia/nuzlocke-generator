export type DownloadImageResult = "downloaded" | "shared";

type FileShareData = {
    files: File[];
    title?: string;
    text?: string;
};

type ShareNavigator = Pick<Navigator, "userAgent"> & {
    share?: (data: FileShareData) => Promise<void>;
    canShare?: (data: FileShareData) => boolean;
};

type DownloadImageDependencies = {
    document?: Document;
    fileConstructor?: typeof File;
    navigator?: ShareNavigator;
    setTimeout?: Window["setTimeout"];
    url?: Pick<typeof URL, "createObjectURL" | "revokeObjectURL">;
};

const DEFAULT_IMAGE_TYPE = "image/png";
const REVOKE_OBJECT_URL_DELAY_MS = 30_000;

const isShareAbortError = (error: unknown): boolean =>
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "AbortError";

export const isAndroidUserAgent = (userAgent = ""): boolean =>
    /\bAndroid\b/i.test(userAgent);

export const dataUrlToBlob = (dataUrl: string): Blob => {
    const separatorIndex = dataUrl.indexOf(",");

    if (!dataUrl.startsWith("data:") || separatorIndex === -1) {
        throw new Error("Expected a data URL to download.");
    }

    const metadata = dataUrl.slice(5, separatorIndex);
    const data = dataUrl.slice(separatorIndex + 1);
    const mimeType = metadata.split(";")[0] || DEFAULT_IMAGE_TYPE;
    const isBase64 = metadata
        .split(";")
        .some((part) => part.toLowerCase() === "base64");

    if (!isBase64) {
        return new Blob([decodeURIComponent(data)], { type: mimeType });
    }

    const binary = atob(data);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
    }

    return new Blob([bytes], { type: mimeType });
};

const getDownloadDependencies = (dependencies: DownloadImageDependencies) => ({
    document: dependencies.document ?? document,
    fileConstructor:
        dependencies.fileConstructor ??
        (typeof File === "undefined" ? undefined : File),
    navigator: dependencies.navigator ?? navigator,
    setTimeout: dependencies.setTimeout ?? window.setTimeout.bind(window),
    url: dependencies.url ?? URL,
});

// Android browsers often ignore `download` on generated data URLs. Prefer
// native file sharing there, then fall back to a Blob URL anchor.
const shareImageOnAndroid = async (
    blob: Blob,
    filename: string,
    dependencies: ReturnType<typeof getDownloadDependencies>,
): Promise<boolean> => {
    if (!isAndroidUserAgent(dependencies.navigator.userAgent)) {
        return false;
    }

    if (!dependencies.navigator.share || !dependencies.fileConstructor) {
        return false;
    }

    const FileConstructor = dependencies.fileConstructor;
    const file = new FileConstructor([blob], filename, {
        type: blob.type || DEFAULT_IMAGE_TYPE,
    });
    const shareData: FileShareData = {
        files: [file],
        title: filename,
        text: "Nuzlocke result image",
    };

    if (dependencies.navigator.canShare) {
        try {
            if (!dependencies.navigator.canShare(shareData)) {
                return false;
            }
        } catch {
            return false;
        }
    }

    try {
        await dependencies.navigator.share(shareData);
        return true;
    } catch (error) {
        if (isShareAbortError(error)) {
            return true;
        }

        return false;
    }
};

const downloadBlob = (
    blob: Blob,
    filename: string,
    dependencies: ReturnType<typeof getDownloadDependencies>,
): void => {
    const objectUrl = dependencies.url.createObjectURL(blob);
    const link = dependencies.document.createElement("a");

    link.download = filename;
    link.href = objectUrl;
    link.rel = "noopener";
    link.target = "_blank";
    link.style.display = "none";

    dependencies.document.body.appendChild(link);
    link.click();
    link.remove();

    dependencies.setTimeout(() => {
        dependencies.url.revokeObjectURL(objectUrl);
    }, REVOKE_OBJECT_URL_DELAY_MS);
};

export const downloadImageDataUrl = async (
    dataUrl: string,
    filename: string,
    dependencies: DownloadImageDependencies = {},
): Promise<DownloadImageResult> => {
    const resolvedDependencies = getDownloadDependencies(dependencies);
    const blob = dataUrlToBlob(dataUrl);
    const shared = await shareImageOnAndroid(
        blob,
        filename,
        resolvedDependencies,
    );

    if (shared) {
        return "shared";
    }

    downloadBlob(blob, filename, resolvedDependencies);
    return "downloaded";
};
