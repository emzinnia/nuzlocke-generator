import * as React from "react";
import { BaseEditor } from "components/Editors/BaseEditor/BaseEditor";
import { connect } from "react-redux";
import { State } from "state";
import { Checkbox, Switch, Button, Intent, Classes } from "components/ui/shims";
import { editStyle, addStat, deleteStat, editStat } from "actions";
import { ErrorBoundary } from "components";

export interface StatsEditorProps {
    pokemon: State["pokemon"];
    style: State["style"];
    stats: State["stats"];
    editStyle: editStyle;
    addStat: addStat;
    editStat: editStat;
    deleteStat: deleteStat;
}

const sortById = (a, b) => {
    if (a.id > b.id) return 1;
    if (b.id > a.id) return -1;
    return 0;
};

export class StatsEditorBase extends React.Component<StatsEditorProps> {
    private onChange =
        (stat: State["stats"][number], use: "key" | "value") =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const { editStat } = this.props;
            if (use === "key") {
                if (stat?.id) {
                    editStat(stat.id, e.target.value, stat.value ?? "");
                }
            } else {
                if (stat?.id) {
                    editStat(stat.id, stat.key ?? "", e.target.value);
                }
            }
        };

    public render() {
        const { style, editStyle } = this.props;
        const { addStat, deleteStat } = this.props;
        const stats = style?.statsOptions;

        return (
            <BaseEditor icon="chart" name="Stats">
                <ErrorBoundary>
                    <div>
                        <Checkbox
                            checked={style.displayStats}
                            name="displayStats"
                            label="Display Stats"
                            onChange={(checked) =>
                                editStyle({ displayStats: checked })
                            }
                        />
                    </div>
                    <ul
                        style={{
                            listStyleType: "none",
                            padding: 0,
                            marginLeft: "1rem",
                            opacity: style.displayStats ? 1 : 0.3,
                        }}
                    >
                        <li>
                            <Switch
                                checked={stats?.averageLevel}
                                label="Average Level"
                                onChange={(checked) =>
                                    editStyle({
                                        statsOptions: {
                                            ...stats,
                                            averageLevel: checked,
                                        },
                                    })
                                }
                            />
                        </li>

                        <li>
                            <Switch
                                checked={stats?.averageLevelDetailed}
                                label="Average Level (Detailed)"
                                onChange={(checked) =>
                                    editStyle({
                                        statsOptions: {
                                            ...stats,
                                            averageLevelDetailed: checked,
                                        },
                                    })
                                }
                            />
                        </li>

                        <li>
                            <Switch
                                checked={stats?.mostCommonKillers}
                                label="Most Common Killers"
                                onChange={(checked) =>
                                    editStyle({
                                        statsOptions: {
                                            ...stats,
                                            mostCommonKillers: checked,
                                        },
                                    })
                                }
                            />
                        </li>

                        <li>
                            <Switch
                                checked={stats?.mostCommonTypes}
                                label="Most Common Types"
                                onChange={(checked) =>
                                    editStyle({
                                        statsOptions: {
                                            ...stats,
                                            mostCommonTypes: checked,
                                        },
                                    })
                                }
                            />
                        </li>

                        <li>
                            <Switch
                                checked={stats?.shiniesCaught}
                                label="Shinies Caught"
                                onChange={(checked) =>
                                    editStyle({
                                        statsOptions: {
                                            ...stats,
                                            shiniesCaught: checked,
                                        },
                                    })
                                }
                            />
                        </li>

                        {this.props.stats?.sort(sortById).map((stat) => (
                            <li
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                }}
                                className="flex items-center gap-1"
                                key={stat.id}
                            >
                                <input
                                    onChange={this.onChange(stat, "key")}
                                    style={{ margin: "4px" }}
                                    className="px-2 py-1.5 text-sm border border-border bg-input text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                    type="text"
                                    placeholder="custom label"
                                    value={stat.key}
                                />
                                <input
                                    onChange={this.onChange(stat, "value")}
                                    style={{ margin: "4px" }}
                                    className="px-2 py-1.5 text-sm border border-border bg-input text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                    type="text"
                                    placeholder="custom value"
                                    value={stat.value}
                                />
                                <Button
                                    icon="trash"
                                    intent="danger"
                                    style={{ margin: "6px", fontSize: "80%" }}
                                    minimal
                                    onClick={() =>
                                        stat?.id && deleteStat(stat?.id)
                                    }
                                />
                            </li>
                        ))}

                        <li>
                            <Button
                                icon="plus"
                                style={{ margin: "4px", fontSize: "80%" }}
                                onClick={() => addStat({ key: "", value: "" })}
                                intent="success"
                            >
                                Add Custom Stat
                            </Button>
                        </li>
                    </ul>
                </ErrorBoundary>
            </BaseEditor>
        );
    }
}

export const StatsEditor = connect(
    (state: State) => ({
        pokemon: state.pokemon,
        style: state.style,
        stats: state.stats,
    }),
    {
        editStyle,
        addStat,
        deleteStat,
        editStat,
    },
)(StatsEditorBase as any);
