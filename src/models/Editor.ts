export interface Editor {
    minimized: boolean;
    temtemMode?: boolean;
    monsterType?: string;
    showResultInMobile?: boolean;
    downloadRequested?: number; // Timestamp to trigger downloads
    zoomLevel?: number;
}
