import {
    Button,
    ButtonGroup,
    Classes,
    Dialog,
    DialogProps,
    Intent,
} from "components/ui/shims";
import * as React from "react";

const hofImage = "assets/hall-of-fame.png";

export type HallOfFameDialogProps = Omit<DialogProps, 'icon'> & {
    icon?: string;
};

export function HallOfFameDialog(props: HallOfFameDialogProps) {
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
                <div className={Classes.DIALOG_FOOTER}>
                    <ButtonGroup className={Classes.DIALOG_FOOTER_ACTIONS}>
                        <Button
                            intent={Intent.DANGER}
                            minimal
                            onClick={props.onClose}
                        >
                            Cancel
                        </Button>
                        <Button intent={Intent.SUCCESS}>
                            Submit to Hall of Fame
                        </Button>
                    </ButtonGroup>
                </div>
            </div>
        </Dialog>
    );
}
