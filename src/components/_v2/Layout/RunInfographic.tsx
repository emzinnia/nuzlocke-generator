import * as React from "react";
import type { State } from "state";
import type { Pokemon } from "models";
import { PokemonIconPlain } from "components/Pokemon/PokemonIcon/PokemonIcon";
import { Status } from "utils/Status";
import { speciesToNumber, Species } from "utils";

interface RunInfographicProps {
    data: Partial<State>;
}

interface PokemonCounts {
    team: number;
    boxed: number;
    dead: number;
    champs: number;
}

const countPokemonByStatus = (pokemon: Pokemon[] = []): PokemonCounts => {
    return pokemon.reduce(
        (acc, p) => {
            const status = p.status?.toLowerCase();
            if (status === Status.Team) acc.team++;
            else if (status === Status.Boxed) acc.boxed++;
            else if (status === Status.Dead) acc.dead++;
            else if (status === Status.Champs) acc.champs++;
            return acc;
        },
        { team: 0, boxed: 0, dead: 0, champs: 0 }
    );
};

const filterByStatus = (pokemon: Pokemon[] = [], status: string): Pokemon[] => {
    return pokemon.filter((p) => p.status?.toLowerCase() === status);
};

// Get large Pokemon image URL from Serebii (Black/White sprites)
const getLargeImageUrl = (pokemon: Pokemon): string => {
    if (pokemon.customImage) {
        return pokemon.customImage;
    }
    if (pokemon.egg) {
        return "/img/egg.jpg";
    }
    const species = pokemon.species || "Ditto";
    const pokedexNumber = speciesToNumber(species as Species) || 132; // Default to Ditto (#132)
    const paddedNumber = pokedexNumber.toString().padStart(3, "0");
    return `https://www.serebii.net/blackwhite/pokemon/${paddedNumber}.png`;
};

interface PokemonIconWrapperProps {
    pokemon: Pokemon;
    size?: number;
    grayscale?: boolean;
}

const PokemonIconWrapper: React.FC<PokemonIconWrapperProps> = ({
    pokemon,
    size = 32,
    grayscale = false,
}) => {
    const imageStyle = {
        height: `${size}px`,
        maxWidth: "auto",
        filter: grayscale ? "grayscale(100%)" : undefined,
        opacity: grayscale ? 0.7 : 1,
    };

    return (
        <PokemonIconPlain
            id={pokemon.id}
            species={pokemon.species}
            forme={pokemon.forme}
            shiny={pokemon.shiny}
            gender={pokemon.gender}
            customIcon={pokemon.customIcon}
            egg={pokemon.egg}
            onClick={() => {}}
            selectedId={null}
            imageStyle={imageStyle}
            includeTitle
        />
    );
};

