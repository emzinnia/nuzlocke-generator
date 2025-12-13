import * as React from "react";
import { HTMLSelect } from "components/Common/ui";
import * as css from "./styles";
import { cx } from "emotion";
import { head, last } from "ramda";

export interface CSSUnitInputProps {
    name: string;
    value: any;
    onChange: (e?: any) => void;
    allowedUnits?: string[];
}

export interface CSSUnitInputState {
    chosenUnit: string;
    chosenNumber: number;
}

export const splitValue = (value: string) => {
    const value1 = value.split(/\D/g);
    const value2 = value.split(/\d/g);
    return {
        num: head(value1),
        unit: last(value2),
    };
};

export class CSSUnitInput extends React.Component<
    CSSUnitInputProps,
    CSSUnitInputState
> {
    public defaultProps = {
        allowedUnits: [
            "px",
            "cm",
            "mm",
            "in",
            "pt",
            "pc",
            "em",
            "rem",
            "vw",
            "vh",
            "%",
        ],
    };

    public static getDerivedStateFromProps(props: CSSUnitInputProps) {
        const { name, value, allowedUnits } = props;
        const { unit, num } = splitValue(value);
        return {
            chosenNumber: num,
            chosenUnit: unit,
        };
    }

    private setUnit = (e: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({ chosenUnit: e.target.value });
        this.onChange();
    };

    private setNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ chosenNumber: Number.parseInt(e.target.value) });
    };

    private onChange = () => {
        const { chosenUnit, chosenNumber } = this.state;
        this.props.onChange({
            target: {
                value: `${chosenNumber}${chosenUnit}`,
            },
        });
    };

    public render() {
        const { name, value, allowedUnits } = this.props;
        const { chosenUnit, chosenNumber } = this.state;
        const { unit, num } = splitValue(value);

        const units = [
            "px",
            "cm",
            "mm",
            "in",
            "pt",
            "pc",
            "em",
            "rem",
            "vw",
            "vh",
            "%",
        ];

        console.log(unit, num);

        return (
            <div className={cx(css.componentOption, css.cssUnit)}>
                <label className="text-sm font-medium text-foreground">{name}</label>
                <input
                    className={cx("px-2 py-1.5 text-sm border border-border bg-input text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring", css.unitInput)}
                    name={name}
                    onChange={this.setNumber}
                    type="number"
                    value={chosenNumber}
                />
                <HTMLSelect onChange={this.setUnit} value={chosenUnit} options={units} />
            </div>
        );
    }
}
