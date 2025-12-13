import * as React from "react";
import { Button, Spinner } from "components/Common/ui";
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
}

export interface TopBarState {
    isOpen: boolean;
    isMenuOpen: boolean;
}

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
        const darkMode = this.props.style.editorDarkMode;

        return (
            <div
                className={cx(
                    classWithDarkTheme(
                        styles,
                        "topBar",
                        darkMode,
                    ),
                    isMobile() && styles.topBar_mobile,
                    isMobile() && isMenuOpen && styles.topBar_mobile_open,
                )}
            >
                {isMobile() && (
                    <>
                        <Button
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
                            Editor
                        </Button>
                        {isDownloading ? (
                            <Button
                                minimal
                                style={{
                                    height: "30px",
                                }}
                            >
                                <Spinner size="small" className="inline-flex" />{" "}
                                Downloading
                            </Button>
                        ) : (
                            <Button
                                onClick={this.props.onClickDownload}
                                minimal
                                icon="download"
                            >
                                Download Image
                            </Button>
                        )}
                        <Button
                            onClick={() => {
                                this.props.editStyle({
                                    editorDarkMode: !darkMode,
                                });
                            }}
                            minimal
                            icon={darkMode ? "flash" : "moon"}
                        >
                            {darkMode ? "Light" : "Dark"} Mode
                        </Button>
                        {this.props.children}
                        <Button
                            onClick={this.toggleDialog}
                            minimal
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
