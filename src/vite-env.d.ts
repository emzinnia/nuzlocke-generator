/// <reference types="vite/client" />
/// <reference types="vitest/globals" />

/**
 * Extend JSX to support new HTML elements from the Customizable Select spec.
 * @see https://developer.chrome.com/blog/a-]customizable-select
 */
declare namespace JSX {
    interface IntrinsicElements {
        selectedcontent: React.DetailedHTMLProps<
            React.HTMLAttributes<HTMLElement>,
            HTMLElement
        >;
    }
}
