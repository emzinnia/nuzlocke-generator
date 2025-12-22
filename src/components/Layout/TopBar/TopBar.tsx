/**
 * @deprecated TopBar functionality has been moved to EditorToolbar in the Editor panel.
 * This component is kept for backwards compatibility but will be removed in a future version.
 * Use EditorToolbar from "components/Editors/Editor/EditorToolbar" instead.
 */
import * as React from "react";
import { Button, Spinner, Intent } from "components/ui";
import { connect } from "react-redux";
import * as styles from "components/Features/Result/styles";
import { classWithDarkTheme, getPatchlessVersion, Styles } from "utils";
import {
    changeEditorSize,
    editStyle,
    seeRelease,
    toggleTemtemMode,
    toggleMobileResultView,
} from "actions";
import { version } from "package";
import { cx } from "emotion";
import { Pokemon, Editor } from "models";
import { ErrorBoundary, HotkeyIndicator, ReleaseDialog } from "components/Common/Shared";
import { State } from "state";
import { isMobile } from "is-mobile";

export interface TopBarProps {
    onClickDownload: (e?: React.MouseEvent<HTMLElement>) => void;

    editor: Editor;
    style: Styles;
    sawRelease: { [x: string]: boolean };

    changeEditorSize: changeEditorSize;
    editStyle: editStyle;
    seeRelease: seeRelease;
    toggleTemtemMode: toggleTemtemMode;
    toggleMobileResultView: toggleMobileResultView;

    pokemon: Pokemon[];

    isDownloading?: boolean;
    children?: React.ReactNode;
}

export interface TopBarState {
    isOpen: boolean;
    isMenuOpen: boolean;
}

const darkModeStyle = (mode: boolean) => (mode ? { color: "#fff" } : {});

export class TopBarBase extends React.Component<TopBarProps, TopBarState> {
    public state = {
        isOpen: !this.props.sawRelease?.[getPatchlessVersion(version) ?? 0],
        isMenuOpen: false,
    };

    public UNSAFE_componentWillMount() {
        if (version.split(".")[2] !== "0") {
            this.props.seeRelease(getPatchlessVersion(version));
        }
    }

    private closeDialog = (e) => {
        this.props.seeRelease(getPatchlessVersion(version));
        this.toggleDialog();
    };

    private toggleDialog = () => this.setState({ isOpen: !this.state.isOpen });

    public render() {
        const {
            isDownloading,
            editor: { showResultInMobile },
        } = this.props;
        const { isMenuOpen } = this.state;

        const shouldShow = isMobile() ? isMenuOpen : true;

        return (
            <div
                className={cx(
                    classWithDarkTheme(
                        styles,
                        "topBar",
                        this.props.style.editorDarkMode,
                    ),
                    isMobile() && styles.topBar_mobile,
                    isMobile() && isMenuOpen && styles.topBar_mobile_open,
                )}
            >
                {isMobile() && (
                    <>
                        <Button
                            style={darkModeStyle(
                                this.props.style.editorDarkMode,
                            )}
                            onClick={() =>
                                this.setState((state) => ({
                                    isMenuOpen: !state.isMenuOpen,
                                }))
                            }
                            minimal
                            icon="menu"
                        >
                            Nuzlocke Generator
                        </Button>
                        <Button
                            style={{
                                ...darkModeStyle(
                                    this.props.style.editorDarkMode,
                                ),
                                zIndex: 22,
                                position: "relative",
                            }}
                            onClick={() => this.props.toggleMobileResultView()}
                            minimal
                            className={styles.close_result_button}
                            icon={showResultInMobile ? "cross" : "eye-open"}
                        >
                            {showResultInMobile ? "Close" : "View Result"}
                        </Button>
                    </>
                )}

                {shouldShow && (
                    <>
                        <Button
                            data-testid="toggle-editor-size-button"
                            style={darkModeStyle(
                                this.props.style.editorDarkMode,
                            )}
                            onClick={() =>
                                this.props.changeEditorSize(
                                    !this.props.editor.minimized,
                                )
                            }
                            minimal
                            icon={
                                this.props.editor.minimized
                                    ? "minimize"
                                    : "maximize"
                            }
                        >
                            {this.props.editor.minimized
                                ? "Maximize"
                                : "Minimize"}{" "}
                            Editor{" "}
                            <HotkeyIndicator
                                hotkey="shift+m"
                                showModifier={false}
                                style={{ marginLeft: "0.35rem" }}
                            />
                        </Button>
                        {isDownloading ? (
                            <Button
                                minimal
                                style={{
                                    ...darkModeStyle(
                                        this.props.style.editorDarkMode,
                                    ),
                                    height: "30px",
                                }}
                            >
                                <Spinner className="inline-flex" size={20} />{" "}
                                Downloading
                            </Button>
                        ) : (
                            <Button
                                data-testid="download-image-button"
                                style={darkModeStyle(
                                    this.props.style.editorDarkMode,
                                )}
                                onClick={this.props.onClickDownload}
                                minimal
                                icon="download"
                            >
                                Download Image{" "}
                                <HotkeyIndicator
                                    hotkey="shift+d"
                                    showModifier={false}
                                    style={{ marginLeft: "0.35rem" }}
                                />
                            </Button>
                        )}
                        <Button
                            data-testid="toggle-dark-mode-button"
                            style={darkModeStyle(
                                this.props.style.editorDarkMode,
                            )}
                            onClick={() => {
                                this.props.editStyle({
                                    editorDarkMode:
                                        !this.props.style.editorDarkMode,
                                });
                            }}
                            minimal
                            icon={
                                this.props.style.editorDarkMode
                                    ? "flash"
                                    : "moon"
                            }
                        >
                            {this.props.style.editorDarkMode ? "Light" : "Dark"}{" "}
                            Mode{" "}
                            <HotkeyIndicator
                                hotkey="shift+l"
                                showModifier={false}
                                style={{ marginLeft: "0.35rem" }}
                            />
                        </Button>
                        {this.props.children}
                        <Button
                            data-testid="release-dialog-button"
                            style={darkModeStyle(
                                this.props.style.editorDarkMode,
                            )}
                            onClick={this.toggleDialog}
                            minimal
                            icon="star"
                        >
                            {version}{" "}
                            <HotkeyIndicator
                                hotkey="shift+v"
                                showModifier={false}
                                style={{ marginLeft: "0.35rem" }}
                            />
                        </Button>
                    </>
                )}
                <ErrorBoundary>
                    <ReleaseDialog
                        style={this.props.style}
                        isOpen={this.state.isOpen}
                        onClose={this.closeDialog}
                    />
                </ErrorBoundary>
            </div>
        );
    }
}

export const TopBar = connect(
    (state: Pick<State, keyof State>) => ({
        editor: state.editor,
        style: state.style,
        sawRelease: state.sawRelease,
        pokemon: state.pokemon,
    }),
    {
        changeEditorSize,
        editStyle,
        seeRelease,
        toggleTemtemMode,
        toggleMobileResultView,
    },
)(TopBarBase);
