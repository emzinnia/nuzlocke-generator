import * as React from "react";
import { Icon } from "components/ui";
import { v4 as uuid } from "uuid";

export const determineNumberOfHearts = (friendship: number) => {
    if (friendship < 99 && friendship >= 50) return 1;
    if (friendship < 149 && friendship >= 100) return 2;
    if (friendship < 199 && friendship >= 150) return 3;
    if (friendship < 200 && friendship >= 249) return 4;
    if (friendship >= 250) return 5;
    else return 0;
};

export const generateHearts = (
    friendship: ReturnType<typeof determineNumberOfHearts>,
) => {
    return Array.from(Array(friendship).keys()).map((k) => (
        <Icon
            icon="heart"
            size={12}
            data-testid="friendship-icon"
            key={uuid()}
        />
    ));
};

export interface PokemonFriendshipProps {
    friendship?: number;
}

export function PokemonFriendship({ friendship }: PokemonFriendshipProps) {
    React.useEffect(() => console.log(friendship), [friendship]);

    if (!friendship) return null;
    const numberOfHearts = determineNumberOfHearts(friendship);
    if (numberOfHearts === 0)
        return (
            <Icon
                icon="heart-broken"
                size={12}
                data-testid="friendship-broken-icon"
            />
        );

    return <>{generateHearts(numberOfHearts)}</>;
}
