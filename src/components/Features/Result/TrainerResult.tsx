import * as React from "react";
import {
    OrientationType,
    mapTrainerImage,
    Game,
    Styles,
    getContrastColor,
    isEmpty,
    feature,
} from "utils";
import { connect, useSelector } from "react-redux";
import { Trainer } from "models";
import { State } from "state";
import { Checkpoints } from "reducers/checkpoints";
import { Stats } from "./Stats";
import { cx } from "emotion";

export interface TrainerResultProps {
    orientation: OrientationType;

    checkpoints: Checkpoints;
    trainer: Trainer;
    game: { name: Game; customName: string };
    style: Styles;
    rules: string[];
}

export interface TrainerColumnItemProps {
    trainer: Trainer;
    prop: string;
    orientation: OrientationType;
}

export const TrainerColumnItem = ({
    trainer,
    prop,
    orientation,
}: TrainerColumnItemProps) => {
    const isVertical = orientation === "vertical";
    const bottomTextStyle: React.CSSProperties = {
        fontSize: "1.1rem",
        fontWeight: "bold",
        padding: "2px",
    };
    const baseDivStyle = isVertical
        ? { padding: "2px" }
        : { padding: ".25rem" };

    return !isEmpty(trainer[prop]) ? (
        <div style={baseDivStyle} className={`trainer-${prop} column`}>
            <div style={baseDivStyle}>{prop}</div>
            <div style={bottomTextStyle}>{trainer[prop]}</div>
        </div>
    ) : null;
};

export interface CheckpointsDisplayProps {
    style: State["style"];
    trainer?: State["trainer"];
    game: State["game"];
    clearedCheckpoints?: Checkpoints;
    className?: string;
}

export function CheckpointsDisplay({
    style,
    trainer,
    game,
    clearedCheckpoints,
    className,
}: CheckpointsDisplayProps) {
    const { name } = game;
    const checkpoints = useSelector<State, State["checkpoints"]>(
        (state) => state.checkpoints,
    );
    const cleared = trainer?.badges ?? clearedCheckpoints ?? [];

    if (!style.displayBadges) {
        return null;
    }

    const swshPositions = [
        { bottom: 0, right: 0 },
        { right: "-9px", top: "2px", height: "24px" },
        { bottom: "11px", left: "20px" },
        { bottom: "2px", left: "9px" },
        { bottom: "3px", left: "28.5px", height: "33px" },
        { top: "-3px", left: "23px" },
        { left: "14px", top: "5px", height: "25px" },
        { left: "3px", top: "2px", height: "32px" },
    ];

    return (
        <>
            {checkpoints.map((badge, index) => {
                const obtained = cleared.some((b) => b.name === badge.name);
                return (
                    <React.Fragment key={badge.name}>
                        <img
                            className={cx(
                                className ?? "",
                                obtained ? "obtained" : "not-obtained",
                            )}
                            style={
                                isSWSH(name) && !trainer?.hasEditedCheckpoints
                                    ? {
                                          position: "absolute",
                                          ...swshPositions[index],
                                      }
                                    : {}
                            }
                            key={badge.name}
                            alt={badge.name}
                            data-badge={badge.name}
                            src={
                                badge.image.startsWith("http") ||
                                badge.image.startsWith("data")
                                    ? badge.image
                                    : `/img/checkpoints/${badge.image}.png`
                            }
                        />
                        {badge.name === "Rising Badge" ? <br /> : null}
                    </React.Fragment>
                );
            })}
        </>
    );
}

export const isSWSH = (name) => name === "Sword" || name === "Shield";

export class TrainerResultBase extends React.Component<TrainerResultProps> {
    private getBadgeWrapperStyles(orientation) {
        const {
            trainer,
            game: { name },
        } = this.props;

        let style = {};
        if (isSWSH(name) && !trainer.hasEditedCheckpoints) {
            style = {
                height: "3rem",
                width: "3rem",
                position: "relative",
                padding: ".25rem",
            };
        }
        if (orientation === "vertical") {
            style = { ...style, margin: "0", padding: ".25rem" };
        }
        if (!isSWSH(name) && orientation === "vertical") {
            style = { ...style, width: "100%" };
        }
        return style;
    }

    public render() {
        const { trainer, game, style, orientation, checkpoints } = this.props;
        const isVertical = orientation === "vertical";
        const baseDivStyle = isVertical
            ? { padding: "2px" }
            : { padding: ".25rem" };
        const tciProps = { trainer, orientation };
        const enableStats = style.displayStats;
        const emmaMode = feature.emmaMode;

        return (
            <div
                className="trainer-wrapper"
                style={
                    orientation === "vertical"
                        ? {
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              alignItems: "center",
                              width: "100%",
                          }
                        : {}
                }
            >
                <div
                    className="trainer-game-badge"
                    style={{
                        color: getContrastColor(style.bgColor),
                        background: style.bgColor,
                        margin: isVertical ? "4px" : "0",
                        marginRight: isVertical ? "0" : ".5rem",
                        marginLeft: isVertical ? "0" : ".5rem",
                        minWidth: "100px",
                        borderRadius: ".25rem",
                        textAlign: "center",
                        padding: "2px",
                    }}
                >
                    {game.customName || game.name}
                </div>
                {trainer.image ? (
                    <img
                        className="trainer-image"
                        src={mapTrainerImage(trainer.image)}
                        alt="Trainer"
                    />
                ) : null}
                {trainer.title ? (
                    <div style={baseDivStyle} className="nuzlocke-title">
                        {this.props.trainer.title}
                    </div>
                ) : (
                    <div style={baseDivStyle} className="nuzlocke-title">
                        {this.props.game.name} Nuzlocke
                    </div>
                )}
                {feature.resultv2 ? (
                    <div className="flex trainer-info-columns">
                        {["name", "money", "time", "id", "totalTime"].map(
                            (item) => (
                                <TrainerColumnItem
                                    key={item}
                                    prop={item}
                                    {...tciProps}
                                />
                            ),
                        )}
                    </div>
                ) : (
                    <>
                        {["name", "money", "time", "id", "totalTime"].map(
                            (item) => (
                                <TrainerColumnItem
                                    key={item}
                                    prop={item}
                                    {...tciProps}
                                />
                            ),
                        )}
                    </>
                )}
                <div
                    className="badge-wrapper flex"
                    style={this.getBadgeWrapperStyles(orientation)}
                >
                    <CheckpointsDisplay
                        className="trainer-checkpoint"
                        trainer={trainer}
                        style={style}
                        game={game}
                    />
                </div>
                {style.displayRules &&
                style.displayRulesLocation === "inside trainer section" ? (
                    <div
                        style={{ marginTop: "1rem" }}
                        className="rules-container"
                    >
                        <h3>Rules</h3>
                        <ol style={{ paddingLeft: "20px", textAlign: "left" }}>
                            {this.props.rules.map((rule, index) => {
                                return <li key={index}>{rule}</li>;
                            })}
                        </ol>
                    </div>
                ) : null}
                {emmaMode && <Stats />}
            </div>
        );
    }
}

export const TrainerResult = connect((state: Pick<State, keyof State>) => ({
    checkpoints: state.checkpoints,
    style: state.style,
    trainer: state.trainer,
    game: state.game,
    rules: state.rules,
}))(TrainerResultBase);
