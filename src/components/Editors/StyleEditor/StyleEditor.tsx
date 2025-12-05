import * as React from "react";
import { connect } from "react-redux";

import { editStyle } from "actions";
import {
    capitalize,
    gameOfOriginToColor,
    listOfThemes,
    Game,
    OrientationType,
    Styles as StylesType,
    feature,
} from "utils";
import {
    RadioGroup,
    Radio,
    TextArea,
    Checkbox,
    Button,
    Intent,
    Classes,
    Drawer,
    DrawerSize,
    Icon,
    HTMLSelect,
} from "@blueprintjs/core";
import { State } from "state";
import { BaseEditor } from "components/Editors/BaseEditor/BaseEditor";
import { ColorInput } from "components/Common/ui";
import { cx } from "emotion";
import * as Styles from "./styles";
import { ThemeEditor } from "components/Editors/ThemeEditor/ThemeEditor";
import { customCSSGuide as text } from "utils/customCSSGuide";
import ReactMarkdown from "react-markdown";
import { debounce } from "utils/debounce";

const editEvent = (
    e: any,
    props: StyleEditorProps,
    name?: keyof State["style"],
    game?: Game,
) => {
    const propName = name || e.target.name;
    props.editStyle({ [propName]: e.target.value });
    if (propName === "template" && e.target.value === "Default Light") {
        props.editStyle({ bgColor: "#eeeeee", topHeaderColor: "#dedede" });
    }
    if (propName === "template" && e.target.value === "Default Dark") {
        props.editStyle({ bgColor: "#383840", topHeaderColor: "#333333" });
    }
    if (propName === "template" && e.target.value === "Compact with Icons") {
        props.editStyle({ imageStyle: "square" });
    }
    if (propName === "template" && e.target.value === "Cards") {
        props.editStyle({
            imageStyle: "square",
            movesPosition: "horizontal" as OrientationType,
        });
    }
    if (propName === "template" && e.target.value === "Hexagons") {
        props.editStyle({
            resultWidth: 1320,
            accentColor: "rgba(0, 0, 0, 0)",
            movesPosition: "horizontal" as OrientationType,
        });
    }
    if (
        (propName === "template" && e.target.value === "Generations") ||
        e.target.value === "Generations Classic"
    ) {
        props.editStyle({
            bgColor: game ? gameOfOriginToColor(game) : "",
            minimalBoxedLayout: true,
            // @TODO: only push if resultW/H is lower
            resultHeight: 870,
            resultWidth: 1460,
            movesPosition: "vertical",
        });
    }
};

export interface StyleEditorProps {
    style: StylesType;
    editStyle: editStyle;
    game: any;
}

export interface StyleEditorState {
    isThemeEditorOpen: boolean;
    isCSSGuideOpen: boolean;
}

export const IconsNextToTeamPokemon = (props) => (
    <div className="style-edit">
        <Checkbox
            checked={props.style.iconsNextToTeamPokemon}
            name="iconsNextToTeamPokemon"
            label="Icons Next to Team Pokémon"
            onChange={(e: any) =>
                editEvent(
                    { ...e, target: { value: e.target.checked } },
                    props,
                    "iconsNextToTeamPokemon",
                )
            }
        />
    </div>
);

export const smallItemOptions = ["outer glow", "round", "square", "text"];

export const TextAreaDebounced = ({
    edit,
    props,
    name,
}: {
    edit: typeof editEvent;
    props: StyleEditorProps;
    name: keyof State["style"];
}) => {
    const [value, setValue] = React.useState("");

    const delayedValue = React.useCallback(
        debounce((e) => edit(e, props, name), 300),
        [props.style[name]],
    );

    const onChange = (e) => {
        e.persist();
        setValue(e.target.value);
        delayedValue(e);
    };

    React.useEffect(() => {
        setValue(props.style[name] as string);
    }, [props.style[name]]);

    return (
        <TextArea
            large={true}
            onChange={onChange}
            className={cx("custom-css-input", Classes.FILL)}
            value={value}
            name={name}
        />
    );
};

