import { Tag } from "@blueprintjs/core";
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
    return (
        <>
            <div
                style={{
                    display: "flex",
                    width: "20rem",
                    alignItems: "center",
                    pointerEvents: "none",
                    flexDirection: "column",
                    margin: "auto",
                }}
            >
                <div
                    style={{
                        display: "flex",
                    }}
                >
                    {data?.pokemon
                        ?.filter((p) => p.status === "Team")
                        .map((poke) => <PokemonIcon key={poke.id} {...poke} />)}
                </div>
                <div
                    className="flex justify-center"
                    style={{ minWidth: "50%" }}
                >
                    <Tag
                        round
                        style={{
                            margin: "0 2px",
                            background: gameOfOriginToColor(game),
                            color: darkMode
                                ? color
                                : game === "None"
                                  ? "#000"
                                  : color,
                        }}
                    >
                        {game}
                    </Tag>
                    {isCurrent && (
                        <Tag
                            round
                            style={{
                                margin: "0 2px",
                                background: "rgba(0,0,0,0.1)",
                                color: darkMode ? "#fff" : "#000",
                            }}
                        >
                            Current
                        </Tag>
                    )}
                    {isCopy && (
                        <Tag
                            round
                            style={{
                                margin: "0 2px",
                                background: "rgba(0,0,0,0.1)",
                                color: darkMode ? "#fff" : "#000",
                            }}
                        >
                            Copy
                        </Tag>
                    )}
                    {size && (
                        <Tag
                            round
                            style={{
                                margin: "0 2px",
                                background: "rgba(0,0,0,0.1)",
                                color: darkMode ? "#fff" : "#000",
                            }}
                        >
                            {size}KB
                        </Tag>
                    )}
                </div>
            </div>
        </>
    );
}
