import * as React from "react";
import { Outlet, useLoaderData, useNavigation, useRevalidator } from "react-router-dom";
import { Header } from "components/Common/ui/Header";
import { Sidebar } from "components/Common/ui/Sidebar";
import { RightSidebar } from "components/Common/ui/RightSidebar";
import type { RunSummary } from "api/runs";

export interface RootLoaderData {
    runs: RunSummary[];
    isAuthenticated: boolean;
}

export const RootLayout: React.FC = () => {
    const { runs, isAuthenticated } = useLoaderData() as RootLoaderData;
    const navigation = useNavigation();
    const revalidator = useRevalidator();

    const isLoading = navigation.state === "loading";

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <Header
                runs={runs}
                isAuthenticated={isAuthenticated}
                onRunsChange={() => revalidator.revalidate()}
            />
            <main className="flex min-h-screen">
                <Sidebar
                    onRunsChange={() => revalidator.revalidate()}
                />
                <div className="flex-1 relative">
                    {isLoading && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 animate-pulse" />
                    )}
                    <Outlet />
                </div>
                <RightSidebar />
            </main>
        </div>
    );
};

