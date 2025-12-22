/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-function-type */
import {
    Button,
    Classes,
    InputGroup,
    Popover,
    Position,
    Spinner,
} from "components/ui/shims";
import { css, cx } from "emotion";
import * as React from "react";
import { useDispatch } from "react-redux";
import { toggleDialog } from "actions";
import {
    getImagesPage,
    searchImagesByNamePrefix,
    Image as DexieImage,
} from "./ImagesDrawer";

const styles = {
    popover: css`
        padding: 0.75rem;
        width: 24rem;
        max-width: 90vw;
    `,
    headerRow: css`
        display: flex;
        gap: 0.5rem;
        align-items: center;
    `,
    grid: css`
        margin-top: 0.75rem;
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 0.5rem;
        max-height: 18rem;
        overflow: auto;
        padding-right: 0.25rem;
    `,
    tile: css`
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding: 0.25rem;
        border-radius: 6px;
        cursor: pointer;
        user-select: none;

        &:hover {
            background: rgba(0, 0, 0, 0.06);
        }
    `,
    tileImg: css`
        width: 100%;
        height: 4.5rem;
        object-fit: cover;
        border-radius: 4px;
    `,
    tileLabel: css`
        font-size: 0.75rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: inherit;
    `,
    footerRow: css`
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 0.5rem;
    `,
    empty: css`
        margin-top: 0.75rem;
        color: rgba(0, 0, 0, 0.7);
        font-size: 0.9rem;
    `,
};

export interface DexieImagePickerPopoverProps {
    /** Called with the Dexie image name. */
    onSelect: (name: string) => void;
    /** Optional currently-selected name (used for title/tooltip). */
    selectedName?: string;
    /** Disable opening/selecting. */
    disabled?: boolean;
    /** Override button icon (defaults to "media"). */
    icon?: string;
    /** Tooltip text for the picker button. */
    tooltip?: string;
}

export function DexieImagePickerPopover({
    onSelect,
    selectedName,
    disabled,
    icon = "media",
    tooltip = "Pick from uploaded images",
}: DexieImagePickerPopoverProps) {
    const dispatch = useDispatch();
    const [isOpen, setIsOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [images, setImages] = React.useState<DexieImage[]>([]);
    const [offset, setOffset] = React.useState(0);
    const [hasMore, setHasMore] = React.useState(true);
    const [isLoading, setIsLoading] = React.useState(false);

    const openGallery = React.useCallback(() => {
        setIsOpen(false);
        dispatch(toggleDialog("imageUploader"));
    }, [dispatch]);

    const PAGE_SIZE = 40;

    const loadFirstPage = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const first = await getImagesPage(0, PAGE_SIZE);
            setImages(first);
            setOffset(first.length);
            setHasMore(first.length === PAGE_SIZE);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadMore = React.useCallback(async () => {
        if (isLoading || !hasMore) return;
        setIsLoading(true);
        try {
            const next = await getImagesPage(offset, PAGE_SIZE);
            setImages((prev) => [...prev, ...next]);
            setOffset((prev) => prev + next.length);
            setHasMore(next.length === PAGE_SIZE);
        } finally {
            setIsLoading(false);
        }
    }, [hasMore, isLoading, offset]);

    const runSearch = React.useCallback(async () => {
        const q = query.trim();
        if (!q) {
            // Revert to paged mode.
            await loadFirstPage();
            return;
        }
        setIsLoading(true);
        try {
            const results = await searchImagesByNamePrefix(q, 120);
            setImages(results);
            setHasMore(false);
            setOffset(results.length);
        } finally {
            setIsLoading(false);
        }
    }, [loadFirstPage, query]);

    React.useEffect(() => {
        if (!isOpen) return;
        // Reset state on open for predictable UX.
        setQuery("");
        void loadFirstPage();
    }, [isOpen, loadFirstPage]);

    const onPick = React.useCallback(
        (img: DexieImage) => {
            const name = img.name?.trim();
            if (!name) return;
            onSelect(name);
            setIsOpen(false);
        },
        [onSelect],
    );

    const content = (
        <div className={styles.popover}>
            <div className={styles.headerRow}>
                <InputGroup
                    fill
                    placeholder="Search uploaded images…"
                    value={query}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setQuery(e.target.value)
                    }
                    rightElement={
                        <Button
                            minimal
                            icon="search"
                            onClick={() => void runSearch()}
                            disabled={isLoading}
                        />
                    }
                />
            </div>

            {isLoading && images.length === 0 ? (
                <div style={{ display: "flex", justifyContent: "center", marginTop: "0.75rem" }}>
                    <Spinner size={24} />
                </div>
            ) : images.length === 0 ? (
                <div className={cx(styles.empty, Classes.TEXT_MUTED)}>
                    <p style={{ margin: 0 }}>No uploaded images yet.</p>
                    <Button
                        small
                        icon="folder-open"
                        onClick={openGallery}
                        style={{ marginTop: "0.5rem" }}
                    >
                        Open Gallery to Upload
                    </Button>
                </div>
            ) : (
                <>
                    <div className={cx(styles.grid, "has-nice-scrollbars")}>
                        {images
                            .filter((img) => (img.name ?? "").trim().length > 0)
                            .map((img) => (
                                <div
                                    key={img.id ?? img.name ?? img.image}
                                    className={styles.tile}
                                    role="button"
                                    tabIndex={0}
                                    title={img.name}
                                    onClick={() => onPick(img)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") onPick(img);
                                    }}
                                >
                                    <img
                                        className={styles.tileImg}
                                        src={img.image}
                                        alt={img.name}
                                    />
                                    <div className={styles.tileLabel}>
                                        {img.name}
                                    </div>
                                </div>
                            ))}
                    </div>
                    <div className={styles.footerRow}>
                        <Button
                            small
                            icon="folder-open"
                            onClick={openGallery}
                        >
                            Open Gallery
                        </Button>
                        {hasMore ? (
                            <Button
                                small
                                icon="more"
                                loading={isLoading}
                                onClick={() => void loadMore()}
                            >
                                Load more
                            </Button>
                        ) : null}
                    </div>
                </>
            )}
        </div>
    );

    return (
        <Popover
            isOpen={isOpen}
            onInteraction={(next) => setIsOpen(next)}
            position={Position.BOTTOM_RIGHT}
            content={content}
            minimal
            disabled={disabled}
        >
            <Button
                minimal
                icon={icon as any}
                disabled={disabled}
                title={tooltip}
                aria-label={tooltip}
            />
        </Popover>
    );
}


