import * as React from "react";
import { OverlayToaster, Position, Toaster, ToastProps } from "@blueprintjs/core";

let appToaster: Toaster | null = null;

const clearAppToaster = () => {
    appToaster = null;
};

export const AppToasterHost: React.FC = () => {
    const toasterCallback = React.useCallback((instance: Toaster | null) => {
        appToaster = instance;
    }, []);

    React.useEffect(() => {
        return clearAppToaster;
    }, []);

    return React.createElement(OverlayToaster, {
        ref: toasterCallback,
        position: Position.TOP,
        maxToasts: 3,
    });
};

export const getAppToaster = (): Toaster | null => appToaster;

export const showToast = (toast: ToastProps): string | undefined => {
    const toaster = getAppToaster();
    if (!toaster) return undefined;
    return toaster.show(toast);
};

