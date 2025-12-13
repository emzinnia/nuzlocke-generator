import { Pokemon } from "models";
import * as React from "react";
import { State } from "state";
import { getPokemonImage, wrapImageInCORSPlain } from "utils";

export interface PokemonImageProps {
    children?: (image: string) => JSX.Element;
    customImage?: Pokemon["customImage"];
    forme?: Pokemon["forme"];
    shiny?: Pokemon["shiny"];
    species?: Pokemon["species"];
    gender?: Pokemon["gender"];
    egg?: Pokemon["egg"];
    style?: State["style"];
    editor?: State["editor"];
    name?: State["game"]["name"];
    url?: string;
}

export function PokemonImage({
    children,
    customImage,
    forme,
    species,
    shiny,
    style,
    editor,
    name,
    gender,
    url,
    egg,
}: PokemonImageProps) {
    const [image, setImage] = React.useState("");

    React.useEffect(() => {
        try {
            if (url) {
                (async () => {
                    setImage(await wrapImageInCORSPlain(url));
                })();
            } else {
                (async () => {
                    setImage(
                        await getPokemonImage({
                            customImage: customImage,
                            forme: forme as any,
                            species: species,
                            shiny: shiny,
                            style: style,
                            name: name,
                            editor: editor,
                            gender: gender,
                            egg: egg,
                        }),
                    );
                })();
            }
        } catch (e) {
            console.error(e);
        }
    }, [
        customImage,
        forme,
        species,
        shiny,
        style,
        name,
        editor,
        gender,
        url,
        egg,
    ]);

    return children?.(image) || <img alt={name} src={image} />;
}
