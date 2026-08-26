import * as React from "react";
import {
    Intent,
    OverlayToaster,
    Position,
    Toaster,
    ToastProps,
} from "@blueprintjs/core";
import {
    onPersistFailure,
    PERSIST_FAILURE_TOAST_COOLDOWN_MS,
} from "store/persistFailure";

let appToaster: Toaster | null = null;
let lastPersistFailureToastAt = 0;

const clearAppToaster = () => {
    appToaster = null;
};

export const AppToasterHost: React.FC = () => {
    const toasterCallback = React.useCallback(
        (instance: OverlayToaster | null) => {
            appToaster = instance;
        },
        [],
    );

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

onPersistFailure(() => {
    const now = Date.now();
    if (now - lastPersistFailureToastAt < PERSIST_FAILURE_TOAST_COOLDOWN_MS) {
        return;
    }
    lastPersistFailureToastAt = now;
    showToast({
        message:
            "Auto-save failed. Browser storage may be full — export your data and delete old saves.",
        intent: Intent.DANGER,
    });
});
