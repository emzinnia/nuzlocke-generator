import * as React from "react";
import { Button, Classes, Spinner, Intent } from "@blueprintjs/core";
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
import { ErrorBoundary, ReleaseDialog } from "components/Common/Shared";
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
                            className={Classes.MINIMAL}
                            icon={"menu"}
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
                            className={cx(
                                Classes.MINIMAL,
                                styles.close_result_button,
                            )}
                            icon={showResultInMobile ? "cross" : "eye-open"}
                        >
                            {showResultInMobile ? "Close" : "View Result"}
                        </Button>
                    </>
                )}

                {shouldShow && (
                    <>
                        <Button
                            style={darkModeStyle(
                                this.props.style.editorDarkMode,
                            )}
                            onClick={() =>
                                this.props.changeEditorSize(
                                    !this.props.editor.minimized,
                                )
                            }
                            className={Classes.MINIMAL}
                            icon={
                                this.props.editor.minimized
                                    ? "minimize"
                                    : "maximize"
                            }
                        >
                            {this.props.editor.minimized
                                ? "Maximize"
                                : "Minimize"}{" "}
                            Editor
                        </Button>
                        {isDownloading ? (
                            <Button
                                className={Classes.MINIMAL}
                                style={{
                                    ...darkModeStyle(
                                        this.props.style.editorDarkMode,
                                    ),
                                    height: "30px",
                                }}
                            >
                                <Spinner className={"inline-flex"} size={20} />{" "}
                                Downloading
                            </Button>
                        ) : (
                            <Button
                                style={darkModeStyle(
                                    this.props.style.editorDarkMode,
                                )}
                                onClick={this.props.onClickDownload}
                                className={Classes.MINIMAL}
                                icon="download"
                            >
                                Download Image
                            </Button>
                        )}
                        <Button
                            style={darkModeStyle(
                                this.props.style.editorDarkMode,
                            )}
                            onClick={() => {
                                this.props.editStyle({
                                    editorDarkMode:
                                        !this.props.style.editorDarkMode,
                                });
                            }}
                            className={Classes.MINIMAL}
                            icon={
                                this.props.style.editorDarkMode
                                    ? "flash"
                                    : "moon"
                            }
                        >
                            {this.props.style.editorDarkMode ? "Light" : "Dark"}{" "}
                            Mode
                        </Button>
                        {this.props.children}
                        <Button
                            style={darkModeStyle(
                                this.props.style.editorDarkMode,
                            )}
                            onClick={this.toggleDialog}
                            className={Classes.MINIMAL}
                            icon="star"
                        >
                            {version}
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
