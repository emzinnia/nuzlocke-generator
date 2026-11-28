import { css } from "emotion";

export const checkpointsEditor = css`
    overflow-x: hidden;
`;

export const checkpointsList = css`
    height: 60vh;
    margin: 0;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0;
`;

export const checkpointsItem = css`
    align-items: center;
    background: #fff;
    border: 1px solid #eee;
    border-radius: 0.25rem;
    box-shadow: 0 0 0.25rem #ddd;
    display: flex;
    justify-content: space-between;
    list-style-type: none;
    margin: 0.25rem;
    padding: 0.25rem;
`;

export const checkpointsItem_dark = css`
    background: rgba(0, 0, 0, 0.33);
    border: 1px solid rgba(0, 0, 0, 0.25);
    box-shadow: 0 0 0.25rem #222;
`;

export const checkpointName = css`
    align-items: center;
    display: flex;
    justify-content: space-around;
`;

export const checkpointImage = (size = 2) => css`
    display: inline-block;
    width: ${size}rem;
    margin: 0 0.25rem;
`;

export const checkpointSelect = css`
    align-items: center;
    width: 200px;
`;

export const checkpointImageUploadWrapper = css`
    align-items: center;
    margin: 0.25rem;
    position: relative;
`;

export const checkpointButtons = css`
    padding: 1rem;
`;

export const checkpointDelete = css`
    color: red;
`;
