import {
    Button,
    ButtonGroup,
    Classes,
    Dialog,
    DialogProps,
    Intent,
} from "components/ui/shims";
import { HotkeyIndicator } from "components/Common/Shared";
import * as React from "react";
import { useEffect, useCallback } from "react";

const hofImage = "/assets/hall-of-fame.png";

export type HallOfFameDialogProps = Omit<DialogProps, "icon"> & {
    icon?: string;
    onSubmit: () => void;
};

export function HallOfFameDialog(props: HallOfFameDialogProps) {
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && props.isOpen) {
                e.preventDefault();
                props.onSubmit();
            }
        },
        [props.isOpen, props.onSubmit]
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    return (
        <Dialog {...props}>
            <div className={`p-1 ${Classes.DIALOG_BODY}`}>
                <img
                    alt="Hall of Fame"
                    className="h-40 block mx-auto mt-2 mb-4 [image-rendering:pixelated]"
                    src={hofImage}
                />
                <p>
                    Submitting to the Hall of Fame uploads your nuzlocke to a
                    persistent record.
                </p>
                <div className="flex gap-2 justify-between">
                    <Button
                        intent={Intent.DANGER}
                        minimal
                        onClick={props.onClose}
                        hotkey={{ key: "ESC", showModifier: false }}
                    >
                        Cancel
                    </Button>
                    <Button onClick={props.onSubmit} intent={Intent.SUCCESS}>
                        Submit to Hall of Fame{" "}
                        <HotkeyIndicator
                            hotkey="↵"
                            style={{ marginLeft: "0.35rem" }}
                        />
                    </Button>
                </div>
            </div>
        </Dialog>
    );
}
