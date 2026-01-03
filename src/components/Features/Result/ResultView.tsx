import * as React from "react";
import { useSelector } from "react-redux";
import { isMobile } from "is-mobile";

import { Result, ResultHandle } from "./Result";
import { Resultv2, Resultv2Handle } from "./v2/Resultv2";
import { EmptyStateView } from "./EmptyStateView";
import { State } from "state";

function useIsEmptyState(): boolean {
    const game = useSelector<State, State["game"]>((state) => state.game);
    const pokemon = useSelector<State, State["pokemon"]>((state) => state.pokemon);

    const isGameEmpty = game.name === "None";
    const isPokemonEmpty = pokemon.length === 0 || 
        (pokemon.length === 1 && !pokemon[0].species);

    return isGameEmpty && isPokemonEmpty;
}

export function ResultView() {
    const editor = useSelector<State, State["editor"]>((state) => state.editor);
    const resultRef = React.useRef<ResultHandle>(null);
    const resultv2Ref = React.useRef<Resultv2Handle>(null);
    const prevDownloadRequested = React.useRef<number | null>(null);
    const isEmpty = useIsEmptyState();

    React.useEffect(() => {
        const downloadRequested = editor.downloadRequested ?? 0;
        if (prevDownloadRequested.current === null) {
            prevDownloadRequested.current = downloadRequested;
            return;
        }
        if (downloadRequested > 0 && downloadRequested !== prevDownloadRequested.current) {
            prevDownloadRequested.current = downloadRequested;
            resultRef.current?.toImage();
            resultv2Ref.current?.toImage();
        }
    }, [editor.downloadRequested]);

    React.useEffect(() => {
        const zoomLevel = editor.zoomLevel ?? 1;
        resultRef.current?.setZoomLevel(zoomLevel);
    }, [editor.zoomLevel]);

    if (isMobile()) {
        return null;
    }

    if (isEmpty) {
        return <EmptyStateView />;
    }

    return <Resultv2 ref={resultv2Ref} />;
}

export default ResultView;

