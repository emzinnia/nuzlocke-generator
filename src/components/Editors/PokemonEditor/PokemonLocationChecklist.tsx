import * as React from "react";
import { Game, Pokemon, Boxes } from "models";
import { Game as GameName, getEncounterMap, listOfGames } from "utils";
import { State } from "state";
import { PokemonIcon } from "components/Pokemon/PokemonIcon/PokemonIcon";
import {
    Callout,
    Classes,
    HTMLSelect,
    Intent,
    TextArea,
    Tooltip,
} from "components/ui/shims";
import { Icon } from "components/ui";
import { Check, X, AlertTriangle } from "lucide-react";
import { cx } from "emotion";
import { useDispatch } from "react-redux";
import { updateExcludedAreas, updateCustomAreas } from "actions";

const EncounterMap = ({
    encounterMap,
    style,
    pokemon,
    currentGame,
    excludeGifts,
    locationLookup,
    displayHideArea,
    onClickHideArea,
}) => {
    return encounterMap.map((area) => {
        if (area === "") return null;
        const found = locationLookup?.get(area.trim().toLocaleLowerCase());
        return (
            <div
                key={area.toString()}
                style={{
                    display: "flex",
                    alignItems: "center",
                    margin: "2px",
                    borderBottom: `1px solid ${style?.editorDarkMode ? "#333" : "#efefef"}`,
                }}
            >
                <LocationIcon
                    area={area}
                    pokemon={pokemon}
                    currentGame={currentGame}
                    excludeGifts={excludeGifts}
                    poke={found}
                />
                <div style={{ marginLeft: "4px" }}>{area}</div>
                {displayHideArea && (
                    <div
                        role="menuitem"
                        tabIndex={0}
                        onKeyDown={onClickHideArea(area)}
                        onClick={onClickHideArea(area)}
                        style={{ marginLeft: "auto", cursor: "pointer" }}
                    >
                        <Tooltip content={`Hide ${area}`}>
                            <X size={14} />
                        </Tooltip>
                    </div>
                )}
            </div>
        );
    });
};

const LocationIcon = ({
    area,
    currentGame,
    excludeGifts,
    pokemon,
    poke,
}: {
    area: string;
    currentGame: GameName;
    excludeGifts: boolean;
    pokemon: Pokemon[];
    poke?: Pokemon;
}) => {
    if (poke && !poke.hidden && (!poke.gift || !excludeGifts)) {
        return (
            <>
                <Check size={14} className="text-green-500" />
                <PokemonIcon style={{ pointerEvents: "none" }} {...poke} />
            </>
        );
    }
    if (poke && poke.hidden) {
        return (
            <>
                <X size={14} className="text-red-500" />
                <PokemonIcon style={{ pointerEvents: "none" }} {...poke} />
            </>
        );
    }
    return null;
};

