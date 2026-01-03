import * as React from "react";
import { Dialog, Button, Input } from "components/ui";
import { Intent } from "components/ui/intent";
import { upgradeAccount } from "api/auth";
import { showToast } from "components/Common/Shared";

interface UpgradeAccountDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function UpgradeAccountDialog({ isOpen, onClose, onSuccess }: UpgradeAccountDialogProps) {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (!email.includes("@")) {
            setError("Please enter a valid email address");
            return;
        }

        setIsLoading(true);
        try {
            await upgradeAccount(email, password);
            showToast({
                message: "Account created successfully! Your runs are now linked to your account.",
                intent: Intent.SUCCESS,
            });
            onSuccess?.();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create account. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [email, password, confirmPassword, onClose, onSuccess]);

    const handleClose = React.useCallback(() => {
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setError(null);
        onClose();
    }, [onClose]);

    return (
        <Dialog
            isOpen={isOpen}
            onClose={handleClose}
            title="Create Account"
            icon="user"
        >
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <p className="text-sm text-fg-secondary">
                    Create an account to secure your runs and sync them across devices.
                    All your current runs will be linked to your new account.
                </p>

                {error && (
                    <div
                        className="p-3 rounded-md text-sm"
                        style={{
                            backgroundColor: "var(--color-danger-100)",
                            color: "var(--color-danger-700)",
                        }}
                    >
                        {error}
                    </div>
                )}

                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-fg-primary mb-1">
                            Email
                        </label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-fg-primary mb-1">
                            Password
                        </label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            required
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-fg-primary mb-1">
                            Confirm Password
                        </label>
                        <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your password"
                            required
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button
                        type="button"
                        onClick={handleClose}
                        minimal
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        intent={Intent.PRIMARY}
                        loading={isLoading}
                    >
                        Create Account
                    </Button>
                </div>
            </form>
        </Dialog>
    );
}

