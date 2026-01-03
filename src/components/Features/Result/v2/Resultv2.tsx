import * as React from "react";
import { useSelector } from "react-redux";
import { v4 as uuid } from "uuid";

import { Pokemon } from "models";
import { State } from "state";
import { sortPokes } from "utils";
import { Trainer } from "./Trainer";
import { TeamPokemon } from "./TeamPokemon";

import "./themes/base.css";
import "./themes/default.css";

async function loadDomToImage() {
    const resource = await import("@emmaramirez/dom-to-image");
    return resource.domToImage;
}

export interface Resultv2Handle {
    toImage: () => Promise<void>;
}

export const Resultv2 = React.forwardRef<Resultv2Handle, object>((_, ref) => {
    const pokemon = useSelector((state: State) => state.pokemon);
    const style = useSelector((state: State) => state.style);
    const trainer = useSelector((state: State) => state.trainer);

    const resultRef = React.useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = React.useState(false);

    const teamPokemon = (pokemon ?? [])
        .filter((p): p is Pokemon => typeof p.id === "string")
        .filter((p) => !p.hidden && p.status === "Team")
        .sort(sortPokes);

    const toImage = React.useCallback(async () => {
        const node = resultRef.current;
        if (!node) return;

        setIsDownloading(true);

        try {
            const domToImage = await loadDomToImage();
            const dataUrl = await domToImage.toPng(node, { corsImage: true });
            const link = document.createElement("a");
            link.download = `nuzlocke-${uuid()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (e) {
            console.error("Download failed:", e);
        } finally {
            setIsDownloading(false);
        }
    }, []);

    React.useImperativeHandle(ref, () => ({ toImage }), [toImage]);

    const bgColor = style?.bgColor ?? "#383840";

    return (
        <>
            <div className="w-full h-full flex justify-center items-center">
                <div
                    ref={resultRef}
                    className="bg-bg-primary w-[800px] min-h-[400px] result"
                    style={{
                        backgroundColor: bgColor,
                    }}
                >
                    <div className="result-content flex flex-wrap gap-0.5">
                        <Trainer trainer={trainer} />
                        <TeamPokemon teamPokemon={teamPokemon} />
                    </div>
                </div>
                <style>{style.customCSS}</style>
            </div>
        </>
    );
});

Resultv2.displayName = "Resultv2";
