import * as React from "react";
import { Button, Intent } from "components/ui";
import { showToast } from "./appToaster";

const toBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });

export interface ImageUploadProps {
    onSuccess: (data: string, fileName?: string) => void;
    onError?: (error: any) => void;
    multiple?: boolean;
}

const onUpload =
    ({ onSuccess, onError }: ImageUploadProps) =>
    async (e: any) => {
        const files: File[] = Array.from(
            // Prefer `target` (matches how RTL passes `fireEvent.change(..., { target: { files }})`)
            e?.target?.files ?? e?.currentTarget?.files ?? [],
        );
        if (!files.length) {
            if (onError) {
                onError(e);
            }
            showToast({
                message: "No file detected.",
                intent: Intent.DANGER,
            });
            return;
        }

        let uploaded = 0;
        let tooLarge = 0;
        let failed = 0;

        for (const file of files) {
            const size = (file?.size ?? 0) / 1024 / 1024;
            if (size > 0.5) {
                tooLarge += 1;
                continue;
            }
            try {
                const image = await toBase64(file);
                onSuccess?.(image as string, file?.name);
                uploaded += 1;
            } catch (err) {
                failed += 1;
                onError?.(err);
            }
        }

        // Allow selecting the same files again (browser won't fire change otherwise).
        try {
            if (e?.target) {
                e.target.value = "";
            } else if (e?.currentTarget) {
                e.currentTarget.value = "";
            }
        } catch {
            // ignore
        }

        if (files.length === 1) {
            if (uploaded === 1) {
                showToast({
                    message: "Upload successful!",
                    intent: Intent.SUCCESS,
                });
                return;
            }
            if (tooLarge === 1) {
                const size = (files[0]?.size ?? 0) / 1024 / 1024;
                showToast({
                    message: `File size of 500KB exceeded. File was ${size.toFixed(2)}MB`,
                    intent: Intent.DANGER,
                });
                return;
            }
            showToast({
                message: "Error in parsing file.",
                intent: Intent.DANGER,
            });
            return;
        }

        if (uploaded > 0) {
            const skippedText =
                tooLarge > 0 ? ` Skipped ${tooLarge} too-large.` : "";
            const failedText = failed > 0 ? ` Failed ${failed}.` : "";
            showToast({
                message: `Uploaded ${uploaded} images.${skippedText}${failedText}`,
                intent: failed > 0 ? Intent.WARNING : Intent.SUCCESS,
            });
        } else {
            const skippedText =
                tooLarge > 0 ? `Skipped ${tooLarge} too-large.` : "";
            const failedText = failed > 0 ? `Failed ${failed}.` : "";
            showToast({
                message: `No images uploaded. ${skippedText}${failedText}`.trim(),
                intent: Intent.DANGER,
            });
        }
    };

export function ImageUpload({ onSuccess, onError, multiple }: ImageUploadProps) {
    return (
        <>
            <Button
                icon="upload"
                style={{ position: "relative", cursor: "pointer" }}
            >
                Upload Image
                <input
                    accept="image/*"
                    multiple={Boolean(multiple)}
                    style={{
                        cursor: "pointer",
                        opacity: 0,
                        position: "absolute",
                        left: 0,
                        top: 0,
                        width: "100%",
                        height: "100%",
                    }}
                    onChange={onUpload({ onSuccess, onError })}
                    type="file"
                />
            </Button>
        </>
    );
}
