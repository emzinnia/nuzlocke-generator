/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-function-type */
import * as React from "react";
import { Dialog, Button, Icon, Intent } from "components/ui";
import { useSelector } from "react-redux";
import { State } from "state";
import { css, cx } from "emotion";

import credits from "./credits.json";

const creditsContainer = css`
    max-height: 30rem;
    margin: 0.25rem;
    padding: 0.5rem;
    display: flex;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 0.25rem;
    margin: 1rem;
    overflow-y: auto;
`;

const creditsItem = css`
    height: 100%;
`;

const creditsContainerDark = css`
    background: rgba(0, 0, 0, 0.33);
    border: 1px solid #111;
    color: white;
`;

const sortByRole = (a, b) => {
    if (a.role > b.role) return 1;
    if (a.role < b.role) return -1;
    return 0;
};

export interface CreditsData {
    dev: { name: string; link?: string; role?: string }[];
    art: { name: string; link?: string; role?: string }[];
}

export interface CreditsProps {}

export function Credits() {
    const [creditsModal, setCreditsModal] = React.useState(false);
    const style = useSelector<State, State["style"]>((state) => state.style);

    return (
        <>
            <Dialog
                isOpen={creditsModal}
                onClose={() => setCreditsModal(false)}
                icon={<Icon icon="edit" />}
                className={style.editorDarkMode ? "dark" : ""}
                title="Credits"
            >
                <div
                    className={cx(
                        "has-nice-scrollbars",
                        creditsContainer,
                        style.editorDarkMode ? creditsContainerDark : "",
                    )}
                >
                    <div
                        className={creditsItem}
                        style={{ width: "50%", padding: "1rem" }}
                    >
                        <strong>Development/Design</strong>
                        {(credits as CreditsData).dev.map((creditItem) => {
                            return (
                                <div key={creditItem.name}>
                                    {creditItem.role}:{" "}
                                    <a href={creditItem.link}>
                                        {creditItem.name}
                                    </a>
                                </div>
                            );
                        })}
                    </div>
                    <div
                        className={creditsItem}
                        style={{
                            padding: "1rem",
                            borderLeft: "1px solid rgba(0, 0, 0, 0.33)",
                        }}
                    >
                        <strong>Art</strong>
                        {(credits as CreditsData).art
                            .sort(sortByRole)
                            .map((creditItem) => {
                                return (
                                    <div key={creditItem.name}>
                                        {creditItem.role}:{" "}
                                        <a href={creditItem.link}>
                                            {creditItem.name}
                                        </a>
                                    </div>
                                );
                            })}
                    </div>
                </div>
                <div style={{ padding: "0.5rem" }}>
                    This app claims no ownership of the Pokémon brand or rights
                    to any images except those of the app itself. All rights
                    belong to their respective parties, including The Pokémon
                    Company International and Nintendo.
                    <br />
                    If you would like your content to be not be included in the
                    nuzlocke-generator or attribution to you is missing, please
                    file a notice{" "}
                    <a href="https://github.com/EmmaRamirez/nuzlocke-generator/issues">
                        here
                    </a>
                    .
                    <br />
                    nuzlocke-generator is licensed under MIT.
                </div>
            </Dialog>
            <Button
                style={{ margin: "0.5rem auto", display: "block" }}
                intent={Intent.PRIMARY}
                minimal
                onClick={() => setCreditsModal(true)}
            >
                Credits
            </Button>
        </>
    );
}
