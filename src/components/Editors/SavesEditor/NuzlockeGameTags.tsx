import { Tag } from "components/ui/shims";
import { PokemonIcon } from "components";
import * as React from "react";
import { State } from "state";
import { Game, gameOfOriginToColor, getContrastColor } from "utils";

export interface NuzlockeGameTagsProps {
    isCurrent?: boolean;
    darkMode?: boolean;
    game: Game;
    data: State;
    color: string;
    isCopy: boolean;
    size: string;
}

export function NuzlockeGameTags({
    isCurrent,
    game,
    isCopy,
    size,
}: NuzlockeGameTagsProps) {
    const secondaryTagClasses = `mx-0.5 bg-black/20 dark:text-white text-black`;

    return (
            <div className="flex gap-0.5 flex-col justify-center min-w-1/2">
                <Tag
                    round
                    className="mx-0.5"
                    style={{
                        background: gameOfOriginToColor(game),
                        color: getContrastColor(gameOfOriginToColor(game)),
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
                    <Tag
                        round
                        className={`mx-0.5 bg-[rgba(128,128,128,0.15)]`}
                    >
                        Copy
                    </Tag>
                )}
                {size && (
                    <Tag
                        round
                        className={`mx-0.5 bg-[rgba(128,128,128,0.15)]`}
                    >
                        {size}KB
                    </Tag>
                )}
            </div>
    );
}
