import { css } from "emotion";

export const topBar = css`
    align-items: center;
    background: #fefefe;
    border-bottom: 1px solid rgba(0, 0, 0, 0.33);
    color: #111;
    display: flex;
    font-size: 1.15rem;
    justify-content: center;
    padding: 0.5rem;
    position: relative;
    z-index: 19;
`;

export const topBar_mobile = css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 48px;
    z-index: 25;
    justify-content: space-between;
`;

export const topBar_mobile_open = css`
    height: auto;
    flex-direction: column;
    transition: 200ms all ease-in-out;
    justify-content: flex-start;
    align-items: flex-start;
`;

export const topBar_dark = css`
    background: #222;
    color: #fff !important;
    button {
        color: #fff !important;
    }
`;

export const close_result_button = css`
    z-index: 23 !important;
`;

export const heading = css`
    align-items: center;
    color: #111;
    display: flex;
    justify-content: center;
    letter-spacing: 4px;
    margin: 0.5rem;
    font-weight: bold;
    font-size: 2rem;
    text-align: center;
    text-transform: uppercase;
    width: 100%;
`;

export const heading_dark = css`
    color: #eee;
`;

export const container = css`
    border: 1px solid #111;
    height: 100%;
    margin: 0 auto;
    overflow: hidden;
    padding-bottom: 0.5rem;
    position: relative;
    width: 100%;
`;

export const h3 = css`
    color: #eee;
    letter-spacing: 4px;
    margin: 0.5rem;
    text-align: center;
    text-transform: uppercase;
`;

export const callout_dark = css`
    color: white;
`;

export const resultNotes = css`
    font-size: 1.25rem;
    font-weight: bold;
    margin: 0.5rem;
    text-align: center;
`;

export const genderColorFemale = css`
    color: pink;
`;

export const genderColorMale = css`
    color: lightblue;
`;

export const pokemonContainer = css`
    display: inline-block;
    padding: 1rem;
    position: relative;
`;

export const trainerContainer = css`
    background-position:
        top left,
        bottom left;
    background-size:
        cover,
        50% auto;
    background: #333;
    border-bottom: 1px solid #000;
    color: #eee;
    padding: 0.25rem;
    width: 100%;
`;

export const trainerImage = css`
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    height: 3rem;
    width: 3rem;
`;

export const trainerWrapper = css`
    align-content: center;
    align-items: center;
    display: flex;
`;

export const nuzlockeTitle = css`
    display: inline-flex;
    font-size: 1.5rem;
    font-weight: light;
`;

export const badgeWrapper = css`
    display: inline-flex;
    flex-wrap: wrap;
    justify-content: center;
    margin-left: auto;
    margin-right: 1rem;
    width: 216px;

    img {
        height: 1.5rem;
    }
`;

export const move = css`
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    color: #222;
    font-size: 0.9rem;
    height: 1.7rem;
    margin: 0.25rem;
    padding: 0;
    text-align: center;
    &.long-text-move {
        font-size: 0.7rem;
    }
`;

export const pokemonNickname = css`
    font-size: 1.5rem;
`;

export const pokemonShiny = css`
    background: #eee;
    border-radius: 50%;
    border: 2px solid white;
    height: 2rem;
    width: 2rem;
    padding-top: 0.2rem;
    padding-left: 0.5rem;
    position: absolute;
    left: 7rem;
    top: 1rem;
`;

export const square = css`
    border-radius: 50%;
    display: inline-block;
    height: 8rem;
    width: 8rem;
    padding: 0.25rem;
    position: relative;
    z-index: 10;
`;

export const round = css`
    display: inline-block;
    height: 8rem;
    width: 8rem;
    padding: 0.25rem;
    position: relative;
    z-index: 10;
`;

export const pokemonImage = css`
    background-size: cover;
    background-position: center center;
    display: inline-block;
    height: 7.5rem;
    width: 7.5rem;
    &.square {
    }
    &.round {
        border-radius: 50%;
    }
`;

export const isSprite = css`
    background-size: auto;
    background-repeat: no-repeat;
`;

export const pokemonItem = css`
    background: #111;
    border: 5px solid white;
    bottom: 0;
    height: 3rem;
    display: flex;
    justify-content: center;
    align-items: center;
    left: 12px;
    padding: 0.5rem;
    position: absolute;
    width: 3rem;
    z-index: 10;
    &.round {
        border-radius: 50%;
    }
    &.square {
        border-radius: 0;
    }
`;

export const minimal = css`
    min-width: 17rem;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    text-align: center;
`;

export const minimalPokemonInfo = css`
    background: transparent;
    display: flex;
    padding: 0;
    height: auto;
    width: auto;
    margin-left: 0;
`;

export const pokemonInfo = css`
    border-radius: 0 4px 4px 0;
    display: inline-block;
    background: #111;
    height: auto;
    min-height: 8rem;
    margin-left: -4rem;
    position: relative;
    width: 26rem;
    vertical-align: top;
    filter: drop-shadow(0 0 1px #111);
    padding-left: 4rem;
    border-radius: 0.25rem;
    overflow: hidden;
    span {
        margin: 0 0.25rem;
    }
`;

export const result_mobile = css`
    position: fixed !important;
    top: 25vh !important;
    left: 2vw !important;
    transform-origin: 0px center;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.33);
    z-index: 21 !important;
    margin-top: -14vh !important;
`;

export const result_download = css`
    position: fixed;
    bottom: 1rem;
    margin: 0 auto;
    z-index: 22 !important;
    width: 100px;
    left: calc(50% - 50px);
`;

/// v2 styles

export const result_wrapper = css`
    overflowy: scroll;
    width: 100%;
`;
