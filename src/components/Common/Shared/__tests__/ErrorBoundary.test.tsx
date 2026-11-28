import * as React from "react";
import { ErrorBoundary } from "..";
import { screen, render } from "utils/testUtils";
class ErroneousComponent extends React.Component {
    public render() {
        throw new Error("Failure");
        return <div />;
    }
}

describe("<ErroBoundary />", () => {
    it("renders its children", () => {
        render(
            <ErrorBoundary>
                <div data-testid="test">Test</div>
            </ErrorBoundary>,
        );
        expect(screen.getByTestId("test").textContent).toContain("Test");
    });

    it("catches errors and renders errorMessage", () => {
        render(
            <ErrorBoundary errorMessage={<div data-testid="error">Error!</div>}>
                <ErroneousComponent />
            </ErrorBoundary>,
        );
        expect(screen.getByTestId("error").textContent).toBe("Error!");
    });
});
