/**
 * @interface Action
 * @param T type
 * @param P payload
 */
type LegacyActionPayload = ReturnType<typeof JSON.parse>;

export interface Action<T, P = LegacyActionPayload> {
    type: T;
    [payload: string]: P | T;
    readonly meta?: LegacyActionPayload;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Action {
    export type Index = "history" | "pokemon" | "mode" | "example";
    export type Type = string;
    export type Payload<P> = { [K in Index]?: P };
    export interface Data<T extends Type> {
        readonly type: T & Type;
        readonly meta?: LegacyActionPayload;
    }
}

export type Action2<T extends Action.Type, P = unknown> = Action.Data<T> &
    Action.Payload<P>;

interface Example {
    count: number;
}

type NICE_ACTION = "NICE_ACTION";
const NICE_ACTION: NICE_ACTION = "NICE_ACTION";

const actionExample = (example: Example): Action2<NICE_ACTION, Example> => ({
    type: NICE_ACTION,
    example,
});
