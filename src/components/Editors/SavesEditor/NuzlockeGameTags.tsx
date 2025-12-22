import { Tag } from "components/ui/shims";
import { PokemonIcon } from "components";
import * as React from "react";
import { State } from "state";
import { Game, gameOfOriginToColor } from "utils";

export interface NuzlockeGameTagsProps {
    isCurrent?: boolean;
    darkMode?: boolean;
    game: Game;
    data: State;
    color: string;
    isCopy: boolean;
    /* size in kilobytes */
    size: string;
}

export function NuzlockeGameTags({
    isCurrent,
    darkMode,
    game,
    data,
    color,
    isCopy,
    size,
}: NuzlockeGameTagsProps) {
    const textColor = darkMode ? color : game === "None" ? "#000" : color;
    const secondaryTagClasses = `mx-0.5 bg-black/10 ${darkMode ? "text-white" : "text-black"}`;

    return (
        <div className="flex flex-col items-center w-80 pointer-events-none mx-auto">
            <div className="flex justify-center min-w-1/2">
                <Tag
                    round
                    className="mx-0.5"
                    style={{
                        background: gameOfOriginToColor(game),
                        color: textColor,
                    }}
                >
                    {game}
                </Tag>
                {isCurrent && (
                    <Tag round className={secondaryTagClasses}>
                        Current
                    </Tag>
                )}
                {isCopy && (
                    <Tag round className={secondaryTagClasses}>
                        Copy
                    </Tag>
                )}
                {size && (
                    <Tag round className={secondaryTagClasses}>
                        {size}KB
                    </Tag>
                )}
            </div>
        </div>
    );
}
