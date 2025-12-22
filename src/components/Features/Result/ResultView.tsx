import * as React from "react";
import { useSelector } from "react-redux";
import { cx } from "emotion";

import { TopBar } from "components/Layout/TopBar/TopBar";
import { TypeMatchupDialog } from "components/Editors/PokemonEditor";
import { Button, Select } from "components/ui/shims";
import { Result, ResultBase } from "./Result";
import { State } from "state";

const ZoomValues = [
    { key: 0.25, value: "25%" },
    { key: 0.5, value: "50%" },
    { key: 0.75, value: "75%" },
    { key: 1, value: "100%" },
    { key: 1.25, value: "125%" },
    { key: 1.5, value: "150%" },
    { key: 2, value: "200%" },
    { key: 3, value: "300%" },
];

const convertToPercentage = (n: number) => `${n * 100}%`;

interface TopBarItemsProps {
    editorDarkMode: boolean;
    setZoomLevel: (zoomLevel: number) => void;
    currentZoomLevel: number;
}

const TopBarItems = ({
    editorDarkMode,
    setZoomLevel,
    currentZoomLevel,
}: TopBarItemsProps) => {
    const zoomOptions = ZoomValues.map(({ key, value }) => ({
        value: String(key),
        label: value,
    }));

    return (
        <div className={cx({ dark: editorDarkMode })}>
            <Select
                className="zoom-select"
                value={String(currentZoomLevel)}
                onChange={(event) => setZoomLevel(Number(event.target.value))}
                options={zoomOptions}
                minimal
            />
            <Button rightIcon="double-caret-vertical" disabled>
                {convertToPercentage(currentZoomLevel) ?? "100%"}
            </Button>
        </div>
    );
};

export function ResultView() {
    const style = useSelector<State, State["style"]>((state) => state.style);
    const resultRef = React.useRef<ResultBase>(null);
    const [isDownloading, setIsDownloading] = React.useState(false);
    const [zoomLevel, setZoomLevel] = React.useState(1);

    const handleDownload = React.useCallback(() => {
        resultRef.current?.toImage();
    }, []);

    const handleZoomChange = React.useCallback((level: number) => {
        resultRef.current?.setZoomLevel(level);
    }, []);

    const handleZoomLevelChange = React.useCallback((level: number) => {
        setZoomLevel(level);
    }, []);

    const handleDownloadStateChange = React.useCallback((state: boolean) => {
        setIsDownloading(state);
    }, []);

    return (
        <>
            <TypeMatchupDialog />
            <TopBar
                isDownloading={isDownloading}
                onClickDownload={handleDownload}
            >
                <TopBarItems
                    editorDarkMode={style.editorDarkMode}
                    setZoomLevel={handleZoomChange}
                    currentZoomLevel={zoomLevel}
                />
            </TopBar>
            <Result
                ref={resultRef}
                onDownloadStateChange={handleDownloadStateChange}
                onZoomLevelChange={handleZoomLevelChange}
            />
        </>
    );
}

export default ResultView;

