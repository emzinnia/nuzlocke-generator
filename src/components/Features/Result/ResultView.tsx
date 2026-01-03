import * as React from "react";
import { useSelector } from "react-redux";
import { isMobile } from "is-mobile";

import { TypeMatchupDialog } from "components/Editors/PokemonEditor";
import { Result, ResultBase } from "./Result";
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
    const resultRef = React.useRef<ReturnType<typeof ResultBase>>(null);
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
        }
    }, [editor.downloadRequested]);

    React.useEffect(() => {
        const zoomLevel = editor.zoomLevel ?? 1;
        resultRef.current?.setZoomLevel(zoomLevel);
    }, [editor.zoomLevel]);

    if (isMobile()) {
        return <TypeMatchupDialog />;
    }

    if (isEmpty) {
        return (
            <>
                <TypeMatchupDialog />
                <EmptyStateView />
            </>
        );
    }

    return (
        <>
            <TypeMatchupDialog />
            <Result ref={resultRef} />
        </>
    );
}

export default ResultView;