const TeamPokemonCard: React.FC<{ pokemon: Pokemon }> = ({ pokemon }) => {
    const imageUrl = getLargeImageUrl(pokemon);
    const genderSymbol = pokemon.gender === "Male" || pokemon.gender === "m" 
        ? "♂" 
        : pokemon.gender === "Female" || pokemon.gender === "f" 
        ? "♀" 
        : "";
    const genderColorClass = pokemon.gender === "Male" || pokemon.gender === "m"
        ? "text-blue-400"
        : pokemon.gender === "Female" || pokemon.gender === "f"
        ? "text-pink-400"
        : "text-slate-400";

    return (
        <div className="flex gap-3 bg-slate-900 rounded-[10px] p-3 border border-slate-700">
            <div className="relative shrink-0">
                <img
                    src={imageUrl}
                    alt={pokemon.nickname || pokemon.species}
                    className="w-20 h-20 object-cover rounded-lg bg-slate-800"
                    onError={({ currentTarget }) => {
                        currentTarget.onerror = null;
                        currentTarget.src = "https://www.serebii.net/blackwhite/pokemon/132.png";
                    }}
                />
                {pokemon.shiny && (
                    <span className="absolute -top-1 -right-1 text-sm" title="Shiny">✨</span>
                )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <div className="flex items-center gap-1">
                    <span className="text-base font-semibold text-slate-50 overflow-hidden text-ellipsis whitespace-nowrap">
                        {pokemon.nickname || pokemon.species}
                    </span>
                    {genderSymbol && (
                        <span className={`text-sm font-bold ${genderColorClass}`}>
                            {genderSymbol}
                        </span>
                    )}
                </div>
                <div className="text-xs text-slate-400">{pokemon.species}</div>
                {pokemon.level && (
                    <div className="text-[13px] text-slate-300 font-medium">Lv. {pokemon.level}</div>
                )}
                <div className="flex gap-2 flex-wrap mt-0.5">
                    {pokemon.nature && (
                        <span className="text-[11px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">{pokemon.nature}</span>
                    )}
                    {pokemon.ability && (
                        <span className="text-[11px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">{pokemon.ability}</span>
                    )}
                </div>
                {pokemon.item && (
                    <div className="flex items-center gap-1 text-[11px] text-purple-400 mt-1">
                        <img
                            src={`/icons/hold-item/${pokemon.item.toLowerCase().replace(/'/g, "").replace(/\s/g, "-")}.png`}
                            alt={pokemon.item}
                            className="w-4 h-4 object-contain"
                            onError={({ currentTarget }) => {
                                currentTarget.onerror = null;
                                currentTarget.style.display = "none";
                            }}
                        />
                        <span>{pokemon.item}</span>
                    </div>
                )}
                {pokemon.moves && pokemon.moves.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                        {pokemon.moves.slice(0, 4).map((move, i) => (
                            <span key={i} className="text-[10px] text-slate-400 bg-slate-700 px-1.5 py-0.5 rounded-sm">{move}</span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};


export const RunInfographic: React.FC<RunInfographicProps> = ({ data }) => {
    const pokemon = data.pokemon || [];
    const counts = countPokemonByStatus(pokemon);
    const gameName = data.game?.customName || data.game?.name || "Unknown Game";
    const trainerName = data.trainer?.name;

    const teamPokemon = filterByStatus(pokemon, Status.Team);
    const boxedPokemon = filterByStatus(pokemon, Status.Boxed);
    const deadPokemon = filterByStatus(pokemon, Status.Dead);
    const champsPokemon = filterByStatus(pokemon, Status.Champs);

    if (pokemon.length === 0) {
        return (
            <div className="bg-slate-800 rounded-xl p-5 mb-4 text-slate-100 font-sans">
                <p className="text-slate-600 text-[13px] italic">No Pokemon data available yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-800 rounded-xl p-5 mb-4 text-slate-100 font-sans">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-700">
                <h2 className="text-xl font-semibold text-slate-50 m-0">{gameName}</h2>
                {trainerName && (
                    <span className="text-sm text-slate-400">Trainer: {trainerName}</span>
                )}
            </div>

            <div className="flex gap-3 mb-5 flex-wrap">
                <div className="flex items-center gap-2 bg-slate-700 px-4 py-2 rounded-lg text-sm">
                    <span className="font-bold text-lg text-green-400">
                        {counts.team}
                    </span>
                    <span>Team</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-700 px-4 py-2 rounded-lg text-sm">
                    <span className="font-bold text-lg text-blue-400">
                        {counts.boxed}
                    </span>
                    <span>Boxed</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-700 px-4 py-2 rounded-lg text-sm">
                    <span className="font-bold text-lg text-red-400">
                        {counts.dead}
                    </span>
                    <span>Dead</span>
                </div>
                {counts.champs > 0 && (
                    <div className="flex items-center gap-2 bg-slate-700 px-4 py-2 rounded-lg text-sm">
                        <span className="font-bold text-lg text-yellow-400">
                            {counts.champs}
                        </span>
                        <span>Champs</span>
                    </div>
                )}
            </div>

            {teamPokemon.length > 0 && (
                <div className="mb-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Current Team</div>
                    <div className="flex flex-col gap-3">
                        {teamPokemon.map((p) => (
                            <TeamPokemonCard key={p.id} pokemon={p} />
                        ))}
                    </div>
                </div>
            )}

            {boxedPokemon.length > 0 && (
                <div className="mb-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Boxed</div>
                    <div className="flex flex-col gap-2 bg-slate-900 p-3 rounded-lg min-h-[40px]">
                        {boxedPokemon.map((p) => (
                            <div key={p.id} className="flex items-center gap-3 px-3 py-2 bg-slate-800 rounded-md">
                                <PokemonIconWrapper pokemon={p} size={32} />
                                <span className="text-sm font-medium text-slate-100 flex-1">{p.nickname || p.species}</span>
                                {p.level && <span className="text-xs text-slate-500">Lv. {p.level}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {deadPokemon.length > 0 && (
                <div className="mb-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Fallen</div>
                    <div className="flex flex-col gap-2 bg-slate-900 p-3 rounded-lg min-h-[40px]">
                        {deadPokemon.map((p) => (
                            <div key={p.id} className="flex items-center gap-3 px-3 py-2 bg-slate-800 rounded-md">
                                <PokemonIconWrapper pokemon={p} size={32} grayscale />
                                <span className="text-sm font-medium text-slate-500 flex-1">{p.nickname || p.species}</span>
                                {p.level && <span className="text-xs text-slate-600">Lv. {p.level}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {champsPokemon.length > 0 && (
                <div className="mb-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Hall of Fame</div>
                    <div className="flex flex-col gap-2 bg-slate-900 p-3 rounded-lg min-h-[40px]">
                        {champsPokemon.map((p) => (
                            <div key={p.id} className="flex items-center gap-3 px-3 py-2 bg-slate-800 rounded-md">
                                <PokemonIconWrapper pokemon={p} size={40} />
                                <span className="text-sm font-medium text-yellow-400 flex-1">{p.nickname || p.species}</span>
                                {p.level && <span className="text-xs text-slate-500">Lv. {p.level}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

