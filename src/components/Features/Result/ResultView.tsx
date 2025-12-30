import * as React from "react";
import { useSelector } from "react-redux";
import { isMobile } from "is-mobile";

import { TypeMatchupDialog } from "components/Editors/PokemonEditor";
import { Result, ResultBase } from "./Result";
import { State } from "state";

export function ResultView() {
    const editor = useSelector<State, State["editor"]>((state) => state.editor);
    const resultRef = React.useRef<ReturnType<typeof ResultBase>>(null);
    const prevDownloadRequested = React.useRef<number | null>(null);

    // Listen for download triggers from Redux
    React.useEffect(() => {
        const downloadRequested = editor.downloadRequested ?? 0;
        // On first run, store the initial value without triggering download
        // This prevents downloads from firing on page reload due to persisted state
        if (prevDownloadRequested.current === null) {
            prevDownloadRequested.current = downloadRequested;
            return;
        }
        if (downloadRequested > 0 && downloadRequested !== prevDownloadRequested.current) {
            prevDownloadRequested.current = downloadRequested;
            resultRef.current?.toImage();
        }
    }, [editor.downloadRequested]);

    // Listen for zoom level changes from Redux
    React.useEffect(() => {
        const zoomLevel = editor.zoomLevel ?? 1;
        resultRef.current?.setZoomLevel(zoomLevel);
    }, [editor.zoomLevel]);

    // On mobile, the Result is shown in the Editor tabs, not here
    if (isMobile()) {
        return <TypeMatchupDialog />;
    }

    return (
        <>
            <TypeMatchupDialog />
            <Result ref={resultRef} />
        </>
    );
}

export default ResultView;

