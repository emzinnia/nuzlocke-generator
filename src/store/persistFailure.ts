type PersistFailureListener = (error: unknown) => void;

const listeners = new Set<PersistFailureListener>();

export const PERSIST_FAILURE_TOAST_COOLDOWN_MS = 8_000;

export const onPersistFailure = (
    listener: PersistFailureListener,
): (() => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

export const reportPersistFailure = (error: unknown) => {
    console.error("Failed to persist state to localStorage", error);
    for (const listener of listeners) {
        try {
            listener(error);
        } catch (listenerError) {
            console.error("Persist failure listener threw", listenerError);
        }
    }
};
