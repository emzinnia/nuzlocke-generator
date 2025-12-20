import {
    Button,
    ButtonGroup,
    Card,
    Classes,
    Drawer,
    DrawerSize,
    H4,
    Intent,
    NonIdealState,
} from "@blueprintjs/core";
import { css, cx } from "emotion";
import * as React from "react";
import Dexie from "dexie";
import { useDispatch, useSelector } from "react-redux";
import { State } from "state";
import { isDarkModeSelector } from "selectors";
import { Skeleton } from "./Skeletons";
import { toggleDialog } from "actions";
import { getAppToaster } from "./appToaster";

const styles = {
    imagesDrawer: css`
        padding: 1.25rem;
        overflow-y: auto;
    `,
    header: css`
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
        flex-wrap: wrap;
        gap: 0.75rem;
    `,
    headerControls: css`
        display: flex;
        align-items: center;
        gap: 0.5rem;
    `,
    images: css`
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        min-height: 50vh;
        padding-bottom: 2rem;
    `,
    imageCard: css`
        width: calc(33.333% - 0.75rem);
        padding: 0 !important;
        overflow: hidden;
        
        @media (max-width: 720px) {
            width: calc(50% - 0.5rem);
        }
    `,
    imageWrapper: css`
        position: relative;
        height: 10rem;
        overflow: hidden;
        
        &:hover .image-overlay {
            opacity: 1;
        }
    `,
    imageInner: css`
        object-fit: cover;
        width: 100%;
        height: 100%;
        display: block;
    `,
    imageOverlay: css`
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        opacity: 0;
        transition: opacity 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    `,
    imageFooter: css`
        padding: 0.5rem 0.75rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        border-top: 1px solid rgba(128, 128, 128, 0.2);
    `,
    imageName: css`
        font-size: 0.8rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1;
        min-width: 0;
    `,
    loadMoreContainer: css`
        display: flex;
        justify-content: center;
        padding: 1rem 0;
    `,
    uploadWrapper: css`
        position: relative;
        display: inline-block;
    `,
    hiddenInput: css`
        cursor: pointer;
        opacity: 0;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
    `,
};

class NuzlockeGeneratorDB extends Dexie {
    public images: Dexie.Table<Image, number>;

    public constructor() {
        super("NuzlockeGenerator");
        this.version(1).stores({
            images: `++id, image, name`,
        });
        this.images = this.table("images");
    }
}

export const db = new NuzlockeGeneratorDB();
// db.version(1).stores({
//     // eslint-disable-next-line @typescript-eslint/quotes
//     images: `++id, image, name`
// });

export const getImagesPage = async (offset: number, limit: number) => {
    // Newest-first pagination; avoids loading all images + rendering them at once.
    return db.images.orderBy("id").reverse().offset(offset).limit(limit).toArray();
};

// Back-compat: other parts of the app expect an unpaginated list (e.g. custom image lookup).
export const getImages = async () => {
    return db.images.toArray();
};

/**
 * Fetch a single image by its stored name (fast path via indexed lookup).
 */
export const getImageByName = async (name: string) => {
    if (!name) return undefined;
    try {
        return await db.images.where("name").equals(name).first();
    } catch {
        return undefined;
    }
};

/**
 * Search images by name prefix (case-insensitive). Intended for lightweight UI search.
 */
export const searchImagesByNamePrefix = async (query: string, limit: number = 80) => {
    const q = query?.trim();
    if (!q) return [];
    try {
        // Dexie supports startsWithIgnoreCase on indexed fields.
        return await db.images.where("name").startsWithIgnoreCase(q).limit(limit).toArray();
    } catch {
        return [];
    }
};

export interface Image {
    id?: number;
    name?: string;
    image: string;
}

enum ImagesDrawerLayout {
    List = "list",
    Grid = "grid",
}

