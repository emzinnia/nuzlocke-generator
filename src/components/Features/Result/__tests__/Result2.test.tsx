import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { ResultView } from "../ResultView";
import { isMobile } from "is-mobile";

const toImageMock = vi.fn();
const setZoomLevelMock = vi.fn();
let editorState = {
    downloadRequested: 0,
    zoomLevel: 1,
    showResultInMobile: false,
};

const useSelectorMock = vi.fn((selector: any) => selector({ editor: editorState }));
const isMobileMock = isMobile as unknown as vi.Mock;

vi.mock("react-redux", () => ({
    useSelector: (selector: any) => useSelectorMock(selector),
}));

vi.mock("is-mobile", () => ({
    isMobile: vi.fn(() => false),
}));

vi.mock("../Result", () => {
    const MockResult = React.forwardRef(function MockResult(_, ref) {
        React.useImperativeHandle(ref, () => ({
            toImage: toImageMock,
            setZoomLevel: setZoomLevelMock,
        }));
        return <div data-testid="result-component" />;
    });
    return { Result: MockResult, ResultBase: MockResult };
});

vi.mock("components/Editors/PokemonEditor", () => ({
    TypeMatchupDialog: () => <div data-testid="type-matchup-dialog" />,
}));

describe("<ResultView />", () => {
    beforeEach(() => {
        editorState = {
            downloadRequested: 0,
            zoomLevel: 1,
            showResultInMobile: false,
        };
        toImageMock.mockClear();
        setZoomLevelMock.mockClear();
        useSelectorMock.mockImplementation((selector: any) =>
            selector({ editor: editorState }),
        );
        isMobileMock.mockReturnValue(false);
    });

    it("renders Result and TypeMatchupDialog on desktop", () => {
        render(<ResultView />);

        expect(screen.getByTestId("result-component")).toBeDefined();
        expect(screen.getAllByTestId("type-matchup-dialog").length).toBeGreaterThan(0);
    });

    it("triggers download when downloadRequested increments", async () => {
        const { rerender } = render(<ResultView />);
        expect(toImageMock).not.toHaveBeenCalled();

        editorState = { ...editorState, downloadRequested: 1 };
        rerender(<ResultView />);

        await waitFor(() => expect(toImageMock).toHaveBeenCalledTimes(1));
    });

    it("applies zoom changes to the Result ref", async () => {
        const { rerender } = render(<ResultView />);
        expect(setZoomLevelMock).toHaveBeenCalledWith(1);

        editorState = { ...editorState, zoomLevel: 2 };
        rerender(<ResultView />);

        await waitFor(() => expect(setZoomLevelMock).toHaveBeenLastCalledWith(2));
    });

    it("renders mobile fallback when on a mobile device", () => {
        isMobileMock.mockReturnValue(true);

        render(<ResultView />);

        expect(screen.getByTestId("type-matchup-dialog")).toBeDefined();
        expect(screen.queryByTestId("result-component")).toBeNull();
    });
});

