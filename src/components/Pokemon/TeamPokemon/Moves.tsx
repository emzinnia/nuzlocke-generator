import * as React from "react";
import {
    Generation,
    Styles,
    handleMovesGenerationsExceptions,
    getMoveType,
    typeToColor,
    getContrastColor,
    Types,
} from "utils";
import { Pokemon } from "models";
import { connect } from "store/reactZustand";
import { State } from "state";
import { noop } from "redux-saga/utils";
import * as ReactDOMServer from "react-dom/server";

export interface MovesProps {
    generation: Generation;
    moves: Pokemon["moves"];
    movesPosition?: Styles["movesPosition"];
    style: Styles;
    customMoveMap: State["customMoveMap"];
    customTypes: State["customTypes"];
    stripClasses?: boolean;
}

export const Move = ({
    index,
    style,
    type,
    move,
    customTypes,
    stripClasses = false,
}) =>
    move && (
        <div
            key={index}
            style={
                style.usePokemonGBAFont
                    ? {
                          fontSize: "1rem",
                          background:
                              typeToColor(type, customTypes) || "transparent",
                          color: getContrastColor(
                              typeToColor(type, customTypes),
                          ),
                      }
                    : {
                          background:
                              typeToColor(type, customTypes) || "transparent",
                          color: getContrastColor(
                              typeToColor(type, customTypes),
                          ),
                      }
            }
            className={
                stripClasses
                    ? ""
                    : `move move-${move.replace(/\s/g, "-")?.toLowerCase()} move-${type.toLowerCase()} ${
                          move.length >= 10 ? "long-text-move" : ""
                      }`
            }
        >
            {move}
        </div>
    );

export const getMapMove = (moveMap, move) =>
    moveMap?.find((m) => m.move === move);

export class MovesBase extends React.Component<MovesProps> {
    private generateMoves(moves: MovesProps["moves"]) {
        const {
            style,
            customMoveMap,
            customTypes,
            stripClasses = false,
        } = this.props;

        if (!moves) return null;

        return moves.map((move, index) => {
            let customMove;
            try {
                customMove = getMapMove(customMoveMap, move);
            } catch {
                noop();
            }
            move = move.trim();
            const type = handleMovesGenerationsExceptions({
                move: move,
                generation: this.props.generation,
                originalType: customMove?.type || getMoveType(move),
            });
            return (
                <Move
                    key={index}
                    index={index}
                    style={style}
                    type={type}
                    move={move}
                    stripClasses={stripClasses}
                    customTypes={customTypes}
                />
            );
        });
    }

    public renderToString() {
        const { moves } = this.props;
        return this.generateMoves(moves)?.map((m) =>
            ReactDOMServer.renderToString(m),
        );
    }

    public render() {
        const { moves, movesPosition, stripClasses = false } = this.props;
        if (moves == null) return null;
        return stripClasses ? (
            this.generateMoves(moves)
        ) : (
            <div className={`pokemon-moves ${movesPosition}`}>
                {this.generateMoves(moves)}
            </div>
        );
    }
}

export const Moves = connect((state: State) => ({
    style: state.style,
    customMoveMap: state.customMoveMap,
    customTypes: state.customTypes,
}))(MovesBase);