export class StyleEditorBase extends React.Component<
    StyleEditorProps,
    StyleEditorState
> {
    public state = {
        isThemeEditorOpen: false,
        showChromePicker: false,
        isCSSGuideOpen: false,
    };
    private toggleThemeEditor = () =>
        this.setState({ isThemeEditorOpen: !this.state.isThemeEditorOpen });
    private toggleCSSGuide = () =>
        this.setState({ isCSSGuideOpen: !this.state.isCSSGuideOpen });
    public render() {
        const props: StyleEditorProps = this.props;
        const createStyleEdit = (isWidthHeight?: boolean) =>
            cx(Styles.styleEdit, {
                [Styles.styleEdit_dark]: props.style.editorDarkMode,
                [Styles.widthHeightInputs]: isWidthHeight,
            });
        const styleEdit = createStyleEdit(false);
        const teamImages = [
            "standard",
            "sugimori",
            "dream world",
            "shuffle",
            "tcg",
        ];
        const calloutStyle = {
            marginLeft: "2px",
            fontSize: "80%",
            padding: "7px",
        };
        return (
            <BaseEditor icon="style" name="Style">
                {feature.themeEditing ? (
                    <Drawer
                        isOpen={this.state.isThemeEditorOpen}
                        onClose={this.toggleThemeEditor}
                        size={DrawerSize.LARGE}
                        title="Theme Editor"
                        icon="style"
                        className={cx(Styles.dialog, {
                            [Classes.DARK]: props.style.editorDarkMode,
                        })}
                    >
                        <ThemeEditor />
                    </Drawer>
                ) : null}
                <Drawer
                    isOpen={this.state.isCSSGuideOpen}
                    onClose={this.toggleCSSGuide}
                    size={DrawerSize.LARGE}
                    title="CSS Guide"
                    icon="style"
                    className={cx(
                        Styles.dialog,
                        {
                            [Classes.DARK]: props.style.editorDarkMode,
                        },
                        "release-notes-wrapper",
                    )}
                >
                    <ReactMarkdown>{text}</ReactMarkdown>
                </Drawer>
                <div className={styleEdit}>
                    <label
                        htmlFor="template"
                        className={cx(Classes.LABEL, Classes.INLINE)}
                    >
                        Template
                    </label>
                    <HTMLSelect
                        name="template"
                        onChange={(e) =>
                            editEvent(e, props, undefined, props.game.name)
                        }
                        value={props.style.template}
                    >
                        {listOfThemes.map((o) => (
                            <option key={o}>{o}</option>
                        ))}
                    </HTMLSelect>
                    {feature.themeEditing ? (
                        <Button
                            onClick={this.toggleThemeEditor}
                            style={{ marginLeft: ".25rem" }}
                            intent={Intent.PRIMARY}
                            minimal
                        >
                            Edit Theme
                        </Button>
                    ) : null}
                </div>

                <div className={styleEdit}>
                    <RadioGroup
                        className={cx(Styles.radioGroup)}
                        label="Image Style"
                        onChange={(e) => editEvent(e, props, "imageStyle")}
                        selectedValue={props.style.imageStyle}
                    >
                        <Radio label="Round" value="round" />
                        <Radio label="Square" value="square" />
                    </RadioGroup>
                </div>

                <div className={styleEdit}>
                    <label
                        htmlFor="itemStyle"
                        className={cx(Classes.LABEL, Classes.INLINE)}
                    >
                        Item Style
                    </label>
                    <HTMLSelect
                        name="itemStyle"
                        onChange={(e) => editEvent(e, props, undefined)}
                        value={props.style.itemStyle}
                    >
                        {smallItemOptions.map((v) => {
                            return (
                                <option key={v} value={v}>
                                    {capitalize(v)}
                                </option>
                            );
                        })}
                    </HTMLSelect>
                </div>

                <div className={styleEdit}>
                    <label
                        htmlFor="pokeballStyle"
                        className={cx(Classes.LABEL, Classes.INLINE)}
                    >
                        Pokéball Style
                    </label>
                    <HTMLSelect
                        name="pokeballStyle"
                        onChange={(e) => editEvent(e, props, undefined)}
                        value={props.style.pokeballStyle}
                    >
                        {smallItemOptions.map((v) => {
                            return (
                                <option key={v} value={v}>
                                    {capitalize(v)}
                                </option>
                            );
                        })}
                    </HTMLSelect>
                </div>

                <div className={createStyleEdit(true)}>
                    <div>
                        <label
                            htmlFor="resultWidth"
                            className={cx(Classes.LABEL, Classes.INLINE)}
                        >
                            Result Dimensions
                        </label>
                        <span style={{ fontSize: "80%", marginRight: "2px" }}>
                            w
                        </span>
                        <input
                            name="resultWidth"
                            className={cx(Classes.INPUT, "small-input")}
                            onChange={(e) => editEvent(e, props)}
                            value={props.style.resultWidth}
                            type="number"
                            min="0"
                            step="10"
                        />
                        <Icon icon="cross" style={{ marginRight: "0" }} />
                        <span style={{ fontSize: "80%", marginRight: "2px" }}>
                            h
                        </span>
                        <input
                            name="resultHeight"
                            className={cx(Classes.INPUT, "small-input")}
                            style={{
                                opacity: props.style.useAutoHeight ? 0.3 : 1,
                            }}
                            onChange={(e) => editEvent(e, props)}
                            value={props.style.resultHeight}
                            type="number"
                            min="0"
                            step="10"
                        />
                    </div>
                    <div className={Styles.autoHeightCheckbox}>
                        <span> </span>
                        <Checkbox
                            style={{
                                marginBottom: "0",
                                marginLeft: "10px",
                            }}
                            checked={props.style.useAutoHeight}
                            name="useAutoHeight"
                            label="Auto Height"
                            onChange={(e: any) =>
                                editEvent(
                                    {
                                        ...e,
                                        target: { value: e.target.checked },
                                    },
                                    props,
                                    "useAutoHeight",
                                )
                            }
                        />
                    </div>
                </div>

                <div className={createStyleEdit(true)}>
                    <div>
                        <label
                            htmlFor="trainerWidth"
                            className={cx(Classes.LABEL, Classes.INLINE)}
                        >
                            Trainer Dimensions
                        </label>
                        <span style={{ fontSize: "80%", marginRight: "2px" }}>
                            w
                        </span>
                        <input
                            name="trainerWidth"
                            className={cx(Classes.INPUT, "small-input")}
                            onChange={(e) => editEvent(e, props)}
                            style={{
                                opacity: props.style.trainerAuto ? 0.3 : 1,
                            }}
                            value={props.style.trainerWidth}
                        />
                        <Icon icon="cross" style={{ marginRight: "0" }} />
                        <span style={{ fontSize: "80%", marginRight: "2px" }}>
                            h
                        </span>
                        <input
                            name="trainerHeight"
                            className={cx(Classes.INPUT, "small-input")}
                            style={{
                                opacity: props.style.trainerAuto ? 0.3 : 1,
                            }}
                            onChange={(e) => editEvent(e, props)}
                            value={props.style.trainerHeight}
                        />
                    </div>
                    <div className={Styles.autoHeightCheckbox}>
                        <span> </span>
                        <Checkbox
                            style={{
                                marginBottom: "0",
                                marginLeft: "10px",
                            }}
                            checked={props.style.trainerAuto}
                            name="trainerAuto"
                            label="Auto Dimensions"
                            onChange={(e: any) =>
                                editEvent(
                                    {
                                        ...e,
                                        target: { value: e.target.checked },
                                    },
                                    props,
                                    "trainerAuto",
                                )
                            }
                        />
                    </div>
                </div>

                <div className={styleEdit}>
                    <RadioGroup
                        className={cx(Styles.radioGroup)}
                        label="Trainer Section Position"
                        onChange={(e) =>
                            editEvent(e, props, "trainerSectionOrientation")
                        }
                        selectedValue={props.style.trainerSectionOrientation}
                    >
                        <Radio label="Horizontal" value="horizontal" />
                        <Radio label="Vertical" value="vertical" />
                    </RadioGroup>
                </div>

                <div className={styleEdit}>
                    <label className={cx(Classes.LABEL, Classes.INLINE)}>
                        Background color
                    </label>
                    <ColorInput
                        onChange={(e) => editEvent(e, props)}
                        name={"bgColor"}
                        value={rgbaOrHex(props.style.bgColor)}
                        onColorChange={(color) =>
                            editEvent(
                                { target: { value: rgbaOrHex(color) } },
                                props,
                                "bgColor",
                            )
                        }
                    />
                </div>

                <div className={styleEdit}>
                    <label className={cx(Classes.LABEL, Classes.INLINE)}>
                        Accent color
                    </label>
                    <ColorInput
                        onChange={(e) => editEvent(e, props)}
                        name={"accentColor"}
                        value={props.style.accentColor}
                        onColorChange={(color) =>
                            editEvent(
                                { target: { value: rgbaOrHex(color) } },
                                props,
                                "accentColor",
                            )
                        }
                    />
                </div>

                <div className={styleEdit}>
                    <label className={cx(Classes.LABEL, Classes.INLINE)}>
                        Header color
                    </label>
                    <ColorInput
                        name="topHeaderColor"
                        onChange={(e) => editEvent(e, props)}
                        value={props.style.topHeaderColor}
                        onColorChange={(color) =>
                            editEvent(
                                { target: { value: rgbaOrHex(color) } },
                                props,
                                "topHeaderColor",
                            )
                        }
                    />
                </div>

                <div className={styleEdit}>
                    <label className={cx(Classes.LABEL, Classes.INLINE)}>
                        Background Image
                    </label>
                    <input
                        value={props.style.backgroundImage}
                        name="backgroundImage"
                        onChange={(e) => editEvent(e, props)}
                        className={Classes.INPUT}
                    />
                    <span> </span>
                    <Checkbox
                        style={{
                            marginBottom: "0",
                            marginLeft: "10px",
                        }}
                        checked={props.style.tileBackground}
                        name="tileBackground"
                        label="Tile"
                        onChange={(e: any) =>
                            editEvent(
                                { ...e, target: { value: e.target.checked } },
                                props,
                                "tileBackground",
                            )
                        }
                    />
                </div>

                <div className={styleEdit}>
                    <label className={cx(Classes.LABEL, Classes.INLINE)}>
                        Rules Location
                    </label>
                    <HTMLSelect
                        name="displayRulesLocation"
                        onChange={(e) => editEvent(e, props, undefined)}
                        value={props.style.displayRulesLocation}
                    >
                        <option key={"inside trainer section"}>
                            {"inside trainer section"}
                        </option>
                        <option key={"bottom"}>bottom</option>
                        <option key={"top"}>top</option>
                    </HTMLSelect>
                </div>

                <div className={styleEdit}>
                    <RadioGroup
                        className={cx(Styles.radioGroup)}
                        label="Icon Rendering"
                        onChange={(e) => editEvent(e, props, "iconRendering")}
                        selectedValue={props.style.iconRendering}
                    >
                        <Radio label="Pixelated" value="pixelated" />
                        <Radio label="Automatic" value="auto" />
                    </RadioGroup>
                </div>

                <div className={styleEdit}>
                    <RadioGroup
                        className={cx(Styles.radioGroup)}
                        label="Moves Position"
                        onChange={(e) => editEvent(e, props, "movesPosition")}
                        selectedValue={props.style.movesPosition}
                    >
                        <Radio label="Horizontal" value="horizontal" />
                        <Radio label="Vertical" value="vertical" />
                    </RadioGroup>
                </div>

                <div className={styleEdit}>
                    <label
                        htmlFor="teamImages"
                        className={cx(Classes.LABEL, Classes.INLINE)}
                    >
                        Team Images
                    </label>
                    <HTMLSelect
                        name="teamImages"
                        onChange={(e) =>
                            editEvent(e, props, undefined, props.game.name)
                        }
                        value={props.style.teamImages}
                    >
                        {teamImages.map((o) => (
                            <option value={o} key={o}>
                                {capitalize(o)}
                            </option>
                        ))}
                    </HTMLSelect>
                    {(props.game.name === "Sword" ||
                        props.game.name === "Shield") &&
                    props.style.teamImages === "shuffle" ? (
                        <div
                            className={cx(
                                Classes.CALLOUT,
                                Classes.INTENT_DANGER,
                            )}
                            style={calloutStyle}
                        >
                            Shuffle images are not supported for this game
                        </div>
                    ) : null}
                    {[
                        "Sword",
                        "Shield",
                        "X",
                        "Y",
                        "Sun",
                        "Moon",
                        "Ultra Sun",
                        "Ultra Moon",
                    ].includes(props.game.name) &&
                    props.style.teamImages === "dream world" ? (
                        <div
                            className={cx(
                                Classes.CALLOUT,
                                Classes.INTENT_DANGER,
                            )}
                            style={calloutStyle}
                        >
                            Dream world images are not supported for this game
                        </div>
                    ) : null}
                    {["Sword", "Shield"].includes(props.game.name) &&
                    props.style.teamImages === "tcg" ? (
                        <div
                            className={cx(
                                Classes.CALLOUT,
                                Classes.INTENT_DANGER,
                            )}
                            style={calloutStyle}
                        >
                            TCG images are not fully supported for this game
                        </div>
                    ) : null}
                </div>

                <div className={styleEdit}>
                    <label
                        htmlFor="boxedPokemonPerLine"
                        className={cx(Classes.LABEL, Classes.INLINE)}
                    >
                        Pokemon Per Line (Boxed)
                    </label>
                    <input
                        name="boxedPokemonPerLine"
                        className={cx(Classes.INPUT, "small-input")}
                        onChange={(e) => editEvent(e, props)}
                        value={props.style.boxedPokemonPerLine}
                        type="number"
                        min="01"
                        step="1"
                        max="20"
                    />
                </div>

                <div className={styleEdit}>
                    <label
                        htmlFor="linkedPokemonText"
                        className={cx(Classes.LABEL, Classes.INLINE)}
                    >
                        Linked Pokemon Text
                    </label>
                    <input
                        name="linkedPokemonText"
                        className={cx(Classes.INPUT)}
                        onChange={(e) => editEvent(e, props)}
                        value={props?.style?.linkedPokemonText}
                    />
                </div>

                <div className={styleEdit}>
                    <Checkbox
                        checked={props.style.teamPokemonBorder}
                        name="teamPokemonBorder"
                        label="Team Pokémon Gradient Backgrounds"
                        onChange={(e: any) =>
                            editEvent(
                                { ...e, target: { value: e.target.checked } },
                                props,
                                "teamPokemonBorder",
                            )
                        }
                    />
                </div>

                <div className={styleEdit}>
                    <Checkbox
                        checked={props.style.showPokemonMoves}
                        name="showPokemonMoves"
                        label="Show Pokémon Moves"
                        onChange={(e: any) =>
                            editEvent(
                                { ...e, target: { value: e.target.checked } },
                                props,
                                "showPokemonMoves",
                            )
                        }
                    />
                </div>

                <div className={styleEdit}>
                    <Checkbox
                        checked={props.style.minimalTeamLayout}
                        name="minimalTeamLayout"
                        label="Minimal Team Layout"
                        onChange={(e: any) =>
                            editEvent(
                                { ...e, target: { value: e.target.checked } },
                                props,
                                "minimalTeamLayout",
                            )
                        }
                    />
                </div>

                <div className={styleEdit}>
                    <Checkbox
                        checked={props.style.minimalBoxedLayout}
                        name="minimalBoxedLayout"
                        label="Minimal Boxed Layout"
                        onChange={(e: any) =>
                            editEvent(
                                { ...e, target: { value: e.target.checked } },
                                props,
                                "minimalBoxedLayout",
                            )
                        }
                    />
                </div>

                <div className={styleEdit}>
                    <Checkbox
                        checked={props.style.minimalDeadLayout}
                        name="minimalDeadLayout"
                        label="Minimal Dead Layout"
                        onChange={(e: any) =>
                            editEvent(
                                { ...e, target: { value: e.target.checked } },
                                props,
                                "minimalDeadLayout",
                            )
                        }
                    />
                </div>

                <div className={styleEdit}>
                    <Checkbox
                        checked={props.style.minimalChampsLayout}
                        name="minimalChampsLayout"
                        label="Minimal Champs Layout"
                        onChange={(e: any) =>
                            editEvent(
                                { ...e, target: { value: e.target.checked } },
                                props,
                                "minimalChampsLayout",
                            )
                        }
                    />
                </div>

                <div className={styleEdit}>
                    <Checkbox
                        checked={props.style.displayBadges}
                        name="displayBadges"
                        label="Display Badges"
                        onChange={(e: any) =>
                            editEvent(
                                { ...e, target: { value: e.target.checked } },
                                props,
                                "displayBadges",
                            )
                        }
                    />
                </div>

                <div className={styleEdit}>
                    <Checkbox
                        checked={props.style.displayRules}
                        name="displayRules"
                        label="Display Nuzlocke Rules"
                        onChange={(e: any) =>
                            editEvent(
                                { ...e, target: { value: e.target.checked } },
                                props,
                                "displayRules",
                            )
                        }
                    />
                </div>

                <div className={styleEdit}>
                    <Checkbox
                        checked={props.style.displayStats}
                        name="displayStats"
                        label="Display Stats"
                        onChange={(e: any) =>
                            editEvent(
                                { ...e, target: { value: e.target.checked } },
                                props,
                                "displayStats",
                            )
                        }
                    />
                </div>

                <div className={styleEdit}>
                    <Checkbox
                        checked={props.style.displayExtraData}
                        name="displayExtraData"
                        label="Display Extra Data from Save Files"
                        onChange={(e: any) =>
                            editEvent(
                                { ...e, target: { value: e.target.checked } },
                                props,
                                "displayExtraData",
                            )
                        }
                    />
                </div>

                <div className={styleEdit}>
                    <Checkbox
                        checked={props.style.usePokemonGBAFont}
                        name="usePokemonGBAFont"
                        label="Use Pokémon GBA Font"
                        onChange={(e: any) =>
                            editEvent(
                                { ...e, target: { value: e.target.checked } },
                                props,
                                "usePokemonGBAFont",
                            )
                        }
                    />
                </div>

                <div className={styleEdit}>
                    <Checkbox
                        checked={props.style.oldMetLocationFormat}
                        name="oldMetLocationFormat"
                        label="Old Met Location Format"
                        onChange={(e: any) =>
                            editEvent(
                                { ...e, target: { value: e.target.checked } },
                                props,
                                "oldMetLocationFormat",
                            )
                        }
                    />
                </div>

                <div className={styleEdit}>
                    <Checkbox
                        checked={props.style.grayScaleDeadPokemon}
                        name="grayScaleDeadPokemon"
                        label="Gray Scale Filter Dead Pokémon Images"
                        onChange={(e: any) =>
                            editEvent(
                                { ...e, target: { value: e.target.checked } },
                                props,
                                "grayScaleDeadPokemon",
                            )
                        }
                    />
                </div>

                <div className={styleEdit}>
                    <Checkbox
                        checked={props.style.spritesMode}
                        name="spritesMode"
                        label="Sprites Mode"
                        onChange={(e: any) =>
                            editEvent(
                                { ...e, target: { value: e.target.checked } },
                                props,
                                "spritesMode",
                            )
                        }
                    />
                </div>

                <div className={styleEdit}>
                    <Checkbox
                        checked={props.style.scaleSprites}
                        name="scaleSprites"
                        label="Scale Sprites"
                        onChange={(e: any) =>
                            editEvent(
                                { ...e, target: { value: e.target.checked } },
                                props,
                                "scaleSprites",
                            )
                        }
                    />
                </div>

                <div className={styleEdit}>
                    <Checkbox
                        checked={props.style.useSpritesForChampsPokemon}
                        name="useSpritesForChampsPokemon"
                        label="Use Sprites for Champs Pokémon"
                        onChange={(e: any) =>
                            editEvent(
                                { ...e, target: { value: e.target.checked } },
                                props,
                                "useSpritesForChampsPokemon",
                            )
                        }
                    />
                </div>

                <div className={styleEdit}>
                    <Checkbox
                        checked={props.style.displayGameOriginForBoxedAndDead}
                        name="displayGameOriginForBoxedAndDead"
                        label="Display Game Origin for Boxed and Dead"
                        onChange={(e: any) =>
                            editEvent(
                                { ...e, target: { value: e.target.checked } },
                                props,
                                "displayGameOriginForBoxedAndDead",
                            )
                        }
                    />
                </div>

                <div
                    className={styleEdit}
                    style={
                        {
                            marginLeft: "1rem",
                            opacity: props.style
                                .displayGameOriginForBoxedAndDead
                                ? "1"
                                : "0.3",
                            pointerEvents: props.style
                                .displayGameOriginForBoxedAndDead
                                ? undefined
                                : "none",
                        } as any
                    }
                >
                    <Checkbox
                        checked={props.style.displayBackgroundInsteadOfBadge}
                        name="displayBackgroundInsteadOfBadge"
                        label="Display Background Color Instead of Badge"
                        onChange={(e: any) =>
                            editEvent(
                                { ...e, target: { value: e.target.checked } },
                                props,
                                "displayBackgroundInsteadOfBadge",
                            )
                        }
                    />
                </div>

                <div className="custom-css-input-wrapper">
                    <label
                        className={cx(Classes.LABEL, "flex", "justify-between")}
                    >
                        <span>Custom CSS</span>
                        {feature.themeEditing && (
                            <Button
                                minimal
                                intent={Intent.PRIMARY}
                                onClick={this.toggleCSSGuide}
                            >
                                Check out the CSS Guide!
                            </Button>
                        )}
                    </label>
                    <TextAreaDebounced
                        name="customCSS"
                        props={props}
                        edit={editEvent}
                    />
                </div>

                {feature.resultv2 && (
                    <div className="custom-css-input-wrapper">
                        <label
                            style={{ padding: ".5rem", marginBottom: 0 }}
                            className={Classes.LABEL}
                        >
                            Custom Team HTML{" "}
                            {/*<a href=''>Check out Layout Guide</a>*/}
                        </label>
                        <TextAreaDebounced
                            name="customTeamHTML"
                            props={props}
                            edit={editEvent}
                        />
                    </div>
                )}
            </BaseEditor>
        );
    }
}

export const StyleEditor = connect(
    (state: Pick<State, keyof State>) => ({
        style: state.style,
        game: state.game,
    }),
    {
        editStyle,
    },
)(StyleEditorBase);
