import * as React from "react";
import { connect } from "react-redux";

import { State } from "state";
import { addPokemon, addBox } from "actions";
import { feature, isLocal, choose, generateEmptyPokemon } from "utils";
import { ErrorBoundary } from "components";
import { Button } from "@blueprintjs/core";
import { appSelector } from "selectors";
import { Skeleton } from "components";
import { listOfPokemon, Species } from "utils/data/listOfPokemon";
import { matchSpeciesToTypes } from "utils/formatters/matchSpeciesToTypes";
import { DebugDialog } from "./DebugDialog";

import "./app.css";

export interface AppProps {
    style: State["style"];
    view: State["view"];
    pokemon: State["pokemon"];
    addPokemon: typeof addPokemon;
    addBox: typeof addBox;
}

const Editor = React.lazy(() =>
    import("components/Editors/Editor").then((res) => ({
        default: res.Editor,
    })),
);

const Result = React.lazy(() =>
    import("components/Features/Result/Result").then((res) => ({
        default: res.Result,
    })),
);

const Result2 = React.lazy(() =>
    import("components/Features/Result/Result2").then((res) => ({
        default: res.Result,
    })),
);

const ImagesDrawer = React.lazy(() =>
    import("components/Common/Shared/ImagesDrawer").then((res) => ({
        default: res.ImagesDrawer,
    })),
);

const BugReporter = React.lazy(() =>
    import("components/Features/BugReporter").then((res) => ({
        default: res.BugReporter,
    })),
);

const Hotkeys = React.lazy(() =>
    import("components/Features/Hotkeys").then((res) => ({
        default: res.Hotkeys,
    })),
);

export class AppBase extends React.Component<AppProps, { result2?: boolean }> {
    public constructor(props: AppProps) {
        super(props);
        this.state = { result2: false };
    }

    private addRandomPokemon = () => {
        const species = choose([...listOfPokemon]) as Species;
        const types = matchSpeciesToTypes(species);
        const pokemon = generateEmptyPokemon(this.props.pokemon, {
            species,
            status: "Team",
            types,
        });
        this.props.addPokemon(pokemon);
    };

    private createRandomBox = (count: number) => {
        const boxName = `Random Box ${Date.now()}`;
        this.props.addBox({
            name: boxName,
            background: "",
            inheritFrom: "Boxed",
        });

        for (let i = 0; i < count; i++) {
            const species = choose([...listOfPokemon]) as Species;
            const types = matchSpeciesToTypes(species);
            const pokemon = generateEmptyPokemon(this.props.pokemon, {
                species,
                status: boxName,
                types,
            });
            this.props.addPokemon(pokemon);
        }
    };

    private updateDarkModeClass = () => {
        const isDarkMode = this.props.style.editorDarkMode;
        if (isDarkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    public componentDidMount() {
        this.updateDarkModeClass();

        if (feature.resultv2) {
            // TOP SECRET
            if (this.props.style.customCSS.includes("resultv2")) {
                this.setState({ result2: true });
            } else {
                this.setState({ result2: false });
            }
        }
    }

    public componentDidUpdate(prevProps: AppProps) {
        if (prevProps.style.editorDarkMode !== this.props.style.editorDarkMode) {
            this.updateDarkModeClass();
        }
    }

    public render() {
        const { style, view } = this.props;
        const { result2 } = this.state;
        const isDarkMode = style.editorDarkMode;
        const showDebugPanel = isLocal();
        console.log("features", feature);

        return (
            <ErrorBoundary
                errorMessage={
                    <div className="p-6 center-text">
                        <h2>
                            There was a problem retrieving your nuzlocke data.
                        </h2>
                        <p>Please consider submitting a bug report.</p>

                        <React.Suspense fallback={"Loading Bug Reporter..."}>
                            <BugReporter defaultOpen />
                        </React.Suspense>
                    </div>
                }
            >
                <div
                    data-testid="app"
                    className="app"
                    role="main"
                    style={{
                        background: this.props.style.editorDarkMode
                            ? "#111"
                            : "#fff",
                    }}
                >
                    <ErrorBoundary key={1}>
                        <React.Suspense fallback={Skeleton}>
                            <Hotkeys />
                        </React.Suspense>
                    </ErrorBoundary>
                    <ErrorBoundary key={2}>
                        <React.Suspense fallback={Skeleton}>
                            <Editor />
                        </React.Suspense>
                    </ErrorBoundary>
                    {result2 ? (
                        <ErrorBoundary key={3}>
                            <React.Suspense fallback={Skeleton}>
                                <Result2 />
                            </React.Suspense>
                        </ErrorBoundary>
                    ) : (
                        <ErrorBoundary key={3}>
                            <React.Suspense fallback={Skeleton}>
                                <Result />
                            </React.Suspense>
                        </ErrorBoundary>
                    )}

                    {showDebugPanel && feature.resultv2 && (
                        <Button
                            style={{
                                position: "absolute",
                                top: "0.5rem",
                                right: "0.5rem",
                                zIndex: 1000,
                            }}
                            onClick={(e) =>
                                this.setState({ result2: !result2 })
                            }
                        >
                            Use Result v2
                        </Button>
                    )}

                    {showDebugPanel && (
                        <DebugDialog
                            onAddRandomPokemon={this.addRandomPokemon}
                        />
                    )}

                    <ErrorBoundary key={4}>
                        <React.Suspense fallback={Skeleton}>
                            <ImagesDrawer />
                        </React.Suspense>
                    </ErrorBoundary>
                </div>
            </ErrorBoundary>
        );
    }
}

export const App = connect(appSelector, { addPokemon })(AppBase);
