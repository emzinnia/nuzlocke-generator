import * as React from "react";
import { Pokemon } from "models";
import { addForme, Forme, Types } from "utils";
import { GenderElement } from "components/Common/Shared";

interface TeamPokemonProps {
    teamPokemon: Pokemon[];
}

const getImage = (species: string, forme: keyof typeof Forme) => {
    return `url(/img/${(
        addForme(
            (species || "")
                .trim()
                .replace(/\s/g, "-")
                .replace(/'/g, "")
                .replace(/:/g, "-"),
            forme
        ) || "missingno"
    ).toLowerCase()}.jpg)`;
};

export const TeamPokemon = ({ teamPokemon }: TeamPokemonProps) => {
    return (
        <>
            <h3 className="team-pokemon-label">Team</h3>

            <div className="team-pokemon-list flex flex-wrap gap-0.5 w-full">
                {teamPokemon.map((poke) => (
                    <div
                        key={poke.id}
                        className="team-pokemon flex gap-3 p-2 flex-1"
                    >
                        <div className="team-pokemon-image-wrapper relative w-20 h-20 shrink-0">
                            <div
                                className="team-pokemon-image"
                                style={{
                                    backgroundImage: getImage(
                                        poke.species,
                                        poke.forme as keyof typeof Forme
                                    ),
                                }}
                            />
                            {poke.shiny && (
                                <div className="team-pokemon-shiny-indicator" />
                            )}
                            {poke.item && (
                                <div className="team-pokemon-item-wrapper">
                                    <img
                                        src={`/icons/hold-item/${poke.item
                                            .toLowerCase()
                                            .replace(/\s/g, "-")}.png`}
                                        alt={poke.item}
                                        className="team-pokemon-item-icon w-5 h-5"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="team-pokemon-info flex flex-col gap-0.5 min-w-0">
                            <div className="team-pokemon-header flex items-center gap-2 flex-wrap">
                                {poke.mvp && (
                                    <span className="team-pokemon-mvp flex items-center gap-1">
                                        <img
                                            src="/assets/mvp-crown.png"
                                            alt="MVP"
                                            className="w-4 h-4"
                                        />
                                    </span>
                                )}
                                <span className="team-pokemon-nickname">
                                    {poke.nickname}
                                </span>
                                {poke.nickname && poke.species && (
                                    <span className="team-pokemon-species">
                                        {poke.species}
                                    </span>
                                )}
                                {!poke.nickname && poke.species && (
                                    <span className="team-pokemon-nickname">
                                        {poke.species}
                                    </span>
                                )}
                                {GenderElement(poke.gender)}
                                {poke.level && (
                                    <span className="team-pokemon-level">
                                        Lv. {poke.level}
                                    </span>
                                )}
                                {poke.alpha && (
                                    <img
                                        src="/icons/alpha-icon.png"
                                        alt="Alpha"
                                        className="team-pokemon-alpha w-4 h-4"
                                    />
                                )}
                                {poke.teraType &&
                                    poke.teraType !== ("None" as Types) && (
                                        <img
                                            src={`/icons/tera/${poke.teraType.toLowerCase()}.png`}
                                            alt={`Tera: ${poke.teraType}`}
                                            className="team-pokemon-tera w-4 h-4"
                                        />
                                    )}
                            </div>

                            {(poke.nature || poke.ability) && (
                                <div className="team-pokemon-traits flex items-center gap-2 flex-wrap">
                                    {poke.nature && poke.nature !== "None" && (
                                        <span className="team-pokemon-nature">
                                            {poke.nature}
                                        </span>
                                    )}
                                    {poke.ability && (
                                        <span className="team-pokemon-ability">
                                            {poke.ability}
                                        </span>
                                    )}
                                </div>
                            )}

                            {poke.met && (
                                <div className="team-pokemon-met">
                                    {poke.metLevel
                                        ? `Met at Lv. ${poke.metLevel} — `
                                        : ""}
                                    {poke.met}
                                </div>
                            )}

                            {poke.moves && poke.moves.length > 0 && (
                                <div className="team-pokemon-moves flex flex-wrap gap-1">
                                    {poke.moves
                                        .filter(Boolean)
                                        .map((move, idx) => (
                                            <span
                                                key={idx}
                                                className="team-pokemon-move"
                                            >
                                                {move}
                                            </span>
                                        ))}
                                </div>
                            )}

                            {poke.notes && (
                                <div
                                    className="team-pokemon-notes"
                                    dangerouslySetInnerHTML={{
                                        __html: poke.notes,
                                    }}
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};
