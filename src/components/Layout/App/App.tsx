import * as React from "react";
import { connect } from "react-redux";

import { State } from "state";
import { addPokemon, addBox } from "actions";
import {
    feature,
    isLocal,
    choose,
    generateEmptyPokemon,
    matchSpeciesToTypes,
} from "utils";
import { ErrorBoundary } from "components";
import { appSelector } from "selectors";
import { Skeleton } from "components";
import {
    listOfPokemon,
    Species,
} from "utils/data";
import {
    DebugDialog,
    buildRandomPokemonAttributes,
} from "components/Layout/DebugDialog";

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

const ResultView = React.lazy(() =>
    import("components/Features/Result/ResultView").then((res) => ({
        default: res.ResultView,
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

const Header = React.lazy(() =>
    import("components/Layout/Header").then((res) => ({
        default: res.Header,
    })),
);

export class AppBase extends React.Component<AppProps> {
    public constructor(props: AppProps) {
        super(props);
    }

    private addRandomPokemon = () => {
        const pokemon = generateEmptyPokemon(
            this.props.pokemon,
            buildRandomPokemonAttributes(this.props.pokemon),
        );
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
    }

    public componentDidUpdate(prevProps: AppProps) {
        if (prevProps.style.editorDarkMode !== this.props.style.editorDarkMode) {
            this.updateDarkModeClass();
        }
    }

    public render() {
        const { style, view } = this.props;
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
                    className="app flex flex-col h-screen"
                    role="main"
                    style={{
                        background: this.props.style.editorDarkMode
                            ? "#111"
                            : "#fff",
                    }}
                >
                    <ErrorBoundary key={0}>
                        <React.Suspense fallback={Skeleton}>
                            <Header />
                        </React.Suspense>
                    </ErrorBoundary>

                    <div className="flex flex-1 min-h-0 overflow-hidden">
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
                        <ErrorBoundary key={3}>
                            <React.Suspense fallback={Skeleton}>
                                <ResultView />
                            </React.Suspense>
                        </ErrorBoundary>
                    </div>

                    {showDebugPanel && (
                        <DebugDialog
                            onAddRandomPokemon={this.addRandomPokemon}
                            onCreateRandomBox={this.createRandomBox}
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

export const App = connect(appSelector, { addPokemon, addBox })(AppBase);
