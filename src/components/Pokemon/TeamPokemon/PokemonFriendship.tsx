// "It looks really happy! It must love you a lot."	250-255
// "I get the feeling that it really trusts you."	200-249
// "It's friendly toward you. It looks sort of happy."	150-199
// "It's quite cute."	100-149
// "You should treat it better. It's not used to you."	50-99
// "It doesn't seem to like you at all. It looks mean."	0-49

import * as React from "react";
import { Icon } from "@blueprintjs/core";
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
            iconSize={12}
            data-testid="friendship-icon"
            key={uuid()}
            icon="heart"
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
                iconSize={12}
                data-testid="friendship-broken-icon"
                icon="heart-broken"
            />
        );

    return <>{generateHearts(numberOfHearts)}</>;
}
