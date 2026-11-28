import { listOfTrainers } from "utils";

export const mapTrainerImage = (trainer: string) => {
    if (listOfTrainers.includes(trainer.toLowerCase())) {
        return `img/${trainer.toLowerCase()}.jpg`;
    } else {
        return trainer;
    }
};
