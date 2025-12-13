import * as React from "react";
import { Button } from "components/Common/ui";
import { toast } from "components/Common/ui/Toast";

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
}

const onUpload =
    ({ onSuccess, onError }: ImageUploadProps) =>
    async (e: any) => {
        const file = e?.target?.files?.[0];
        if (!file) {
            if (onError) {
                onError(e);
            }
            toast.error("No file detected.");
            return;
        }
        const size = file?.size / 1024 / 1024;
        if (size > 0.5) {
            toast.error(`File size of 500KB exceeded. File was ${size.toFixed(2)}MB`);
        } else {
            try {
                const image = await toBase64(file);
                if (onSuccess) {
                    onSuccess(image as string, file?.name);
                }

                console.log(image);
                toast.success("Upload successful!");
            } catch (e) {
                if (onError) {
                    onError(e);
                }
                toast.error(`Error in parsing file. ${e}`);
            }
        }
    };

export function ImageUpload({ onSuccess, onError }: ImageUploadProps) {
    return (
        <>
            <Button
                icon="upload"
                style={{ position: "relative", cursor: "pointer" }}
            >
                Upload Image
                <input
                    accept="image/*"
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
