import * as React from "react";

export interface ResizedImageProps
    extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
    src: string;
    width: number;
    height: number;
}

async function resizeToDataUrl(src: string, width: number, height: number) {
    // If we don't have DOM primitives (SSR/tests), just fall back.
    if (typeof document === "undefined") return src;

    return await new Promise<string>((resolve) => {
        try {
            const img = new Image();
            // Avoid tainting the canvas for remote sources that support CORS.
            img.crossOrigin = "anonymous";
            img.decoding = "async";
            img.onload = () => {
                try {
                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    if (!ctx) {
                        resolve(src);
                        return;
                    }
                    // Resize using drawImage. We intentionally force exact dimensions.
                    ctx.clearRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL("image/png"));
                } catch {
                    resolve(src);
                }
            };
            img.onerror = () => resolve(src);
            img.src = src;
        } catch {
            resolve(src);
        }
    });
}

/**
 * Renders an <img> but first resizes the provided `src` to a fixed `width`/`height`
 * (returning a PNG data URL). Falls back to the original `src` if resizing fails.
 */
export function ResizedImage({ src, width, height, ...imgProps }: ResizedImageProps) {
    const [resizedSrc, setResizedSrc] = React.useState(src);

    React.useEffect(() => {
        let cancelled = false;
        (async () => {
            const next = await resizeToDataUrl(src, width, height);
            if (!cancelled) setResizedSrc(next);
        })();
        return () => {
            cancelled = true;
        };
    }, [src, width, height]);

    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...imgProps} src={resizedSrc} />;
}