export function ImagesDrawerInner() {
    const [refresh, setRefresh] = React.useState<number | null>(null);
    const [images, setImages] = React.useState<Image[]>([]);
    const [offset, setOffset] = React.useState(0);
    const [hasMore, setHasMore] = React.useState(true);
    const [isLoading, setIsLoading] = React.useState(false);
    const toaster = React.useMemo(() => getAppToaster(), []);
    const [layoutView, setLayoutView] = React.useState<ImagesDrawerLayout>(
        ImagesDrawerLayout.Grid,
    );
    const isDarkMode = useSelector<State, State["style"]["editorDarkMode"]>(
        isDarkModeSelector,
    );

    const PAGE_SIZE = 40;

    const reload = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const firstPage = await getImagesPage(0, PAGE_SIZE);
            setImages(firstPage);
            setOffset(firstPage.length);
            setHasMore(firstPage.length === PAGE_SIZE);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadMore = React.useCallback(async () => {
        if (isLoading || !hasMore) return;
        setIsLoading(true);
        try {
            const nextPage = await getImagesPage(offset, PAGE_SIZE);
            setImages((prev) => [...prev, ...nextPage]);
            setOffset((prev) => prev + nextPage.length);
            setHasMore(nextPage.length === PAGE_SIZE);
        } finally {
            setIsLoading(false);
        }
    }, [hasMore, isLoading, offset]);

    React.useEffect(() => {
        void reload();
        setRefresh(null);
    }, [refresh, reload]);

    const deleteImage = (id: number) => async () => {
        try {
            const _deletion = await db.images.where("id").equals(id).delete();
            setRefresh(id);
        } catch (e) {
            toaster?.show({
                message: `Error deleting item ocurred. ${e}`,
                intent: Intent.DANGER,
            });
        }
    };

    const copyToClipboard = (name: string | undefined) => async () => {
        if (!name) return;
        try {
            await navigator.clipboard.writeText(name);
            toaster?.show({
                message: "Image name copied to clipboard!",
                intent: Intent.SUCCESS,
            });
        } catch {
            toaster?.show({
                message: "Failed to copy to clipboard",
                intent: Intent.DANGER,
            });
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e?.target?.files?.[0];
        if (!file) return;
        const size = file.size / 1024 / 1024;
        if (size > 0.5) {
            toaster?.show({
                message: `File size of 500KB exceeded. File was ${size.toFixed(2)}MB`,
                intent: Intent.DANGER,
            });
            return;
        }
        const reader = new FileReader();
        reader.onload = async () => {
            const id = await db.images.put({
                image: reader.result as string,
                name: file.name,
            });
            setRefresh(id);
            toaster?.show({
                message: "Upload successful!",
                intent: Intent.SUCCESS,
            });
        };
        reader.readAsDataURL(file);
    };

    return (
        <div
            className={cx(
                "images-drawer",
                styles.imagesDrawer,
                isDarkMode && Classes.DARK,
            )}
        >
            <header className={styles.header}>
                <H4 style={{ margin: 0 }}>Image Gallery</H4>
                <div className={styles.headerControls}>
                    <ButtonGroup>
                        <Button
                            icon="grid-view"
                            active={layoutView === ImagesDrawerLayout.Grid}
                            onClick={() => setLayoutView(ImagesDrawerLayout.Grid)}
                        >
                            Grid
                        </Button>
                        <Button
                            icon="list"
                            active={layoutView === ImagesDrawerLayout.List}
                            onClick={() => setLayoutView(ImagesDrawerLayout.List)}
                        >
                            List
                        </Button>
                    </ButtonGroup>
                    <div className={styles.uploadWrapper}>
                        <Button icon="upload" intent={Intent.PRIMARY}>
                            Upload Image
                        </Button>
                        <input
                            accept="image/*"
                            className={styles.hiddenInput}
                            onChange={handleFileUpload}
                            type="file"
                        />
                    </div>
                </div>
            </header>

            <div className={styles.images}>
                {images.length === 0 && !isLoading && (
                    <NonIdealState
                        icon="media"
                        title="No images uploaded"
                        description="Upload images to use as custom Pokemon artwork"
                    />
                )}
                {images?.map((image) => (
                    <Card key={image.id} className={styles.imageCard} elevation={1}>
                        <div className={styles.imageWrapper}>
                            <img
                                className={styles.imageInner}
                                src={image.image}
                                alt={image.name}
                                title={image.name}
                            />
                            <div className={cx("image-overlay", styles.imageOverlay)}>
                                <Button
                                    icon="clipboard"
                                    small
                                    onClick={copyToClipboard(image.name)}
                                    title="Copy name"
                                >
                                    Copy
                                </Button>
                                {image?.id && (
                                    <Button
                                        icon="trash"
                                        small
                                        intent={Intent.DANGER}
                                        onClick={deleteImage(image.id)}
                                        title="Delete image"
                                    >
                                        Delete
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className={styles.imageFooter}>
                            <span className={styles.imageName} title={image.name}>
                                {image.name}
                            </span>
                        </div>
                    </Card>
                ))}
            </div>

            {hasMore && (
                <div className={styles.loadMoreContainer}>
                    <Button
                        icon="more"
                        loading={isLoading}
                        onClick={() => void loadMore()}
                    >
                        Load more images
                    </Button>
                </div>
            )}
        </div>
    );
}

export function ImagesDrawer() {
    const isDarkMode = useSelector<State, State["style"]["editorDarkMode"]>(
        isDarkModeSelector,
    );
    const view = useSelector<State, State["view"]>((state) => state.view);
    const dispatch = useDispatch();
    const onClose = () => dispatch(toggleDialog("imageUploader"));

    return (
        <Drawer
            isOpen={view?.dialogs?.imageUploader}
            size={DrawerSize.STANDARD}
            className={isDarkMode ? Classes.DARK : ""}
            onClose={onClose}
        >
            <React.Suspense fallback={Skeleton}>
                <ImagesDrawerInner />
            </React.Suspense>
        </Drawer>
    );
}
