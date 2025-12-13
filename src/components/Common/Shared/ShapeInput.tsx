import * as React from "react";

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
            <div className="px-2 py-1.5 text-sm border border-border bg-input text-foreground rounded-md">
                <div className="shape">
                    {this.renderShape}
                    <input type="text" />
                </div>
            </div>
        );
    }
}
