import { Badge } from "./Badge";

export interface Trainer {
    name?: string;
    id?: string | number;
    time?: string;
    money?: string;
    badges?: Badge[];
    expShareStatus?: string;
    image?: string;
    title?: string;
    notes?: string;
    totalTime?: string;
    hasEditedCheckpoints?: boolean;
}

export const TrainerKeys: Trainer = {
    name: "Red",
    id: "00123",
    time: "04:33",
    money: "$144",
    badges: [],
    expShareStatus: "ON",
    image: "http://placeholder.com",
    title: "Trainer Title",
    notes: "None yet.",
    totalTime: "190:33",
    hasEditedCheckpoints: false,
};
