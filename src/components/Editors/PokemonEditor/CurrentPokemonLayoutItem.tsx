import * as React from "react";
import { cx, css } from "emotion";

const style = {
    Layout: css`
        align-items: center;
        display: flex;
        width: 100%;
        flex-wrap: wrap;
    `,
    disabled: css`
        pointer-events: none;
        opacity: 0.85;
    `,
    checkboxes: css`
        margin-top: -1rem;
        padding: 0.5rem;
    `,
    fullWidth: css`
        width: 100%;
    `,
};

export function CurrentPokemonLayoutItem({
    disabled,
    checkboxes,
    className,
    children,
    fullWidth,
}: {
    disabled?: boolean;
    checkboxes?: boolean;
    className?: string;
    children: React.ReactNode;
    fullWidth?: boolean;
}) {
    return (
        <div
            className={cx(
                className ?? "",
                style.Layout,
                disabled && style.disabled,
                checkboxes && style.checkboxes,
                fullWidth && style.fullWidth,
            )}
        >
            {children}
        </div>
    );
}
