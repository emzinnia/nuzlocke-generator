import { css } from "emotion";

export const iconBar = css`
    align-items: center;
    display: flex;
    margin-left: auto;
    gap: 0.25rem;
`;

export const copyButton = css`
    color: lightblue;
    margin-left: auto;
    cursor: pointer;
`;

export const evoMenuItem = css`
    cursor: pointer;
    padding: 0.5rem;
    width: 7rem;
    text-overflow: ellipsis;
    &:hover {
        background: #eee;
        transition: 300ms background;
    }
`;

export const moveInputWrapper = css`
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    flex-wrap: nowrap;
`;

export const moveEditButton = css`
    margin-top: 1rem;
    width: 20%;
`;
