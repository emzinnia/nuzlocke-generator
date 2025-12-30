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

    public renderShape(): React.ReactNode {
        return null;
    }

    public render() {
        return (
            <div className="rounded border border-border bg-input px-3 py-2">
                <div className="shape">
                    {this.renderShape()}
                    <input type="text" className="bg-transparent outline-none" />
                </div>
            </div>
        );
    }
}
