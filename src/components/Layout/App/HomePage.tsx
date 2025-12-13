import * as React from "react";
import { useRouteLoaderData, useRevalidator, useNavigate } from "react-router-dom";
import { login, register } from "api/auth";
import { useAuthStore } from "./auth";
import type { RootLoaderData } from "./RootLayout";
import { Button } from "components/Common/ui/Button";

export const HomePage: React.FC = () => {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const { isAuthenticated, runs } = useRouteLoaderData("root") as RootLoaderData || { isAuthenticated: false, runs: [] };
    const revalidator = useRevalidator();
    const navigate = useNavigate();

    const handleLogin = async () => {
        setError(null);
        setIsSubmitting(true);
        try {
            const response = await login(email, password);
            if (response.token) {
                localStorage.setItem("auth_token", response.token);
                useAuthStore.setState({ token: response.token, isAuthenticated: true });
                revalidator.revalidate();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRegister = async () => {
        setError(null);
        setIsSubmitting(true);
        try {
            const response = await register(email, password);
            if (response.token) {
                localStorage.setItem("auth_token", response.token);
                useAuthStore.setState({ token: response.token, isAuthenticated: true });
                revalidator.revalidate();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Registration failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    React.useEffect(() => {
        if (isAuthenticated && runs.length > 0) {
            const mostRecentRun = [...runs].sort(
                (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            )[0];
            navigate(`/runs/${mostRecentRun.id}`, { replace: true });
        }
    }, [isAuthenticated, runs, navigate]);

    if (isAuthenticated) {
        return (
            <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    {runs.length > 0 ? "Redirecting to your most recent run..." : "Welcome! Use the sidebar to create a new run."}
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-md">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Nuzlocke Generator</h1>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Sign In or Register</h2>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3 py-2 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-3">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isSubmitting}
                        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600"
                    />
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={handleLogin}
                        disabled={isSubmitting}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-md font-medium transition-colors"
                    >
                        {isSubmitting ? "..." : "Login"}
                    </Button>
                    <Button
                        onClick={handleRegister}
                        disabled={isSubmitting}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md font-medium transition-colors"
                    >
                        {isSubmitting ? "..." : "Register"}
                    </Button>
                </div>
            </div>
        </div>
    );
};
