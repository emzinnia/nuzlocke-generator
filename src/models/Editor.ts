export interface Editor {
    minimized: boolean;
    showResultInMobile?: boolean;
    downloadRequested?: number; // Timestamp to trigger downloads
    zoomLevel?: number;
    baseEditors?: Record<string, boolean>;
}
