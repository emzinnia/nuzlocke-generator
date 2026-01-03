import * as React from "react";
import { Trainer as TrainerModel } from "models";

interface TrainerProps {
    trainer: TrainerModel;
}

export const Trainer = ({ trainer }: TrainerProps) => {
    return (
        <div className="trainer flex flex-wrap gap-0.5 w-full">
            <div className="trainer-content flex gap-2 w-full p-2">
                <div className="flex flex-col trainer-name">
                    <span className="font-semibold mb-1">Name</span>
                    <span>{trainer.name}</span>
                </div>
                <div className="flex flex-col trainer-title">
                    <span className="font-semibold mb-1">Title</span>
                    <span>{trainer.title}</span>
                </div>
                <div className="flex flex-col trainer-money">
                    <span className="font-semibold mb-1">Money</span>
                    <span>{trainer.money}</span>
                </div>
                <div className="flex flex-col trainer-time">
                    <span className="font-semibold mb-1">Time</span>
                    <span>{trainer.time}</span>
                </div>
                <div className="flex flex-col trainer-id">
                    <span className="font-semibold mb-1">ID</span>
                    <span>{trainer.id}</span>
                </div>
                <div className="flex flex-col trainer-totalTime">
                    <span className="font-semibold mb-1">Total Time</span>
                    <span>{trainer.totalTime}</span>
                </div>
            </div>
        </div>
    );
};

