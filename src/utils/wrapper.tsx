import * as React from "react";
import { Provider } from "store/reactZustand";
import { store } from "store";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export const Wrapper = ({ children }: { children?: React.ReactNode }) => (
    <Provider store={store}>
        <DndProvider backend={HTML5Backend}>{children}</DndProvider>
    </Provider>
);
