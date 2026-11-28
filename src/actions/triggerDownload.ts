import { Action } from "./action";

export type TRIGGER_DOWNLOAD = "TRIGGER_DOWNLOAD";
export const TRIGGER_DOWNLOAD: TRIGGER_DOWNLOAD = "TRIGGER_DOWNLOAD";

export type triggerDownload = () => Action<TRIGGER_DOWNLOAD, boolean>;
export const triggerDownload = (): Action<TRIGGER_DOWNLOAD, boolean> => {
    return {
        type: TRIGGER_DOWNLOAD,
    };
};
