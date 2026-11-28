export type onClick = (
    e?:
        | React.SyntheticEvent<MouseEvent>
        | React.SyntheticEvent<HTMLButtonElement>,
) => void;

export type Concrete<Type> = {
    [Property in keyof Type]-?: Type[Property];
};
