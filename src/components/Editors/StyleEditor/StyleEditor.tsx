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
    ResultV2Theme,
    resultV2ThemeDefaults,
    TeamLayoutType,
    teamLayoutOptions,
    ThemePalette,
    themePalettes,
} from "utils";
import {
    RadioGroup,
    Radio,
    TextArea,
    Checkbox,
    Button,
    Drawer,
    DrawerSize,
    HTMLSelect,
    Input,
    Label,
} from "components/ui/shims";
import { Icon, Intent } from "components/ui";
import { State } from "state";
import { BaseEditor } from "components/Editors/BaseEditor/BaseEditor";
import { ColorInput, rgbaOrHex, ModernColorPicker } from "components/Common/ui";
import { cx } from "emotion";
import * as Styles from "./styles";
import { ThemeEditor } from "components/Editors/ThemeEditor/ThemeEditor";
import { customCSSGuide as text } from "utils/customCSSGuide";
import ReactMarkdown from "react-markdown";
import { debounce } from "utils/debounce";
import { Palette, X as XIcon, Sparkles, Settings } from "lucide-react";

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
            onChange={onChange}
            className={cx("custom-css-input", "w-full")}
            value={value}
            name={name}
        />
    );
};

interface V2ThemeColorPickerProps {
    label: string;
    themeKey: keyof ResultV2Theme;
    value: string;
    onChange: (key: keyof ResultV2Theme, value: string) => void;
}

const V2ThemeColorPicker = ({
    label,
    themeKey,
    value,
    onChange,
}: V2ThemeColorPickerProps) => (
    <div className="flex items-center gap-2 py-1">
        <Label className="inline text-xs min-w-28 text-gray-600 dark:text-gray-400">{label}</Label>
        <ModernColorPicker
            name={themeKey}
            value={value}
            onChange={(color) => onChange(themeKey, color)}
            defaultFormat="rgba"
        />
    </div>
);

interface V2ThemeEditorProps {
    theme: ResultV2Theme;
    editStyle: editStyle;
}

const v2ThemeLabels: Record<keyof ResultV2Theme, string> = {
    trainerBackgroundColor: "Trainer Background",
    trainerTextColor: "Trainer Text",
    trainerNameColor: "Trainer Name",
    trainerTitleColor: "Trainer Title",
    trainerStatLabelColor: "Trainer Stat Label",
    trainerStatValueColor: "Trainer Stat Value",
    trainerBadgeBackgroundColor: "Badge Background",
    trainerBadgeTextColor: "Badge Text",
    trainerNotesColor: "Trainer Notes",
    teamPokemonBackgroundColor: "Pokémon Background",
    teamPokemonTextColor: "Pokémon Text",
    teamPokemonTextSecondaryColor: "Pokémon Secondary Text",
    teamPokemonTextMutedColor: "Pokémon Muted Text",
    teamPokemonAccentColor: "Pokémon Accent",
    teamPokemonNatureColor: "Nature Color",
    teamPokemonAbilityColor: "Ability Color",
    teamPokemonMoveBackgroundColor: "Move Background",
    teamPokemonMoveTextColor: "Move Text",
    teamPokemonShinyColor: "Shiny Indicator",
    teamPokemonMvpBackgroundColor: "MVP Background",
    teamPokemonMvpTextColor: "MVP Text",
};

