/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-function-type */
import * as React from "react";
import { BaseEditor } from "components/Editors/BaseEditor/BaseEditor";
import {
    Button,
    TextArea,
    Checkbox,
    Spinner,
    Intent,
} from "components/ui";
import { connect } from "react-redux";
import { css } from "emotion";
import { showToast } from "components/Common/Shared/appToaster";

export interface BugReporterProps {
    reportingUrl?: string;
    state: any;
    defaultOpen?: boolean;
}

export interface BugReporterState {
    userReport: string;
    userReportTitle: string;
    includeNuzlocke: boolean;
    stage: number;
    isSending: boolean;
}

const spinner = css`
    display: inline-block;
`;

export class BugReporterBase extends React.Component<
    BugReporterProps,
    BugReporterState
> {
    public state = {
        userReport: "",
        userReportTitle: "",
        includeNuzlocke: true,
        stage: 1,
        isSending: false,
    };

    public render() {
        const {
            userReport,
            userReportTitle,
            includeNuzlocke,
            stage,
            isSending,
        } = this.state;
        const { defaultOpen } = this.props;

        return (
            <BaseEditor
                icon="error"
                name="Bug Reports and Feature Requests"
                defaultOpen={defaultOpen}
            >
                <div style={{ margin: ".5rem" }}>
                    <input
                        style={{
                            width: "100%",
                            marginBottom: "0.25rem",
                        }}
                        className="rounded border border-border bg-input px-3 py-2 outline-none"
                        required
                        type="text"
                        placeholder="Issue Title"
                        value={userReportTitle}
                        onChange={this.updateReport("userReportTitle")}
                    />
                    <TextArea
                        placeholder="Description (Optional). If relevant, please include info such as steps to reproduce, browser, and OS."
                        style={{ width: "100%" }}
                        value={userReport}
                        onChange={this.updateReport("userReport")}
                        fill
                    />
                    <div
                        style={{
                            padding: ".5rem",
                            display: "flex",
                            alignItems: "baseline",
                            justifyContent: "space-between",
                        }}
                    >
                        <Checkbox
                            onChange={(checked) =>
                                this.setState({ includeNuzlocke: checked })
                            }
                            checked={includeNuzlocke}
                            label="include nuzlocke.json file"
                        />
                        <Button
                            disabled={!userReportTitle || isSending}
                            onClick={this.sendBugReport}
                            minimal
                            intent={Intent.DANGER}
                        >
                            Submit{" "}
                            {isSending ? (
                                <Spinner className={spinner} size={20} />
                            ) : (
                                <img
                                    style={{
                                        height: "20px",
                                        verticalAlign: "bottom",
                                        display: "inline",
                                    }}
                                    alt=""
                                    role="presentation"
                                    src={`./icons/pokemon/regular/${this.getButtonPokemon(stage)}.png`}
                                />
                            )}
                        </Button>
                    </div>
                </div>
            </BaseEditor>
        );
    }

    private getButtonPokemon = (stage: number) =>
        stage === 1 ? "caterpie" : stage === 2 ? "metapod" : "butterfree";

    private updateReport =
        (target: string) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const text = e.target.value;
            const update: Pick<
                BugReporterState,
                "userReport" | "userReportTitle"
            > = {
                [target]: text,
            } as unknown as any;
            this.setState(update);
        };

    private sendBugReport = () => {
        const { userReport, userReportTitle } = this.state;
        const { state } = this.props;
        const url = `${window.location.origin}/report`;

        this.setState({ isSending: true });

        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            mode: "cors",
            body: JSON.stringify({
                report: userReport,
                title: userReportTitle,
                data: this.state.includeNuzlocke
                    ? JSON.stringify(state)
                    : undefined,
            }),
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.status === 200 || res.status === 201) {
                    showToast({
                        message: "Bug report sent!",
                        intent: Intent.SUCCESS,
                    });
                    this.setState({
                        userReport: "",
                        userReportTitle: "",
                        stage: this.state.stage + 1,
                        isSending: false,
                    });
                } else {
                    showToast({
                        message: "Bug report failed. Please try again.",
                        intent: Intent.DANGER,
                    });
                    this.setState({ isSending: false });
                }
            })
            .catch((err) => {
                showToast({
                    message: `Bug report failed. Please try again. ${err}`,
                    intent: Intent.DANGER,
                });
                this.setState({ isSending: false });
            });
    };
}

export const BugReporter = connect((state) => ({ state }))(BugReporterBase);
