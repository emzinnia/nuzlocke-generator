import React from 'react';
import { Button } from 'components/Common/ui';

export const PokemonEditor = () => {
    return <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4`">
        <h1>PokemonEditor</h1>
        

        <div className="p-2">
            <Button>Add Pokemon</Button>
        </div>
    </div>;
};