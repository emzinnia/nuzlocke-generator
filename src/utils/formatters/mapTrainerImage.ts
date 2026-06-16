import { listOfTrainers } from "utils";

const trainerImageOverrides: Record<string, string> = {
    sun: "img/sun.png",
};

export const mapTrainerImage = (trainer: string) => {
    const trainerKey = trainer.toLowerCase();

    if (trainerImageOverrides[trainerKey]) {
        return trainerImageOverrides[trainerKey];
    }

    if (listOfTrainers.includes(trainerKey)) {
        return `img/${trainerKey}.jpg`;
    } else {
        return trainer;
    }
};
