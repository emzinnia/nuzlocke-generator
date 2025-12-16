import * as React from "react";
import { Classes } from "@blueprintjs/core";

export enum Shape {
    Circle,
    Square,
    Diamond,
    Trapezoid,
    RhombusLeft,
    RhombusRight,
    Triangle,
    TriangleUpsideDown,
}

export interface ShapeInputProps {
    shapes: Shape[];
}

export interface ShapeInputState {
    selectedShape: Shape;
}

export class ShapeInput extends React.Component<ShapeInputProps> {
    public state = { selectedShape: Shape.Circle };

    public renderShape() {}

    public render() {
        return (
            <div className={Classes.INPUT}>
                <div className="shape">
                    {this.renderShape()}
                    <input type="text" />
                </div>
            </div>
        );
    }
}
