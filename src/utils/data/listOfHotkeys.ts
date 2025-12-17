import { feature } from "utils/feature";

export interface HotkeyList {
    key: string;
    label?: string;
    comment: string;
    onKeyUp?: string;
    onKeyDown?: string;
}

export const betaHotkeys: HotkeyList[] = [
    {
        key: "m",
        comment: "Toggle editor",
        onKeyUp: "toggleEditor",
    },
    {
        key: "I",
        label: "shift+i",
        comment: "Toggle image uploader",
        onKeyUp: "toggleImageUploader",
    },
];

export const listOfHotkeys: HotkeyList[] = [
    {
        key: "ctrl+z",
        comment: "Undo",
    },
    {
        key: "ctrl+y",
        comment: "Redo",
    },
    {
        key: "j",
        comment: "Previous Pok\xE9mon",
        onKeyUp: "previousPokemon",
    },
    {
        key: "k",
        comment: "Next Pok\xE9mon",
        onKeyUp: "nextPokemon",
    },
    {
        key: "J",
        label: "shift+j",
        comment: "Move Pok\xE9mon Left",
        onKeyUp: "movePokemonLeft",
    },
    {
        key: "K",
        label: "shift+k",
        comment: "Move Pok\xE9mon Right",
        onKeyUp: "movePokemonRight",
    },
    {
        key: "u",
        comment: "Move Pok\xE9mon Up (Previous Status)",
        onKeyUp: "movePokemonStatusUp",
    },
    {
        key: "d",
        comment: "Move Pok\xE9mon Down (Next Status)",
        onKeyUp: "movePokemonStatusDown",
    },
    {
        key: "n",
        comment: "Add new Pok\xE9mon",
        onKeyUp: "addPokemon",
    },
    {
        key: "t",
        comment: "Toggle Type Matchups",
        onKeyUp: "toggleTypeMatchups",
    },
    {
        key: "M",
        label: "shift+m",
        comment: "Toggle Mass Editor",
        onKeyUp: "toggleMassEditor",
    },
    {
        key: "s",
        comment: "Manual Save",
        onKeyUp: "manualSave",
    },
    {
        key: "Backspace",
        comment: "Delete Pok\xE9mon",
        onKeyUp: "deletePokemon",
    },
    {
        key: "/",
        comment: "Focus Pokémon search",
        onKeyUp: "focusPokemonSearch",
    },
    {
        key: "N",
        label: "shift+n",
        comment: "Create New Nuzlocke",
        onKeyUp: "newNuzlocke",
    },
    {
        label: "shift+scroll",
        key: "shift+scroll",
        comment: "Scroll image result",
    },
    {
        label: "double-click",
        key: "double-click",
        comment: "Reset image result dimensions",
    },
    {
        label: "drag",
        key: "drag",
        comment: "Pan image result",
    },
    ...(feature.newHotkeys ? betaHotkeys : []),
];
