import * as React from "react";
import { Popover, Position, Classes, Icon } from "@blueprintjs/core";
import { css } from "emotion";

const styles = {
    helpButton: css`
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.5rem;
        height: 1.5rem;
        border-radius: 50%;
        background: rgba(92, 112, 128, 0.15);
        color: #5c7080;
        cursor: pointer;
        font-size: 0.75rem;
        font-weight: 600;
        transition: all 0.15s ease;
        border: none;
        padding: 0;
        margin-left: 0.25rem;

        &:hover {
            background: rgba(92, 112, 128, 0.3);
            color: #394b59;
        }
    `,
    popoverContent: css`
        padding: 1rem;
        max-width: 420px;
        font-size: 0.85rem;
        line-height: 1.5;
    `,
    title: css`
        font-weight: 600;
        font-size: 1rem;
        margin-bottom: 0.75rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    `,
    section: css`
        margin-bottom: 0.75rem;

        &:last-child {
            margin-bottom: 0;
        }
    `,
    sectionTitle: css`
        font-weight: 600;
        font-size: 0.8rem;
        color: #5c7080;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 0.35rem;
    `,
    exampleGrid: css`
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.25rem 0.75rem;
    `,
    code: css`
        font-family: "SF Mono", "Consolas", "Monaco", monospace;
        font-size: 0.8rem;
        background: rgba(92, 112, 128, 0.1);
        padding: 0.1rem 0.35rem;
        border-radius: 3px;
        color: #137cbd;
    `,
    description: css`
        color: #5c7080;
        font-size: 0.8rem;
    `,
    fieldList: css`
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
        margin-top: 0.25rem;
    `,
    fieldTag: css`
        font-family: "SF Mono", "Consolas", "Monaco", monospace;
        font-size: 0.7rem;
        background: rgba(92, 112, 128, 0.1);
        padding: 0.15rem 0.4rem;
        border-radius: 3px;
        color: #394b59;
    `,
};

const SearchHelpContent: React.FC = () => (
    <div className={styles.popoverContent}>
        <div className={styles.title}>
            <Icon icon="search" />
            Search Syntax
        </div>

        {/* Basic Examples */}
        <div className={styles.section}>
            <div className={styles.sectionTitle}>Examples</div>
            <div className={styles.exampleGrid}>
                <code className={styles.code}>Br</code>
                <span className={styles.description}>
                    Name starts with &ldquo;Br&rdquo;
                </span>

                <code className={styles.code}>species:Feebas</code>
                <span className={styles.description}>Species is Feebas</span>

                <code className={styles.code}>type:dark</code>
                <span className={styles.description}>Has Dark type</span>

                <code className={styles.code}>gender:f</code>
                <span className={styles.description}>Female Pokémon</span>

                <code className={styles.code}>level&gt;=30</code>
                <span className={styles.description}>Level 30 or higher</span>

                <code className={styles.code}>level:10..25</code>
                <span className={styles.description}>Level between 10-25</span>

                <code className={styles.code}>shiny:yes</code>
                <span className={styles.description}>Shiny Pokémon</span>

                <code className={styles.code}>status:Dead</code>
                <span className={styles.description}>In the Dead box</span>
            </div>
        </div>

        {/* Operators */}
        <div className={styles.section}>
            <div className={styles.sectionTitle}>Operators</div>
            <div className={styles.exampleGrid}>
                <code className={styles.code}>!type:grass</code>
                <span className={styles.description}>NOT Grass type</span>

                <code className={styles.code}>type:dark | type:ghost</code>
                <span className={styles.description}>Dark OR Ghost type</span>

                <code className={styles.code}>type:fire gender:m</code>
                <span className={styles.description}>Fire AND male</span>

                <code className={styles.code}>nickname:*zard</code>
                <span className={styles.description}>
                    Wildcard (* = any, ? = one char)
                </span>
            </div>
        </div>

        {/* Available Fields */}
        <div className={styles.section}>
            <div className={styles.sectionTitle}>Available Fields</div>
            <div className={styles.fieldList}>
                {[
                    "species",
                    "nickname",
                    "type",
                    "gender",
                    "level",
                    "status",
                    "move",
                    "item",
                    "ability",
                    "nature",
                    "forme",
                    "game",
                    "shiny",
                    "egg",
                    "alpha",
                    "mvp",
                ].map((field) => (
                    <span key={field} className={styles.fieldTag}>
                        {field}
                    </span>
                ))}
            </div>
        </div>
    </div>
);

export interface SearchHelpPopoverProps {
    className?: string;
    style?: React.CSSProperties;
}

export const SearchHelpPopover: React.FC<SearchHelpPopoverProps> = ({
    className,
    style,
}) => {
    return (
        <Popover
            content={<SearchHelpContent />}
            position={Position.BOTTOM_RIGHT}
            popoverClassName={Classes.POPOVER_CONTENT_SIZING}
            interactionKind="click"
            minimal
        >
            <button
                type="button"
                className={`${styles.helpButton} ${className ?? ""}`}
                style={style}
                aria-label="Search help"
                title="Search syntax help"
            >
                ?
            </button>
        </Popover>
    );
};

