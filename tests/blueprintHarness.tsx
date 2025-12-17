import * as React from "react";
import { render, RenderOptions, act } from "@testing-library/react";

type RenderResult = ReturnType<typeof render> & {
    portal: () => Element | null;
    cleanup: () => void;
};

/**
 * Renders a component with a dedicated container and provides helpers for Blueprint portals.
 */
export const renderWithPortal = (
    ui: React.ReactElement,
    options?: Omit<RenderOptions, "queries">,
): RenderResult => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const rtlResult = render(ui, { container, ...options });

    const cleanup = () => {
        rtlResult.unmount();
        container.remove();
    };

    const portal = () => document.body.querySelector(".bp5-portal");

    return Object.assign(rtlResult, { portal, cleanup });
};

export const flushPromises = async () => {
    await act(async () => {
        await Promise.resolve();
    });
};

