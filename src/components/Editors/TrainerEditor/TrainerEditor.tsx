import * as React from "react";
import { Field, Collapsible } from "components/Common/ui";
import { getRun, patchRun } from "api/runs";
import type { Trainer } from "models/Trainer";
import { debounce } from "utils/debounce";

interface TrainerEditorProps {
    runId: string;
    onTrainerUpdated?: (trainer: Trainer) => void;
}

export const TrainerEditor: React.FC<TrainerEditorProps> = ({ runId, onTrainerUpdated }) => {
    const [trainer, setTrainer] = React.useState<Trainer>({});
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Fetch trainer data on mount and when runId changes
    React.useEffect(() => {
        const fetchTrainer = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const run = await getRun(runId);
                setTrainer(run.data.trainer || {});
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load trainer');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTrainer();
    }, [runId]);

    // Debounced save function
    const saveTrainer = React.useMemo(
        () =>
            debounce(async (updatedTrainer: Trainer) => {
                setIsSaving(true);
                try {
                    await patchRun(runId, { trainer: updatedTrainer });
                    onTrainerUpdated?.(updatedTrainer);
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to save trainer');
                } finally {
                    setIsSaving(false);
                }
            }, 500),
        [runId, onTrainerUpdated]
    );

    const updateField = (field: keyof Trainer, value: string) => {
        const updatedTrainer = { ...trainer, [field]: value };
        setTrainer(updatedTrainer);
        saveTrainer(updatedTrainer);
    };

    const title = isSaving ? "Trainer (Saving...)" : "Trainer";

    if (isLoading) {
    return (
            <Collapsible title="Trainer" defaultOpen={true}>
                <div className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
                    Loading...
        </div>
            </Collapsible>
    );  
}

    return (
        <Collapsible title={title} defaultOpen={true}>
            {error && (
                <div className="mb-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <Field
                    label="Name"
                    inputProps={{
                        type: "text",
                        value: trainer.name || '',
                        onChange: (e) => updateField('name', e.target.value),
                        placeholder: "Trainer Name",
                    }}
                />
                <Field
                    label="ID"
                    inputProps={{
                        type: "text",
                        value: trainer.id?.toString() || '',
                        onChange: (e) => updateField('id', e.target.value),
                        placeholder: "Trainer ID",
                    }}
                />
                <Field
                    label="Time"
                    inputProps={{
                        type: "text",
                        value: trainer.time || '',
                        onChange: (e) => updateField('time', e.target.value),
                        placeholder: "0:00",
                    }}
                />
                <Field
                    label="Money"
                    inputProps={{
                        type: "text",
                        value: trainer.money || '',
                        onChange: (e) => updateField('money', e.target.value),
                        placeholder: "$0",
                    }}
                />
                <Field
                    label="Title"
                    inputProps={{
                        type: "text",
                        value: trainer.title || '',
                        onChange: (e) => updateField('title', e.target.value),
                        placeholder: "Title",
                    }}
                />
                <Field
                    label="Image"
                    inputProps={{
                        type: "text",
                        value: trainer.image || '',
                        onChange: (e) => updateField('image', e.target.value),
                        placeholder: "http://...",
                    }}
                />
                <Field
                    label="Notes"
                    inputProps={{
                        type: "text",
                        value: trainer.notes || '',
                        onChange: (e) => updateField('notes', e.target.value),
                        placeholder: "Notes",
                    }}
                />
            </div>
        </Collapsible>
    );
};
