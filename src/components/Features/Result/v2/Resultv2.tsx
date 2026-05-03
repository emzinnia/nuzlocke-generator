import * as React from "react";
import { useSelector } from "react-redux";
import { v4 as uuid } from "uuid";

import { Pokemon } from "models";
import { State } from "state";
import { sortPokes, ResultV2Theme, resultV2ThemeDefaults, teamLayoutOptions, TeamLayoutType } from "utils";
import { Trainer } from "./Trainer";
import { TeamPokemon } from "./TeamPokemon";

import "./themes/base.css";
import "./themes/default.css";

async function loadDomToImage() {
    const resource = await import("@emmaramirez/dom-to-image");
    return resource.domToImage;
}

const themeKeyToCssVar: Record<keyof ResultV2Theme, string> = {
    trainerBackgroundColor: "--trainer-background-color",
    trainerTextColor: "--trainer-text-color",
    trainerNameColor: "--trainer-name-color",
    trainerTitleColor: "--trainer-title-color",
    trainerStatLabelColor: "--trainer-stat-label-color",
    trainerStatValueColor: "--trainer-stat-value-color",
    trainerBadgeBackgroundColor: "--trainer-badge-background-color",
    trainerBadgeTextColor: "--trainer-badge-text-color",
    trainerNotesColor: "--trainer-notes-color",
    teamPokemonBackgroundColor: "--team-pokemon-background-color",
    teamPokemonTextColor: "--team-pokemon-text-color",
    teamPokemonTextSecondaryColor: "--team-pokemon-text-secondary-color",
    teamPokemonTextMutedColor: "--team-pokemon-text-muted-color",
    teamPokemonAccentColor: "--team-pokemon-accent-color",
    teamPokemonNatureColor: "--team-pokemon-nature-color",
    teamPokemonAbilityColor: "--team-pokemon-ability-color",
    teamPokemonMoveBackgroundColor: "--team-pokemon-move-background-color",
    teamPokemonMoveTextColor: "--team-pokemon-move-text-color",
    teamPokemonShinyColor: "--team-pokemon-shiny-color",
    teamPokemonMvpBackgroundColor: "--team-pokemon-mvp-background-color",
    teamPokemonMvpTextColor: "--team-pokemon-mvp-text-color",
};

function generateThemeCssString(theme: ResultV2Theme): string {
    const cssVars: string[] = [];
    for (const [key, cssVarName] of Object.entries(themeKeyToCssVar)) {
        cssVars.push(`${cssVarName}: ${theme[key as keyof ResultV2Theme]};`);
    }
    return cssVars.join("\n    ");
}

function getLayoutCssString(layout: TeamLayoutType): string {
    const config = teamLayoutOptions.find((l) => l.id === layout) ?? teamLayoutOptions[1];
    return `--team-layout-cols: ${config.cols};\n    --team-layout-rows: ${config.rows};`;
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
    const theme = style?.resultV2Theme ?? resultV2ThemeDefaults;
    const teamLayout = style?.teamLayout ?? "2x3";
    
    const themeStyleString = React.useMemo(() => {
        const themeCss = generateThemeCssString(theme);
        const layoutCss = getLayoutCssString(teamLayout);
        return `.result {
    ${themeCss}
    ${layoutCss}
}`;
    }, [theme, teamLayout]);

    return (
        <>
            <div className="w-full h-full flex justify-center items-center">
                <style>{themeStyleString}</style>
                <div
                    ref={resultRef}
                    className="bg-bg-primary w-[800px] min-h-[400px] result"
                    style={{ backgroundColor: bgColor }}
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
