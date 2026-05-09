import { version } from "../../package.json";
import { State } from "state";
import { styleDefaults } from "utils/styleDefaults";

export const PERSIST_KEY = "persist:root";

const PERSIST_BLACKLIST = new Set(["router", "editorHistory"]);

type PersistedState = Partial<State> & Record<string, unknown>;
type PersistedEnvelope = Record<string, unknown>;

type Migration = (state: PersistedState) => PersistedState;

const migrations: Record<string, Migration> = {
    "0.0.6-beta": (state) => ({
        ...state,
        box: undefined,
    }),
    "0.0.11-beta": (state) => ({
        ...state,
        trainer: {
            ...(state.trainer as State["trainer"] | undefined),
            badges: [],
        },
    }),
    "1.1.0": (state) => ({
        ...state,
        customMoveMap: [],
    }),
    "1.1.1": (state) => ({
        ...state,
        customMoveMap: [],
    }),
    "1.1.2": (state) => ({
        ...state,
        customMoveMap: [],
    }),
    "1.1.3": (state) => ({
        ...state,
        customMoveMap: [],
    }),
    "1.1.4": (state) => ({
        ...state,
        customMoveMap: [],
    }),
    "1.6.0": (state) => ({
        ...state,
        // in 1.6.0, we allowed boxes to be reorganized with drag & drop
        // The problem was that a long standing data inaccuracy existed in the reducer
        // whereby the position of Champs & Dead were the same
        // While this actually isn't that dramatic (it doesn't break the app)
        // It's better to be safe than sorry, so this changes the position of Champs
        // Assuming there is only 1 champs with the default length
        box: Array.isArray(state.box)
            ? state.box.map((box, index) => ({
                  ...box,
                  position: index,
                  id: index,
              }))
            : state.box,
    }),
    "1.7.1": (state) => ({
        ...state,
        style: {
            ...styleDefaults,
            ...(state.style as State["style"] | undefined),
            statsOptions: {
                ...styleDefaults.statsOptions,
                ...(state.style as State["style"] | undefined)?.statsOptions,
                averageLevelDetailed: false,
            },
        },
    }),
    "1.15.1": (state) => ({
        ...state,
        excludedAreas: [],
    }),
    "1.16.0": (state) => ({
        ...state,
        customAreas: [],
    }),
};

const parseVersionParts = (value: string) =>
    value
        .split("-")[0]
        .split(".")
        .map((part) => Number.parseInt(part, 10) || 0);

const compareVersions = (a: string, b: string) => {
    const left = parseVersionParts(a);
    const right = parseVersionParts(b);
    const length = Math.max(left.length, right.length);

    for (let index = 0; index < length; index += 1) {
        const leftValue = left[index] ?? 0;
        const rightValue = right[index] ?? 0;
        if (leftValue !== rightValue) return leftValue - rightValue;
    }

    return 0;
};

const getPersistedVersion = (envelope: PersistedEnvelope) => {
    const persistedMeta = envelope._persist;
    if (typeof persistedMeta !== "string") return undefined;

    try {
        const parsed = JSON.parse(persistedMeta);
        return typeof parsed?.version === "string" ? parsed.version : undefined;
    } catch {
        return undefined;
    }
};

export const migratePersistedState = (
    state: Partial<State>,
    persistedVersion?: string,
): Partial<State> => {
    return Object.entries(migrations)
        .filter(([migrationVersion]) => {
            if (compareVersions(migrationVersion, version) > 0) return false;
            if (!persistedVersion) return true;
            return compareVersions(persistedVersion, migrationVersion) < 0;
        })
        .reduce<PersistedState>(
            (nextState, [, migrate]) => migrate(nextState),
            state as PersistedState,
        );
};

export const deserializePersistedState = (
    raw: string | null | undefined,
): Partial<State> | undefined => {
    if (!raw) return undefined;

    try {
        const envelope = JSON.parse(raw) as PersistedEnvelope;
        if (!envelope || typeof envelope !== "object") return undefined;

        const state: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(envelope)) {
            if (key === "_persist" || PERSIST_BLACKLIST.has(key)) continue;
            state[key] = typeof value === "string" ? JSON.parse(value) : value;
        }

        return migratePersistedState(
            state as Partial<State>,
            getPersistedVersion(envelope),
        );
    } catch {
        return undefined;
    }
};

export const serializePersistedState = (state: Partial<State>) => {
    const envelope: Record<string, string> = {};

    for (const [key, value] of Object.entries(state as Record<string, unknown>)) {
        if (PERSIST_BLACKLIST.has(key) || typeof value === "undefined") {
            continue;
        }
        envelope[key] = JSON.stringify(value);
    }

    envelope._persist = JSON.stringify({
        version,
        rehydrated: true,
    });

    return JSON.stringify(envelope);
};

export const getBrowserStorage = (): Storage | undefined => {
    if (typeof window === "undefined") return undefined;

    try {
        return window.localStorage;
    } catch {
        return undefined;
    }
};

export const readPersistedState = (
    storage: Storage | undefined = getBrowserStorage(),
) => deserializePersistedState(storage?.getItem(PERSIST_KEY));

export const writePersistedState = (
    state: Partial<State>,
    storage: Storage | undefined = getBrowserStorage(),
) => {
    storage?.setItem(PERSIST_KEY, serializePersistedState(state));
};

export const purgePersistedState = (
    storage: Storage | undefined = getBrowserStorage(),
) => {
    storage?.removeItem(PERSIST_KEY);
};
