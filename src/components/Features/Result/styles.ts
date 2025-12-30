import { css } from "emotion";

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
