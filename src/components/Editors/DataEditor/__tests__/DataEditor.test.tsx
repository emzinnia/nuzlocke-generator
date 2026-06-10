import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DataEditorBase, DataEditorProps } from "../DataEditor";
import { AdvancedImportSettings } from "../AdvancedImportOptions";
import { createDefaultState } from "store";
import { State } from "state";
import { Game, Pokemon, Trainer } from "models";

type MockWorkerInstance = {
    postMessage: ReturnType<typeof vi.fn>;
    terminate: ReturnType<typeof vi.fn>;
    onmessage?: (event: MessageEvent<unknown>) => void;
    onmessageerror?: (event: unknown) => void;
    onerror?: (event: ErrorEvent) => void;
};

type MockReaderInstance = {
    result: ArrayBuffer | null;
    readAsArrayBuffer: ReturnType<typeof vi.fn>;
    addEventListener: ReturnType<typeof vi.fn>;
    triggerLoad: (result?: ArrayBuffer) => void;
};

const mockWorkerState = vi.hoisted(() => ({
    instances: [] as MockWorkerInstance[],
}));

vi.mock("parsers/worker?worker", () => {
    return {
        default: class MockSaveFileWorker implements MockWorkerInstance {
            public postMessage = vi.fn();
            public terminate = vi.fn();
            public onmessage?: (event: MessageEvent<unknown>) => void;
            public onmessageerror?: (event: unknown) => void;
            public onerror?: (event: ErrorEvent) => void;

            public constructor() {
                mockWorkerState.instances.push(this);
            }
        },
    };
});

class MockFileReader implements MockReaderInstance {
    public result: ArrayBuffer | null = null;
    public readAsArrayBuffer = vi.fn();
    private loadListener?: (this: MockFileReader, event: Event) => void;
    public addEventListener = vi.fn(
        (eventName: string, listener: (this: MockFileReader, event: Event) => void) => {
            if (eventName === "load") {
                this.loadListener = listener;
            }
        },
    );

    public triggerLoad(result = new ArrayBuffer(1)) {
        this.result = result;
        this.loadListener?.call(this, new Event("load"));
    }
}

const mockReaderState = {
    instances: [] as MockFileReader[],
};

const originalFileReader = globalThis.FileReader;

const createProps = (state: State): DataEditorProps => ({
    state,
    replaceState: vi.fn(),
    newNuzlocke: vi.fn(),
});

const createSettings = (): AdvancedImportSettings => ({
    selectedGame: "Emerald",
    boxMappings: [],
    mergeDataMode: false,
});

const createWorkerResult = (
    species: string,
): {
    pokemon: Pokemon[];
    trainer: Trainer;
    detectedGame: Game;
} => ({
    pokemon: [
        {
            id: species,
            species,
            status: "Team",
        },
    ],
    trainer: { name: "Imported Trainer" },
    detectedGame: { name: "Emerald", customName: "" },
});

describe("<DataEditorBase /> save imports", () => {
    beforeEach(() => {
        mockWorkerState.instances.length = 0;
        mockReaderState.instances.length = 0;
        vi.stubGlobal(
            "FileReader",
            class extends MockFileReader {
                public constructor() {
                    super();
                    mockReaderState.instances.push(this);
                }
            },
        );
    });

    afterEach(() => {
        vi.stubGlobal("FileReader", originalFileReader);
    });

    it("applies only the latest worker result to the current state snapshot", () => {
        const initialState = createDefaultState();
        const currentState: State = {
            ...initialState,
            customAreas: ["Edited while import was parsing"],
        };
        const props = createProps(initialState);
        const component = new DataEditorBase(props);
        const handleFileSelect = (
            component as unknown as {
                handleFileSelect: (file: File, settings: AdvancedImportSettings) => void;
                props: DataEditorProps;
            }
        ).handleFileSelect.bind(component);

        handleFileSelect(new File(["first"], "first.sav"), createSettings());
        mockReaderState.instances[0].triggerLoad();
        handleFileSelect(new File(["second"], "second.sav"), createSettings());
        mockReaderState.instances[1].triggerLoad();

        (component as unknown as { props: DataEditorProps }).props = {
            ...props,
            state: currentState,
        };

        mockWorkerState.instances[1].onmessage?.({
            data: createWorkerResult("Treecko"),
        } as MessageEvent<unknown>);
        mockWorkerState.instances[0].onmessage?.({
            data: createWorkerResult("Mudkip"),
        } as MessageEvent<unknown>);

        expect(props.replaceState).toHaveBeenCalledTimes(1);
        expect(props.replaceState).toHaveBeenCalledWith(
            expect.objectContaining({
                customAreas: currentState.customAreas,
                pokemon: [expect.objectContaining({ species: "Treecko" })],
            }),
        );
    });
});
