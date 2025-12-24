import * as React from "react";
import { render, screen } from "utils/testUtils";
import { SuspenseBoundary } from "../SuspenseBoundary";
import { vi, describe, it, expect } from "vitest";

describe("SuspenseBoundary", () => {
    it("renders children when loaded", () => {
        const TestComponent = () => <div data-testid="child">Test Content</div>;
        
        render(
            <SuspenseBoundary>
                <TestComponent />
            </SuspenseBoundary>
        );
        
        expect(screen.getByTestId("child")).toBeDefined();
        expect(screen.getByText("Test Content")).toBeDefined();
    });

    it("renders skeleton fallback while suspending", () => {
        let resolve: () => void;
        const suspensePromise = new Promise<void>((r) => {
            resolve = r;
        });

        const SuspendingComponent = React.lazy(
            () =>
                new Promise<{ default: React.ComponentType }>((r) => {
                    suspensePromise.then(() =>
                        r({ default: () => <div>Loaded</div> })
                    );
                })
        );

        const { container } = render(
            <SuspenseBoundary>
                <SuspendingComponent />
            </SuspenseBoundary>
        );

        // Should show skeleton while suspending
        expect(screen.getByTestId("suspense-skeleton")).toBeDefined();
    });

    it("catches errors from children via ErrorBoundary", () => {
        // Suppress console.error for this test
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        const ThrowingComponent = () => {
            throw new Error("Test error");
        };

        // ErrorBoundary should catch the error and not crash
        expect(() => {
            render(
                <SuspenseBoundary>
                    <ThrowingComponent />
                </SuspenseBoundary>
            );
        }).not.toThrow();

        consoleSpy.mockRestore();
    });
});
