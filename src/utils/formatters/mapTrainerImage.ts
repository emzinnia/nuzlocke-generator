import { listOfTrainers } from "utils";
import { getAssetUrl } from "utils/assets";

export const mapTrainerImage = (trainer: string) => {
    if (listOfTrainers.includes(trainer.toLowerCase())) {
        return getAssetUrl(`img/${trainer.toLowerCase()}.jpg`);
    } else {
        return trainer;
    }
};
