import * as React from "react";
import { style } from "reducers/style";

export enum LayoutDisplay {
    Block = "flex",
    Inline = "inline-flex",
}

export enum LayoutDirection {
    Column = "column",
    Row = "row",
    ColumnReverse = "column-reverse",
    RowReverse = "row-reverse",
}

export enum LayoutSpacing {
    End = "flex-end",
    Start = "flex-start",
    Center = "center",
    SpaceBetween = "space-between",
    SpaceEvenly = "space-evenly",
    SpaceAround = "space-around",
}

export enum LayoutAlignment {
    End = "flex-end",
    Start = "flex-start",
    Center = "center",
    SpaceBetween = "space-between",
    SpaceAround = "space-around",
    SpaceEvenly = "space-evenly",
}

export enum LayoutWrap {
    Wrap = "wrap",
    NoWrap = "no-wrap",
}

export interface LayoutProps {
    display: LayoutDisplay;
    direction: LayoutDirection;
    alignment: LayoutAlignment;
    spacing: LayoutSpacing;
    wrap: LayoutWrap;
    style: React.CSSProperties;
    name: string;
    children?: React.ReactNode;
}

export class Layout extends React.PureComponent<Partial<LayoutProps>> {
    public static defaultProps = {
        display: LayoutDisplay.Block,
        direction: LayoutDirection.Row,
        alignment: LayoutAlignment.Start,
        spacing: LayoutSpacing.Start,
        wrap: "wrap",
        style: {},
        name: "",
    };

    public render() {
        const { display, direction, alignment, spacing, wrap, name } =
            this.props;
        return (
            <div
                data-testid="layout"
                data-name={(name ?? "").replace(/\s/g, "-").toLowerCase()}
                style={
                    {
                        display: display,
                        flexDirection: direction,
                        justifyContent: spacing,
                        alignItems: alignment,
                        flexWrap: wrap,
                        ...style,
                    } as React.CSSProperties
                }
            >
                {this.props.children}
            </div>
        );
    }
}
