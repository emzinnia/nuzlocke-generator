import * as React from "react";
import { Trainer as TrainerModel } from "models";
import { mapTrainerImage } from "utils";

interface TrainerProps {
    trainer: TrainerModel;
}

interface TrainerStatProps {
    label: string;
    value: string | number | undefined;
    className?: string;
}

const TrainerStat = ({ label, value, className }: TrainerStatProps) => {
    if (!value) return null;
    return (
        <div className={`trainer-stat flex flex-col ${className ?? ""}`}>
            <span className="trainer-stat-label">{label}</span>
            <span className="trainer-stat-value">{value}</span>
        </div>
    );
};

export const Trainer = ({ trainer }: TrainerProps) => {
    const hasImage = Boolean(trainer.image);
    const imageSrc = trainer.image ? mapTrainerImage(trainer.image) : null;

    return (
        <div className="trainer w-full">
            <div className="trainer-content flex gap-4 w-full p-3">
                {hasImage && imageSrc && (
                    <div className="trainer-image-wrapper shrink-0">
                        <img
                            src={imageSrc}
                            alt={trainer.name ?? "Trainer"}
                            className="trainer-image w-20 h-20 object-cover"
                        />
                    </div>
                )}

                <div className="trainer-info flex flex-col gap-2 flex-1 min-w-0">
                    <div className="trainer-header flex items-baseline gap-2 flex-wrap">
                        {trainer.title && (
                            <span className="trainer-title">{trainer.title}</span>
                        )}
                    </div>

                    <div className="trainer-stats flex flex-wrap gap-4">
                        <TrainerStat label="Name" value={trainer.name} />
                        <TrainerStat label="ID" value={trainer.id} className="trainer-id" />
                        <TrainerStat label="Money" value={trainer.money} className="trainer-money" />
                        <TrainerStat label="Time" value={trainer.time} className="trainer-time" />
                        <TrainerStat label="Total Time" value={trainer.totalTime} className="trainer-totalTime" />
                        {trainer.expShareStatus && (
                            <TrainerStat
                                label="Exp. Share"
                                value={trainer.expShareStatus}
                                className="trainer-expShare"
                            />
                        )}
                    </div>

                    {trainer.badges && trainer.badges.length > 0 && (
                        <div className="trainer-badges flex flex-wrap gap-1">
                            {trainer.badges.map((badge, idx) => (
                                <span key={idx} className="trainer-badge flex items-center gap-1">
                                    {badge.image && (
                                        <img
                                            src={badge.image}
                                            alt={badge.name}
                                            className="trainer-badge-image w-4 h-4"
                                        />
                                    )}
                                    <span className="trainer-badge-name">{badge.name}</span>
                                </span>
                            ))}
                        </div>
                    )}

                    {trainer.notes && (
                        <div
                            className="trainer-notes"
                            dangerouslySetInnerHTML={{ __html: trainer.notes }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