const V2ThemeEditor = ({ theme, editStyle }: V2ThemeEditorProps) => {
    const currentTheme = theme ?? resultV2ThemeDefaults;

    const handleColorChange = (key: keyof ResultV2Theme, value: string) => {
        editStyle({
            resultV2Theme: {
                ...currentTheme,
                [key]: value,
            },
        });
    };

    const handleReset = () => {
        editStyle({ resultV2Theme: resultV2ThemeDefaults });
    };

    const trainerKeys: (keyof ResultV2Theme)[] = [
        "trainerBackgroundColor",
        "trainerTextColor",
        "trainerNameColor",
        "trainerTitleColor",
        "trainerStatLabelColor",
        "trainerStatValueColor",
        "trainerBadgeBackgroundColor",
        "trainerBadgeTextColor",
        "trainerNotesColor",
    ];

    const pokemonKeys: (keyof ResultV2Theme)[] = [
        "teamPokemonBackgroundColor",
        "teamPokemonTextColor",
        "teamPokemonTextSecondaryColor",
        "teamPokemonTextMutedColor",
        "teamPokemonAccentColor",
        "teamPokemonNatureColor",
        "teamPokemonAbilityColor",
        "teamPokemonMoveBackgroundColor",
        "teamPokemonMoveTextColor",
        "teamPokemonShinyColor",
        "teamPokemonMvpBackgroundColor",
        "teamPokemonMvpTextColor",
    ];

    return (
        <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Theme Colors
                </h5>
                <Button
                    minimal
                    intent={Intent.WARNING}
                    onClick={handleReset}
                    icon="reset"
                >
                    Reset to Defaults
                </Button>
            </div>

            <div className="space-y-3">
                <h6 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Trainer Section
                </h6>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {trainerKeys.map((key) => (
                        <V2ThemeColorPicker
                            key={key}
                            label={v2ThemeLabels[key]}
                            themeKey={key}
                            value={currentTheme[key]}
                            onChange={handleColorChange}
                        />
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <h6 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Team Pokémon
                </h6>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {pokemonKeys.map((key) => (
                        <V2ThemeColorPicker
                            key={key}
                            label={v2ThemeLabels[key]}
                            themeKey={key}
                            value={currentTheme[key]}
                            onChange={handleColorChange}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

interface TeamLayoutSelectorProps {
    value: TeamLayoutType;
    onChange: (layout: TeamLayoutType) => void;
}

const TeamLayoutSelector = ({ value, onChange }: TeamLayoutSelectorProps) => {
    return (
        <div className="mt-4 space-y-3">
            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Team Layout
            </h5>
            <div className="flex flex-wrap gap-3">
                {teamLayoutOptions.map((layout) => {
                    const isSelected = value === layout.id;
                    const blocks = Array.from({ length: 6 });
                    
                    return (
                        <button
                            key={layout.id}
                            type="button"
                            onClick={() => onChange(layout.id)}
                            className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all ${
                                isSelected
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800"
                            }`}
                            title={layout.label}
                        >
                            <div
                                className="grid gap-0.5"
                                style={{
                                    gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
                                    gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
                                }}
                            >
                                {blocks.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`w-3 h-3 rounded-sm ${
                                            isSelected
                                                ? "bg-blue-500"
                                                : "bg-gray-300 dark:bg-gray-600"
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className={`text-xs font-medium ${
                                isSelected
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-gray-500 dark:text-gray-400"
                            }`}>
                                {layout.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

interface PaletteSelectorProps {
    onSelect: (palette: ThemePalette) => void;
}

const PaletteSelector = ({ onSelect }: PaletteSelectorProps) => {
    const gamePalettes = themePalettes.filter((p) => p.category === "game");
    const customPalettes = themePalettes.filter((p) => p.category === "custom");

    const PaletteButton = ({ palette }: { palette: ThemePalette }) => (
        <button
            type="button"
            onClick={() => onSelect(palette)}
            className="group flex flex-col items-center gap-1 p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
            title={palette.name}
        >
            <div className="flex gap-0.5 rounded overflow-hidden">
                <div
                    className="w-4 h-6 rounded-l-sm"
                    style={{ backgroundColor: palette.preview.primary }}
                />
                <div
                    className="w-4 h-6"
                    style={{ backgroundColor: palette.preview.secondary }}
                />
                <div
                    className="w-4 h-6 rounded-r-sm"
                    style={{ backgroundColor: palette.preview.accent }}
                />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate max-w-16 text-center leading-tight">
                {palette.name}
            </span>
        </button>
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Color Palettes
                </h5>
            </div>

            {customPalettes.length > 0 && (
                <div className="space-y-2">
                    <h6 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Presets
                    </h6>
                    <div className="flex flex-wrap gap-2">
                        {customPalettes.map((palette) => (
                            <PaletteButton key={palette.id} palette={palette} />
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <h6 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Game-Inspired
                </h6>
                <div className="flex flex-wrap gap-2">
                    {gamePalettes.map((palette) => (
                        <PaletteButton key={palette.id} palette={palette} />
                    ))}
                </div>
            </div>
        </div>
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
            <BaseEditor icon={<Palette size={16} />} name="Style">
                {feature.themeEditing ? (
                    <Drawer
                        isOpen={this.state.isThemeEditorOpen}
                        onClose={this.toggleThemeEditor}
                        size="large"
                        title="Theme Editor"
                        icon={<Palette size={18} />}
                        className={cx(Styles.dialog, {
                            "dark": props.style.editorDarkMode,
                        })}
                    >
                        <ThemeEditor />
                    </Drawer>
                ) : null}
                <Drawer
                    isOpen={this.state.isCSSGuideOpen}
                    onClose={this.toggleCSSGuide}
                    size="large"
                    title="CSS Guide"
                    icon={<Palette size={18} />}
                    className={cx(
                        Styles.dialog,
                        {
                            "dark": props.style.editorDarkMode,
                        },
                        "release-notes-wrapper",
                    )}
                >
                    <ReactMarkdown>{text}</ReactMarkdown>
                </Drawer>

                {feature.resultv2 && (
                    <BaseEditor
                        icon={<Sparkles size={14} />}
                        name="Modern Styles"
                        id="style-modern"
                        defaultOpen={true}
                    >
                        <div className="mb-3 p-2 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300">
                            These styles apply to the new Result v2 renderer.
                        </div>

                        <PaletteSelector
                            onSelect={(palette) => props.editStyle({ resultV2Theme: palette.colors })}
                        />

                        <div className={styleEdit}>
                            <Label className="inline text-xs mr-2">
                                Background color
                            </Label>
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

                        <V2ThemeEditor
                            theme={props.style.resultV2Theme}
                            editStyle={props.editStyle}
                        />

                        <TeamLayoutSelector
                            value={props.style.teamLayout ?? "2x3"}
                            onChange={(layout) => props.editStyle({ teamLayout: layout })}
                        />

                        <div className="custom-css-input-wrapper mt-4">
                            <Label className="flex justify-between">
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
                            </Label>
                            <TextAreaDebounced
                                name="customCSS"
                                props={props}
                                edit={editEvent}
                            />
                        </div>

                        <div className="custom-css-input-wrapper">
                            <Label style={{ padding: ".5rem", marginBottom: 0 }}>
                                Custom Team HTML
                            </Label>
                            <TextAreaDebounced
                                name="customTeamHTML"
                                props={props}
                                edit={editEvent}
                            />
                        </div>
                    </BaseEditor>
                )}

                <BaseEditor
                    icon={<Settings size={14} />}
                    name="Classic Styles"
                    id="style-classic"
                    defaultOpen={!feature.resultv2}
                >
                <div className={styleEdit}>
                    <Label
                        htmlFor="template"
                        className="inline text-xs mr-2"
                    >
                        Template
                    </Label>
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
                    <Label
                        htmlFor="itemStyle"
                        className="inline text-xs mr-2"
                    >
                        Item Style
                    </Label>
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
                    <Label
                        htmlFor="pokeballStyle"
                        className="inline text-xs mr-2"
                    >
                        Pokéball Style
                    </Label>
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
                        <Label
                            htmlFor="resultWidth"
                            className="inline text-xs mr-2"
                        >
                            Result Dimensions
                        </Label>
                        <span style={{ fontSize: "80%", marginRight: "2px" }}>
                            w
                        </span>
                        <Input
                            name="resultWidth"
                            className={cx("small-input")}
                            onChange={(e) => editEvent(e, props)}
                            value={props.style.resultWidth}
                            type="number"
                            min={0}
                            step={10}
                        />
                        <Icon icon={<XIcon size={14} />} style={{ marginRight: "0" }} />
                        <span style={{ fontSize: "80%", marginRight: "2px" }}>
                            h
                        </span>
                        <Input
                            name="resultHeight"
                            className={cx("small-input")}
                            style={{
                                opacity: props.style.useAutoHeight ? 0.3 : 1,
                            }}
                            onChange={(e) => editEvent(e, props)}
                            value={props.style.resultHeight}
                            type="number"
                            min={0}
                            step={10}
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
                        <Label
                            htmlFor="trainerWidth"
                            className="inline text-xs mr-2"
                        >
                            Trainer Dimensions
                        </Label>
                        <span style={{ fontSize: "80%", marginRight: "2px" }}>
                            w
                        </span>
                        <Input
                            name="trainerWidth"
                            className={cx("small-input")}
                            onChange={(e) => editEvent(e, props)}
                            style={{
                                opacity: props.style.trainerAuto ? 0.3 : 1,
                            }}
                            value={props.style.trainerWidth}
                        />
                        <Icon icon={<XIcon size={14} />} style={{ marginRight: "0" }} />
                        <span style={{ fontSize: "80%", marginRight: "2px" }}>
                            h
                        </span>
                        <Input
                            name="trainerHeight"
                            className={cx("small-input")}
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
                    <Label className="inline text-xs mr-2">
                        Background color
                    </Label>
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
                    <Label className="inline text-xs mr-2">
                        Accent color
                    </Label>
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
                    <Label className="inline text-xs mr-2">
                        Header color
                    </Label>
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
                    <Label className="inline text-xs mr-2">
                        Background Image
                    </Label>
                    <Input
                        value={props.style.backgroundImage}
                        name="backgroundImage"
                        onChange={(e) => editEvent(e, props)}
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
                    <Label className="inline text-xs mr-2">
                        Rules Location
                    </Label>
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
                    <Label
                        htmlFor="teamImages"
                        className="inline text-xs mr-2"
                    >
                        Team Images
                    </Label>
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
                            className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded p-2"
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
                            className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded p-2"
                            style={calloutStyle}
                        >
                            Dream world images are not supported for this game
                        </div>
                    ) : null}
                    {["Sword", "Shield"].includes(props.game.name) &&
                    props.style.teamImages === "tcg" ? (
                        <div
                            className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded p-2"
                            style={calloutStyle}
                        >
                            TCG images are not fully supported for this game
                        </div>
                    ) : null}
                </div>

                <div className={styleEdit}>
                    <Label
                        htmlFor="boxedPokemonPerLine"
                        className="inline text-xs mr-2"
                    >
                        Pokemon Per Line (Boxed)
                    </Label>
                    <Input
                        name="boxedPokemonPerLine"
                        className="small-input"
                        onChange={(e) => editEvent(e, props)}
                        value={props.style.boxedPokemonPerLine}
                        type="number"
                        min={1}
                        step={1}
                        max={20}
                    />
                </div>

                <div className={styleEdit}>
                    <Label
                        htmlFor="linkedPokemonText"
                        className="inline text-xs mr-2"
                    >
                        Linked Pokemon Text
                    </Label>
                    <Input
                        name="linkedPokemonText"
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

                {!feature.resultv2 && (
                    <div className="custom-css-input-wrapper">
                        <Label
                            className="flex justify-between"
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
                        </Label>
                        <TextAreaDebounced
                            name="customCSS"
                            props={props}
                            edit={editEvent}
                        />
                    </div>
                )}
                </BaseEditor>
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
