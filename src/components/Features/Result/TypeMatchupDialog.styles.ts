import { css } from "emotion";

export const typeMatchupsCard = css`
    margin: 0;
    width: 100%;
    max-width: none;
`;

export const typeMatchups = css`
    --matchup-row-odd-bg: rgba(0, 0, 0, 0.03);
    --matchup-weak: #c23030;
    --matchup-resist: #0f9960;
    --matchup-immune: #8f398f;
    --matchup-neutral: #394b59;

    padding: 0;
    width: 100%;

    h3 {
        margin-bottom: 0.25rem;
    }

    :global(.bp5-dark) &,
    :global(.bp-3-dark) & {
        --matchup-row-odd-bg: rgba(255, 255, 255, 0.06);
        --matchup-weak: #ff6b6b;
        --matchup-resist: #6ee7b7;
        --matchup-immune: #c084fc;
        --matchup-neutral: #bfccd6;
    }
`;

export const typeMatchupsCaption = css`
    font-size: 0.9rem;
    opacity: 0.9;
    margin-bottom: 0.5rem;
`;

export const typeMatchupsTableWrapper = css`
    overflow-x: auto;
`;

export const matchupTable = css`
    width: auto;
    border-collapse: collapse;
    font-size: 10px;

    th,
    td {
        padding: 0;
        text-align: center;
        border: 1px solid rgba(0, 0, 0, 0.12);
    }

    :global(.bp5-dark) & th,
    :global(.bp5-dark) & td,
    :global(.bp-3-dark) & th,
    :global(.bp-3-dark) & td {
        border-color: rgba(255, 255, 255, 0.12);
    }

    tbody tr:nth-of-type(odd) {
        background: var(--matchup-row-odd-bg);
    }
`;

export const teamMatchupTable = css`
    width: 100%;
    font-size: 12px;

    th,
    td {
        padding: 10px 16px;
        text-align: center;
    }

    th:first-child,
    td:first-child {
        text-align: left;
        width: 80px;
    }

    th:not(:first-child),
    td:not(:first-child) {
        width: calc((100% - 80px) / 4);
    }
`;

export const sectionSpacing = css`
    padding-top: 12px;
`;

export const matchupMatrix = css`
    font-size: 12px;

    th {
        font-weight: 600;
        padding: 0.3rem;
    }

    thead th:not(.matchup-matrix-corner) {
        width: 36px;
        min-width: 36px;
    }

    tbody th {
        padding: 0.3rem 0.4rem;
    }
`;

export const matchupMatrixCorner = css`
    text-align: left;
    white-space: nowrap;
    padding: 0.3rem 0.5rem;
`;

export const typeHeaderCell = css`
    font-weight: 700;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

export const matchupMatrixCell = css`
    font-variant-numeric: tabular-nums;
    border-radius: 0;
    width: 36px;
    height: 32px;
    min-width: 36px;
    min-height: 32px;
    line-height: 32px;
    box-sizing: border-box;

    &[data-mult="2"] {
        background: rgba(15, 153, 96, 0.18);
    }

    &[data-mult="0.5"] {
        background: rgba(194, 48, 48, 0.14);
    }

    &[data-mult="0"] {
        background: rgba(137, 82, 204, 0.14);
    }

    :global(.bp5-dark) &,
    :global(.bp-3-dark) & {
        &[data-mult="2"] {
            background: rgba(110, 231, 183, 0.18);
        }
        &[data-mult="0.5"] {
            background: rgba(255, 107, 107, 0.16);
        }
        &[data-mult="0"] {
            background: rgba(192, 132, 252, 0.16);
        }
    }
`;

export const typeMatchupsLayout = css`
    display: flex;
    gap: 1rem;
    align-items: flex-start;
`;

export const typeMatchupsTeamPreview = css`
    min-width: 200px;
    max-width: 240px;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
`;

export const typeMatchupsTeamEntry = css`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.6rem !important;
`;

export const typeMatchupsMain = css`
    flex: 1;
    min-width: 0;
`;

export const typeMatchupsOther = css`
    margin-top: 0;
    flex-shrink: 0;
`;

export const typeMatchupsStatus = css`
    margin-bottom: 0.75rem;
`;

export const typeMatchupsStatusTitle = css`
    font-weight: 600;
    margin-bottom: 0.35rem;
`;

export const typeMatchupsStatusList = css`
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
`;

export const typeMatchupsOtherEntry = css`
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.5rem !important;
`;

export const typeMatchupsOptions = css`
    margin-bottom: 12px;
    display: flex;
    align-items: center;
`;

export const typeMatchupsOptionsHint = css`
    opacity: 0.7;
    margin-left: 8px;
`;

export const matchupCell = css`
    text-align: center;
`;

