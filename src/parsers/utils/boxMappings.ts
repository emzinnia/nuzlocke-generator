export type BoxMapping = {
    key: number;
    status: string;
    name?: string; // Optional: sourced from save data when available
};

export type BoxMappings = BoxMapping[];
