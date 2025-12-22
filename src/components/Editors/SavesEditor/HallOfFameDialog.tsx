import {
    Button,
    ButtonGroup,
    Classes,
    Dialog,
    DialogProps,
    Intent,
} from "components/ui/shims";
import { css, cx } from "emotion";
import * as React from "react";

const hofImage = "assets/hall-of-fame.png";

const styles = {
    hallOfFameDialog: css`
        padding: 0.25rem;
    `,
    hallOfFameImage: css`
        height: 10rem;
        display: block;
        margin: 1rem auto;
        margin-top: 0.5rem;
        image-rendering: pixelated;
    `,
    hallOfFameText: css``,
};

export type HallOfFameDialogProps = DialogProps & {};

export function HallOfFameDialog(props: HallOfFameDialogProps) {
    return (
        <Dialog {...props}>
            <div className={cx(styles.hallOfFameDialog, Classes.DIALOG_BODY)}>
                <img
                    alt="Hall of Fame"
                    className={styles.hallOfFameImage}
                    src={hofImage}
                />
                <p className={styles.hallOfFameText}>
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
