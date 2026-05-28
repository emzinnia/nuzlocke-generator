import * as React from "react";
import { render, screen } from "@testing-library/react";

import { TopBarBase, TopBarProps } from "../TopBar";
import { styleDefaults } from "utils";

vi.mock("is-mobile", () => ({
    isMobile: () => true,
}));

const createProps = (
    editor: TopBarProps["editor"],
): Omit<TopBarProps, "onClickDownload"> => ({
    editor,
    style: styleDefaults,
    sawRelease: {},
    changeEditorSize: vi.fn() as TopBarProps["changeEditorSize"],
    editStyle: vi.fn() as TopBarProps["editStyle"],
    seeRelease: vi.fn() as TopBarProps["seeRelease"],
    toggleTemtemMode: vi.fn() as TopBarProps["toggleTemtemMode"],
    toggleMobileResultView:
        vi.fn() as TopBarProps["toggleMobileResultView"],
    pokemon: [],
});

describe("<TopBarBase />", () => {
    it("hides the mobile app menu while the result overlay is open", () => {
        render(
            <TopBarBase
                {...createProps({
                    minimized: false,
                    showResultInMobile: true,
                })}
                onClickDownload={vi.fn()}
            />,
        );

        expect(screen.queryByText("Nuzlocke Generator")).toBeNull();
        expect(screen.getByText("Close")).toBeTruthy();
    });
});
