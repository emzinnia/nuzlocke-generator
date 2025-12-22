/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout.
 *
 * @param {Function} func The function to debounce.
 * @param {number} wait The number of milliseconds to delay.
 * @param {Object} [options] The options object.
 * @param {boolean} [options.leading=false] Specify invoking on the leading edge of the timeout.
 * @param {boolean} [options.trailing=true] Specify invoking on the trailing edge of the timeout.
 * @param {boolean} [options.maxWait] The maximum time `func` is allowed to be delayed before it's invoked.
 * @returns {Function} Returns the new debounced function.
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number = 0,
    options: {
        leading?: boolean;
        trailing?: boolean;
        maxWait?: number;
    } = {},
): T & { cancel: () => void; flush: () => void } {
    let lastArgs: any[] | undefined;
    let lastThis: any;
    let maxWait: number | undefined;
    let result: any;
    let timerId: ReturnType<typeof setTimeout> | undefined;
    let lastCallTime: number | undefined;
    let lastInvokeTime = 0;
    let leading = false;
    let maxing = false;
    let trailing = true;

    // Normalize options
    if (typeof options !== "object") {
        options = {};
    }
    if (options.leading !== undefined) {
        leading = !!options.leading;
    }
    if (options.trailing !== undefined) {
        trailing = !!options.trailing;
    }
    if (options.maxWait !== undefined) {
        maxing = true;
        maxWait = Math.max(options.maxWait || 0, wait);
    }

    // Helper functions
    function invokeFunc(time: number): any {
        const args = lastArgs;
        const thisArg = lastThis;

        lastArgs = undefined;
        lastThis = undefined;
        lastInvokeTime = time;
        result = func.apply(thisArg, args!);
        return result;
    }

    function leadingEdge(time: number): any {
        // Reset any `maxWait` timer
        lastInvokeTime = time;
        // Start the timer for the trailing edge
        timerId = setTimeout(timerExpired, wait);
        // Invoke the leading edge
        return leading ? invokeFunc(time) : result;
    }

    function remainingWait(time: number): number {
        const timeSinceLastCall = time - (lastCallTime || 0);
        const timeSinceLastInvoke = time - lastInvokeTime;
        const timeWaiting = wait - timeSinceLastCall;

        return maxing
            ? Math.min(timeWaiting, (maxWait as number) - timeSinceLastInvoke)
            : timeWaiting;
    }

    function shouldInvoke(time: number): boolean {
        const timeSinceLastCall = time - (lastCallTime || 0);
        const timeSinceLastInvoke = time - lastInvokeTime;

        // Either this is the first call, activity has stopped and we're at the
        // trailing edge, the system time has gone backwards and we're treating
        // it as the trailing edge, or we've hit the `maxWait` limit.
        return (
            lastCallTime === undefined ||
            timeSinceLastCall >= wait ||
            timeSinceLastCall < 0 ||
            (maxing && timeSinceLastInvoke >= (maxWait as number))
        );
    }

    function timerExpired(): void {
        const time = Date.now();
        if (shouldInvoke(time)) {
            return trailingEdge(time);
        }
        // Restart the timer
        timerId = setTimeout(timerExpired, remainingWait(time));
    }

    function trailingEdge(time: number): any {
        timerId = undefined;

        // Only invoke if we have `lastArgs` which means `func` has been
        // debounced at least once
        if (trailing && lastArgs) {
            return invokeFunc(time);
        }
        lastArgs = undefined;
        lastThis = undefined;
        return result;
    }

    function cancel(): void {
        if (timerId !== undefined) {
            clearTimeout(timerId);
        }
        lastInvokeTime = 0;
        lastArgs = undefined;
        lastCallTime = undefined;
        lastThis = undefined;
        timerId = undefined;
    }

    function flush(): any {
        return timerId === undefined ? result : trailingEdge(Date.now());
    }

    function debounced(this: any, ...args: any[]): any {
        const time = Date.now();
        const isInvoking = shouldInvoke(time);

        lastArgs = args;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        lastThis = this;
        lastCallTime = time;

        if (isInvoking) {
            if (timerId === undefined) {
                return leadingEdge(lastCallTime);
            }
            if (maxing) {
                // Handle invocations in a tight loop
                timerId = setTimeout(timerExpired, wait);
                return invokeFunc(lastCallTime);
            }
        }
        if (timerId === undefined) {
            timerId = setTimeout(timerExpired, wait);
        }
        return result;
    }

    // Attach cancel and flush methods to the debounced function
    debounced.cancel = cancel;
    debounced.flush = flush;

    return debounced as T & { cancel: () => void; flush: () => void };
}
