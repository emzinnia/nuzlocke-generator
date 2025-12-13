import * as React from "react";
import { connect } from "react-redux";
import { State } from "state";
import { movesByType, getListOfTypes } from "utils";
import {
    Dialog,
    DialogBody,
    Button,
    Icon,
    HTMLSelect,
    Input,
    Label,
    classNames,
} from "components/Common/ui";
import { Move } from "components/Pokemon/TeamPokemon/Moves";
import {
    editCustomMoveMap,
    deleteCustomMove,
    deleteCustomType,
    createCustomType,
    editCustomType,
} from "actions";
import { ErrorBoundary } from "components";
import { TypesEditor } from "./TypesEditor";
import { cx } from "emotion";
import { Trash, Search, Edit } from "lucide-react";

export interface MoveEditorProps {
    game: State["game"];
    style: State["style"];
    isOpen: boolean;
    toggleDialog(): void;
    editCustomMoveMap: editCustomMoveMap;
    deleteCustomMove: deleteCustomMove;
    deleteCustomType: deleteCustomType;
    createCustomType: createCustomType;
    editCustomType: editCustomType;
    customTypes: State["customTypes"];
    customMoveMap: State["customMoveMap"];
}

export interface MoveEditorState {
    searchTerm: string;
    moveType: string;
    moveName: string;
}

export class MoveEditorBase extends React.Component<
    MoveEditorProps,
    MoveEditorState
> {
    public state = {
        searchTerm: "",
        moveType: "",
        moveName: "",
    };

    private getTypes() {
        const { customTypes } = this.props;
        return getListOfTypes(customTypes);
    }

    private moveFilter = (move: string, type: string, searchTerm: string) => {
        return (
            move.toLowerCase().includes(searchTerm.toLowerCase()) ||
            type.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    private renderMoves(moves, isCustom = false) {
        const { searchTerm } = this.state;
        const { style, customMoveMap, customTypes } = this.props;
        const types = this.getTypes();
        const movesToDisplay = customMoveMap.filter((m) =>
            this.moveFilter(m.move, m.type, searchTerm),
        );

        const onChange = (move) => (e) => {
            this.props.editCustomMoveMap(e.target.value, move);
        };

        if (isCustom) {
            if (!Array.isArray(customMoveMap)) {
                return null;
            }
            return movesToDisplay.map(({ move, type, id }, index) => {
                return (
                    <div
                        key={id || index}
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            padding: ".25rem",
                            position: "relative",
                        }}
                    >
                        <div style={{ width: "12rem", marginRight: ".5rem" }}>
                            <Move
                                index={index}
                                move={move}
                                type={type}
                                style={style}
                                customTypes={customTypes}
                            />
                        </div>
                        <HTMLSelect onChange={onChange(move)} value={type}>
                            {types.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </HTMLSelect>
                        <Icon
                            onClick={(_e) => this.props.deleteCustomMove(id)}
                            style={{
                                color: "red",
                                position: "absolute",
                                cursor: "pointer",
                            }}
                            icon={<Trash size={16} />}
                        />
                    </div>
                );
            });
        }

        const prepared = Object.keys(moves).map((type) => {
            return moves[type]
                .sort()
                .filter((m) => this.moveFilter(m, type, searchTerm))
                .map((move, index) => (
                    <div
                        key={move || index}
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            padding: ".25rem",
                        }}
                    >
                        <div style={{ width: "12rem", marginRight: ".5rem" }}>
                            <Move
                                index={index}
                                move={move}
                                type={type}
                                style={style}
                                customTypes={customTypes}
                            />
                        </div>
                        <HTMLSelect onChange={onChange(move)} value={type}>
                            {types.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </HTMLSelect>
                    </div>
                ));
        });

        return prepared;
    }

    private onSearch = (e) => {
        this.setState({ searchTerm: e.target.value });
    };

    public render() {
        const {
            isOpen,
            toggleDialog,
            style,
            customMoveMap,
            customTypes,
            createCustomType,
            deleteCustomType,
        } = this.props;
        const { moveType, moveName } = this.state;
        const types = this.getTypes();

        return (
            <ErrorBoundary>
                <Dialog
                    icon={<Edit size={18} />}
                    isOpen={isOpen}
                    onClose={toggleDialog}
                    className={classNames("wide-dialog", { dark: style.editorDarkMode })}
                    title="Move Editor"
                >
                    <DialogBody
                        className={cx("move-editor")}
                        style={{
                            height: "800px",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                flexWrap: "wrap",
                                justifyContent: "center",
                                border: "1px solid #ccc",
                                borderRadius: ".25rem",
                                padding: "0.5rem",
                                margin: ".5rem",
                            }}
                            className="add-move-wrapper"
                        >
                            <Label
                                style={{ padding: "0.5rem" }}
                                className="inline"
                            >
                                Add A Move
                            </Label>
                            <Input
                                placeholder="Move Name"
                                style={{ width: "10rem", margin: "0 .25rem" }}
                                onChange={(e) =>
                                    this.setState({ moveName: e.target.value })
                                }
                                value={moveName}
                                type="text"
                            />
                            <HTMLSelect
                                style={{ width: "8rem", margin: "0 .25rem" }}
                                onChange={(e) =>
                                    this.setState({
                                        moveType: e.target.value,
                                    })
                                }
                                value={moveType}
                            >
                                {types.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </HTMLSelect>
                            <Button
                                style={{ margin: "0 .25rem" }}
                                onClick={(_e) => {
                                    this.props.editCustomMoveMap(
                                        moveType,
                                        moveName,
                                    );
                                }}
                                intent="primary"
                                disabled={!(moveType && moveName)}
                            >
                                Add Move
                            </Button>
                        </div>
                        <div
                            className="moves-wrapper has-nice-scrollbars"
                            style={{
                                borderRadius: ".25rem",
                                height: "88%",
                                padding: "0.5rem",
                                overflowY: "scroll",
                                display: "flex",
                                flexWrap: "wrap",
                                justifyContent: "center",
                            }}
                        >
                            <div
                                style={{
                                    width: "60%",
                                    borderRadius: ".25rem",
                                    margin: "4px",
                                }}
                            >
                                <div
                                    className="flex items-center gap-2"
                                    style={{
                                        width: "50%",
                                        margin: "0 auto",
                                        position: "sticky",
                                    }}
                                >
                                    <Icon icon={<Search size={16} />} />
                                    <Input
                                        value={this.state.searchTerm}
                                        onInput={this.onSearch}
                                        type="search"
                                        dir="auto"
                                    />
                                </div>
                                {this.renderMoves(customMoveMap, true)}
                                {this.renderMoves(movesByType)}
                            </div>
                            <div
                                style={{
                                    width: "39%",
                                    padding: "1rem",
                                    borderRadius: ".25rem",
                                    margin: "4px",
                                }}
                            >
                                <TypesEditor
                                    editCustomType={editCustomType}
                                    customTypes={customTypes}
                                    createCustomType={createCustomType}
                                    deleteCustomType={deleteCustomType}
                                />
                            </div>
                        </div>
                    </DialogBody>
                </Dialog>
            </ErrorBoundary>
        );
    }
}

export const MoveEditor = connect(
    (state: State) => ({
        game: state.game,
        style: state.style,
        customMoveMap: state.customMoveMap,
        customTypes: state.customTypes,
    }),
    {
        editCustomMoveMap,
        deleteCustomMove,
        deleteCustomType,
        createCustomType,
        editCustomType,
    },
    null,
    { pure: false },
)(MoveEditorBase);