export const PokemonLocationChecklist = ({
    pokemon,
    game,
    style,
    boxes,
    excludedAreas,
    customAreas,
}: {
    pokemon: Pokemon[];
    game: Game;
    style: State["style"];
    boxes: Boxes;
    excludedAreas: string[];
    customAreas: string[];
}) => {
    const calcTotals = (
        boxes,
        pokemon,
        encounterMap,
        currentGame: GameName,
    ) => {
        const encounterTotal = encounterMap.length || 1;
        const encounterSet = new Set(encounterMap);

        // Count pokemon per status in a single pass (avoid boxes × pokemon nested loop)
        const counts = new Map<string, number>();
        for (const poke of pokemon) {
            if (!poke || poke.hidden) continue;
            if (currentGame !== "None" && poke.gameOfOrigin !== currentGame)
                continue;
            if (!encounterSet.has(poke.met)) continue;

            const key = poke.status ?? "";
            counts.set(key, (counts.get(key) ?? 0) + 1);
        }

        return boxes.map((box) => {
            const total = counts.get(box.name) ?? 0;
            const percentage = `${((total / encounterTotal) * 100).toFixed(1)}%`;
            return { key: box.name, percentage };
        });
    };

    const [excludeGifts, setExcludeGifts] = React.useState(false);
    const [currentGame, setCurrentGame] = React.useState<GameName>("None");
    const dispatch = useDispatch();
    const locationLookup = React.useMemo(() => {
        const map = new Map<string, Pokemon>();
        for (const poke of pokemon) {
            const met = poke?.met?.trim();
            if (!met) continue;
            if (currentGame !== "None" && poke.gameOfOrigin !== currentGame)
                continue;
            const key = met.toLocaleLowerCase();
            if (!map.has(key)) map.set(key, poke);
        }
        return map;
    }, [pokemon, currentGame]);
    const encounterMap = React.useMemo(
        () =>
            getEncounterMap(game.name)
                .concat(customAreas)
                .filter((area) => !excludedAreas.includes(area)),
        [game.name, excludedAreas, customAreas],
    );
    const totals = React.useMemo(
        () => calcTotals(boxes, pokemon, encounterMap, currentGame),
        [boxes, pokemon, encounterMap, currentGame],
    );
    const hideArea = (area: string) => () =>
        dispatch(updateExcludedAreas([...excludedAreas, area]));

    const updateExcludedAreasFromText = (event) => {
        const value = event.currentTarget.value;
        const areas = value.split("\n");
        dispatch(updateExcludedAreas(areas));
    };

    const updateCustomAreasFromText = (event) => {
        const value = event.currentTarget.value;
        const areas = value.split("\n");
        dispatch(updateCustomAreas(areas));
    };

    const colors = [
        "#0e1d6b",
        "#468189",
        "#77ACA2",
        "#9DBEBB",
        "#F4E9CD",
        "#0DAB76",
        "#139A43",
        "#D4AFB9",
        "#9CADCE",
    ];

    const buildTotals = (
        percentages: { key: string; percentage: string }[],
    ) => {
        return (
            <Tooltip
                content={
                    <>
                        {percentages.map((percentage, idx) => (
                            <div key={percentage.key}>
                                <div
                                    style={{
                                        display: "inline-block",
                                        width: "0.5rem",
                                        height: "0.5rem",
                                        borderRadius: "50%",
                                        background: colors[idx],
                                        marginRight: "0.25rem",
                                    }}
                                ></div>
                                {percentage.key}: {percentage.percentage}
                            </div>
                        ))}
                    </>
                }
            >
                <div
                    style={{
                        height: "1rem",
                        width: "25rem",
                        background: style?.editorDarkMode ? "#333" : "#eee",
                        borderRadius: ".25rem",
                        border: "1px solid #ccc",
                        overflow: "hidden",
                    }}
                >
                    {percentages.map((percentage, idx) => {
                        return (
                            <div
                                key={percentage.key}
                                style={{
                                    width: percentage.percentage,
                                    height: "1rem",
                                    background: colors[idx],
                                    display: "inline-block",
                                }}
                            ></div>
                        );
                    })}
                </div>
            </Tooltip>
        );
    };

    return (
        <div>
            <div className={"flex items-center justify-between"}>
                <label
                    className="flex items-center gap-2 cursor-pointer"
                    style={{ margin: ".25rem 0" }}
                >
                    <input
                        type="checkbox"
                        checked={excludeGifts}
                        onChange={(e) => setExcludeGifts(e?.target.checked)}
                        className="w-4 h-4 border border-border rounded bg-input"
                    />
                    <span className="text-sm">Exclude Gifts</span>
                </label>
                <label
                    className="flex items-center gap-2"
                    style={{ margin: ".25rem 0" }}
                >
                    <span className="text-sm">Filter by Game</span>
                    <HTMLSelect
                        style={{ marginLeft: "0.25rem" }}
                        onChange={(e) =>
                            setCurrentGame(e?.target.value as GameName)
                        }
                        options={listOfGames}
                    />
                </label>
            </div>
            <div className="flex" style={{ justifyContent: "center" }}>
                {buildTotals(totals)}
            </div>
            <EncounterMap
                encounterMap={encounterMap}
                pokemon={pokemon}
                style={style}
                currentGame={currentGame}
                excludeGifts={excludeGifts}
                locationLookup={locationLookup}
                displayHideArea={true}
                onClickHideArea={hideArea}
            />
            <div style={{ padding: "0.25rem" }}>
                <div>Excluded Areas</div>
                <TextArea
                    fill
                    name="excludedAreas"
                    onChange={updateExcludedAreasFromText}
                    value={excludedAreas.join("\n")}
                />
                <div>Custom Areas</div>
                <TextArea
                    fill
                    name="customAreas"
                    onChange={updateCustomAreasFromText}
                    value={customAreas.join("\n")}
                />
            </div>
            <div
                className="flex items-start gap-2 p-3 mt-2 rounded-md bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"
                style={{ fontSize: "80%" }}
            >
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <span>
                    Tip: Pokémon with the &quot;hidden&quot; attribute are a great
                    option for including Pokemon that got away on a certain route!
                </span>
            </div>
        </div>
    );
};

export default PokemonLocationChecklist;
