import * as React from "react";
import { useSelector, useDispatch } from "react-redux";
import { isMobile } from "is-mobile";
import { css, cx } from "emotion";

import { TypeMatchupDialog } from "components/Editors/PokemonEditor";
import { Button } from "components/ui/shims";
import { Result, ResultBase } from "./Result";
import { State } from "state";
import { toggleMobileResultView } from "actions";

const mobileTopBar = css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 48px;
    z-index: 25;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fefefe;
    border-bottom: 1px solid rgba(0, 0, 0, 0.33);
    padding: 0.5rem;
    &.dark {
        background: #222;
        color: #fff;
        button {
            color: #fff !important;
        }
    }
`;

export function ResultView() {
    const dispatch = useDispatch();
    const editor = useSelector<State, State["editor"]>((state) => state.editor);
    const style = useSelector<State, State["style"]>((state) => state.style);
    const resultRef = React.useRef<ResultBase>(null);
    const prevDownloadRequested = React.useRef<number>(0);

    // Listen for download triggers from Redux
    React.useEffect(() => {
        const downloadRequested = editor.downloadRequested ?? 0;
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

    const handleToggleMobileResult = React.useCallback(() => {
        dispatch(toggleMobileResultView());
    }, [dispatch]);

    const showResultInMobile = editor.showResultInMobile;

    return (
        <>
            <TypeMatchupDialog />
            
            {/* Mobile-only top bar */}
            {isMobile() && (
                <div className={cx(mobileTopBar, { dark: style.editorDarkMode })}>
                    <Button
                        onClick={handleToggleMobileResult}
                        minimal
                        icon="menu"
                    >
                        Nuzlocke Generator
                    </Button>
                    <Button
                        onClick={handleToggleMobileResult}
                        minimal
                        icon={showResultInMobile ? "cross" : "eye-open"}
                        style={{ zIndex: 22, position: "relative" }}
                    >
                        {showResultInMobile ? "Close" : "View Result"}
                    </Button>
                </div>
            )}
            
            <Result ref={resultRef} />
        </>
    );
}

export default ResultView;

