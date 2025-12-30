import * as React from "react";
import { connect } from "react-redux";
import { State } from "state";
import { PokemonIcon } from "components/Pokemon/PokemonIcon/PokemonIcon";
import { Layout, LayoutDisplay } from "components/Layout/Layout/Layout";
import { range } from "ramda";

export interface StatsProps {
    pokemon: State["pokemon"];
    status?: string;
    stats?: State["stats"];
    style: State["style"];
    box: State["box"];
    color?: string;
}

export class StatsBase extends React.Component<
    StatsProps,
    { pokemon: State["pokemon"] }
> {
    public static defaultProps = {
        status: "Champs",
    };

    public state = {
        pokemon: [] as State["pokemon"],
    };

    public componentDidMount() {
        const { status } = this.props;
        const pokemon = this.props.pokemon.filter((p) => p.status === status);
        this.setState({ pokemon });
    }

    private typeMap() {
        const typesFreq = {};

        this.props.pokemon.forEach((poke) => {
            if (poke && Array.isArray(poke.types)) {
                const type1 = poke.types[0];
                const type2 = poke.types[1];

                if (Object.prototype.hasOwnProperty.call(typesFreq, type1)) {
                    typesFreq[type1]++;
                } else {
                    typesFreq[type1] = 1;
                }

                if (Object.prototype.hasOwnProperty.call(typesFreq, type2)) {
                    if (type1 !== type2) {
                        typesFreq[type2]++;
                    }
                } else {
                    typesFreq[type2] = 1;
                }
            }
        });

        return typesFreq;
    }

    private getMostCommonType() {
        const t = this.typeMap();
        const sorted = Object.keys(t)
            .map((key) => ({ name: key, total: t[key] }))
            .sort((a, b) => b.total - a.total);
        return [0, 1, 2, 3, 4, 5].map((n) => ({
            name: sorted[n]?.name,
            total: sorted[n]?.total,
        }));
    }

    private displayMostCommonType(data: { name?: string; total?: string }[]) {
        return data
            .filter((d) => d.name != null)
            .map((d) => `${d.name} (${d.total} Pokémon)`)
            .join(", ");
    }

    private wordMap(arr) {
        const wm = {};
        arr.forEach((key) => {
            if (
                key === "from" ||
                key === "the" ||
                key === "a" ||
                key === "on" ||
                key === "up" ||
                key === "with" ||
                key === "to"
            ) {
                return;
            }
            if (Object.prototype.hasOwnProperty.call(wm, key)) {
                wm[key]++;
            } else {
                wm[key] = 1;
            }
        });
        const sorted = Object.keys(wm)
            .map((key) => ({ name: key, total: wm[key] }))
            .sort((a, b) => b.total - a.total);
        return sorted;
    }

    private getMostCommonDeath() {
        const words = this.props.pokemon
            .filter((s) => s.status === "Dead")
            .map((p) => p.causeOfDeath || "")
            .join("\n");
        const res = this.wordMap(words.split(/\n/));
        return range(0, 5).map((i) => ({
            name: res[i]?.name,
            total: res[i]?.total,
        }));
    }

    private displayMostCommonDeath(data: { name?: string; total?: string }[]) {
        const numOfDead = this.props.pokemon.filter(
            (s) => s.status === "Dead",
        ).length;

        if (numOfDead === 0) {
            return "None";
        }

        return data
            .filter((d) => d.name != null)
            .map((d) => `${d.name} (${d.total} deaths)`)
            .join(", ");
    }

    private getAverageLevel() {
        const pokes = this.props.pokemon.filter((p) => !p.hidden);
        return (
            pokes.reduce((prev, poke, arr) => {
                if (Number.isNaN(poke.level) || !poke.level) {
                    return prev;
                }
                return prev + Number.parseInt(poke.level as unknown as string);
            }, 0) / pokes.length
        );
    }

    private getAverageLevelByStatus(status: string) {
        const pokes = this.props.pokemon.filter(
            (p) => !p.hidden && p.status === status,
        );
        if (!pokes.length) return 0;
        return (
            pokes.reduce((prev, poke, arr) => {
                if (Number.isNaN(poke.level) || !poke.level) {
                    return prev;
                }
                return prev + Number.parseInt(poke.level as unknown as string);
            }, 0) / pokes.length
        );
    }

    private getShinies() {
        if (!this.numberOfShinies) {
            return "None";
        }
        return this.props.pokemon
            .filter((s) => s.shiny)
            .map((p) => (
                <PokemonIcon
                    key={p.id}
                    shiny={p.shiny}
                    species={p.species}
                    id={p.id}
                />
            ));
    }

    private numberOfShinies = this.props.pokemon.filter((s) => s.shiny).length;

    private getAverageLevelComponent() {
        return <div>Average Level: {this.getAverageLevel()?.toFixed(0)}</div>;
    }

    private getAverageLevelDetailedComponent() {
        return (
            <div>
                Average Level:{" "}
                {this.props.box.map((b, idx, arr) => {
                    return (
                        <>
                            {" "}
                            {b.name} (
                            {this.getAverageLevelByStatus(b.name)?.toFixed(0)})
                            {idx < arr.length - 1 ? "," : ""}
                        </>
                    );
                })}
            </div>
        );
    }

    public render() {
        const { stats, style, color } = this.props;

        return (
            <div className="stats stats-container" style={{ color }}>
                <h3 style={{ color }}>Stats</h3>

                <div style={{ marginTop: "10px", margin: "0 10px" }}>
                    {this.props.pokemon.length &&
                    style.statsOptions.averageLevel
                        ? this.getAverageLevelComponent()
                        : null}
                    {this.props.pokemon.length &&
                    style.statsOptions.averageLevelDetailed
                        ? this.getAverageLevelDetailedComponent()
                        : null}
                    {style.statsOptions.mostCommonKillers ? (
                        <div>
                            Most Common Killers:{" "}
                            {this.displayMostCommonDeath(
                                this.getMostCommonDeath(),
                            )}
                        </div>
                    ) : null}
                    {style.statsOptions.mostCommonTypes ? (
                        <div>
                            Most Common Types:{" "}
                            {this.displayMostCommonType(
                                this.getMostCommonType(),
                            )}
                        </div>
                    ) : null}
                    {style.statsOptions.shiniesCaught ? (
                        <div>
                            Shinies:{" "}
                            <Layout display={LayoutDisplay.Inline}>
                                {this.getShinies()}
                            </Layout>
                        </div>
                    ) : null}
                    {stats?.length
                        ? stats?.map((stat, idx) =>
                              stat.key?.length && stat.value?.length ? (
                                  <div key={stat.id}>
                                      {stat.key}: {stat.value}
                                  </div>
                              ) : null,
                          )
                        : null}
                </div>
            </div>
        );
    }
}

export const Stats = connect(
    (state: State) => ({
        pokemon: state.pokemon,
        stats: state.stats,
        style: state.style,
        box: state.box,
    }),
    undefined,
    undefined,
    { pure: false },
)(StatsBase);
