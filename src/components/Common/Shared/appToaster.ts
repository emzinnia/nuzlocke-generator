import { IToaster, Position, Toaster, ToastProps } from "@blueprintjs/core";

let appToaster: IToaster | null = null;

export const getAppToaster = (): IToaster | null => {
    if (appToaster) {
        return appToaster;
    }

    if (typeof document === "undefined") {
        return null;
    }

    appToaster = Toaster.create({ position: Position.TOP, maxToasts: 3 });
    return appToaster;
};

export const showToast = (toast: ToastProps): string | undefined => {
    const toaster = getAppToaster();
    if (!toaster) return undefined;
    return toaster.show(toast);
};

