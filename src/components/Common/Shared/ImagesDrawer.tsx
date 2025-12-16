import {
    Button,
    Classes,
    Drawer,
    DrawerSize,
    Icon,
    Intent,
    Toaster,
} from "@blueprintjs/core";
import { css, cx } from "emotion";
import * as React from "react";
import { ImageUpload } from "./ImageUpload";
import Dexie from "dexie";
import { useDispatch, useSelector } from "react-redux";
import { State } from "state";
import { isDarkModeSelector } from "selectors";
import { Skeleton } from "./Skeletons";
import { toggleDialog } from "actions";

// 'p-1 m-1 w-40 h-40 relative flex justify-center align-center overflow-y-auto'

const styles = {
    imagesDrawer: css`
        padding: 2rem;
    `,
    images: css`
        display: flex;
        flex-wrap: wrap;
        overflow: auto;
        min-height: 50vh;
        padding-bottom: 6rem;
        margin-top: 2rem;
        max-height: 100vh;
    `,
    image: css`
        margin-right: 1rem;
        margin-bottom: 1rem;
        width: calc(25% - 1rem);
        height: 14rem;
        justify-content: center;
        align-items: center;
        position: relative;
    `,
    imageCaption: css``,
    imageInner: css`
        object-fit: cover;
        width: 100%;
        height: 14rem;
    `,
    deleteIcon: css`
        margin-left: auto;
        cursor: pointer;
    `,
    input: css`
        width: 24rem;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-right: 1rem;
    `,
    inputGroup: css`
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        display: flex;
        padding: 0.5rem;
        align-items: center;
        justify-content: space-between;
        background: rgb(22, 22, 22);
    `,
    layoutViewIcon: css`
        cursor: pointer;
        margin: 0.25rem;
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

import { v4 as _uuid } from "uuid";

const _userImages = new Set<Image>();

export const getImagesPage = async (offset: number, limit: number) => {
    // Newest-first pagination; avoids loading all images + rendering them at once.
    return db.images.orderBy("id").reverse().offset(offset).limit(limit).toArray();
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
    const toasterRef = React.useRef(Toaster.create());
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

    const setLayout = React.useCallback(() => {
        setLayoutView(
            layoutView === ImagesDrawerLayout.List
                ? ImagesDrawerLayout.Grid
                : ImagesDrawerLayout.List,
        );
    }, [layoutView]);

    const deleteImage = (id: number) => async () => {
        try {
            const _deletion = await db.images.where("id").equals(id).delete();
            setRefresh(id);
        } catch (e) {
            toasterRef.current.show({
                message: `Error deleting item ocurred. ${e}`,
                intent: Intent.DANGER,
            });
        }
    };

    return (
        <div
            className={cx(
                "images-drawer",
                styles.imagesDrawer,
                isDarkMode && Classes.DARK,
            )}
        >
            <div className="p-2 relative">
                <ImageUpload
                    onSuccess={async (image, fileName) => {
                        const id = await db.images.put({
                            image: image,
                            name: fileName,
                        });
                        setRefresh(id);
                    }}
                />
                <span>
                    <Button
                        className={styles.layoutViewIcon}
                        onClick={setLayout}
                        icon={
                            layoutView === ImagesDrawerLayout.Grid
                                ? "list"
                                : "grid-view"
                        }
                    >
                        {layoutView === ImagesDrawerLayout.Grid
                            ? "List"
                            : "Grid"}
                    </Button>
                </span>
            </div>
            <div className={styles.images}>
                {images?.map((image) => (
                    <div key={image.id} className={styles.image}>
                        <img
                            className={styles.imageInner}
                            src={image.image}
                            alt={image.name}
                            title={image.name}
                        />
                        <div className={styles.inputGroup}>
                            <input
                                readOnly
                                className={cx(styles.input, Classes.INPUT)}
                                value={image.name}
                            />
                            {image?.id && (
                                <Icon
                                    className={styles.deleteIcon}
                                    onClick={deleteImage(image?.id)}
                                    icon="trash"
                                    intent={Intent.DANGER}
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {hasMore && (
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <Button
                        loading={isLoading}
                        onClick={() => void loadMore()}
                        icon="more"
                    >
                        Load more
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
