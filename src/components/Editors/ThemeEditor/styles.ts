import { css } from "emotion";

export const main = css`
    display: flex;
    min-height: 70vh;
`;

export const header = css`
    background: #fff;
    border-top: 1px solid #eee;
    border-bottom: 1px solid #eee;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

export const header_dark = css`
    background: #394b59;
    border-top: 1px solid #111;
    border-bottom: 1px solid #111;
    padding: 0.5rem;
`;

export const sidebar = css`
    width: 30%;
`;

export const componentList = css`
    background: white;
    list-style-type: none;
    margin: 0;
    padding: 0;
`;

export const listItem = css`
    border-bottom: 1px solid #ccc;
    list-style-type: none;
    padding: 0.25rem;
`;

export const componentView = css`
    display: flex;
    width: 100%;
`;

export const componentResult = css`
    background-image: linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%);
    padding: 1rem;
    display: flex;
    justify-content: center;
    min-width: 33%;
    & *:hover {
        outline: 1px solid lightblue;
    }
`;

export const componentResult_dark = css`
    background-image: linear-gradient(
        to top,
        rgb(32, 40, 45) 0%,
        rgb(37, 50, 57) 100%
    );
    min-width: 33%;
    padding: 1rem;
    display: flex;
    justify-content: center;
`;

export const componentOptions = css`
    padding: 0.5rem;
`;

export const componentOption = css`
    align-items: center;
    display: flex;
    justify-content: space-between;
    padding: 0.5rem;
    .pt-label {
        margin: 0 !important;
        width: 60%;
    }
`;

export const componentOptionsLabel = css`
    margin: 0.5rem 0.25rem;
    font-weight: light;
    font-size: 120%;
    display: block;
`;

export const cssUnit = css``;

export const unitInput = css`
    width: 6rem;
`;

export const unitSelect = css`
    margin-right: 0.25rem;
    width: 4rem;
`;
