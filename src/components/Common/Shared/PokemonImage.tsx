/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-function-type */
import { Pokemon } from "models";
import * as React from "react";
import { State } from "state";
import { getPokemonImage, wrapImageInCORSPlain } from "utils";
import { getImageByName } from "components/Common/Shared/ImagesDrawer";

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
    /* A URL that overrides getPokemonImage() */
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
        // If a URL is defined, we return it through cors-anywhere
        // Otherwise, we just use getPokemonImage() (which also uses cors-anywhere under the hood)
        try {
            if (url) {
                (async () => {
                    // First, treat the url as a possible Dexie-stored image *name*.
                    const dexieMatch = await getImageByName(url);
                    if (dexieMatch?.image) {
                        setImage(dexieMatch.image);
                        return;
                    }

                    // Then fall back to the historical behavior:
                    // - http(s): use CORS proxy -> data URL
                    // - otherwise: treat as a direct src (data:, relative path, etc.)
                    if (url.startsWith("http")) {
                        setImage(await wrapImageInCORSPlain(url));
                    } else {
                        setImage(url);
                    }
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
