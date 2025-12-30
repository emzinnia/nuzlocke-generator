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
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border-default);
    border-radius: 0.25rem;
    box-shadow: var(--shadow-sm);
    display: grid;
    grid-template-columns: minmax(180px, 1fr) 200px minmax(160px, 1fr) auto auto;
    gap: 0.5rem;
    list-style-type: none;
    margin: 0.5rem 0.25rem;
    padding: 0.5rem;
`;

export const checkpointsItem_dark = css`
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-default);
    box-shadow: var(--shadow-md);
`;

export const checkpointName = css`
    align-items: center;
    display: flex;
    gap: 0.5rem;

    input {
        flex: 1;
        min-width: 0;
    }
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
    color: var(--color-danger-500);
    opacity: 0.7;
    transition: opacity var(--duration-fast) var(--ease-in-out);
    
    &:hover {
        opacity: 1;
    }
`;
