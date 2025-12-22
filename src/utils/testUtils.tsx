import * as React from "react";
import { render } from "@testing-library/react";
import { Wrapper as wrapper } from "./wrapper";

const customRender = (
    ui: Parameters<typeof render>[0],
    options?: Parameters<typeof render>[1],
) => render(ui, { wrapper: wrapper as any, ...options });

// re-export everything
export * from "@testing-library/react";

// override render method
export { customRender as render };
