import { Button, Drawer, DrawerSize } from "components/Common/ui";
import { toast } from "components/Common/ui/Toast";
import { Trash2 } from "lucide-react";
import { css, cx } from "emotion";
import * as React from "react";
import { ImageUpload } from "./ImageUpload";
import Dexie from "dexie";
import { useDispatch, useSelector } from "react-redux";
import { State } from "state";
import { isDarkModeSelector } from "selectors";
import { Skeleton } from "./Skeletons";
import { toggleDialog } from "actions";

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

import { v4 as _uuid } from "uuid";

const _userImages = new Set<Image>();

export const getImages = async () => {
    const images = await db.images.toArray();

    console.log(images);

    return images;
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
    const [images, setImages] = React.useState<Image[]>();
    const [layoutView, setLayoutView] = React.useState<ImagesDrawerLayout>(
        ImagesDrawerLayout.Grid,
    );
    const isDarkMode = useSelector<State, State["style"]["editorDarkMode"]>(
        isDarkModeSelector,
    );

    React.useEffect(() => {
        (async () => setImages(await getImages()))();
        setRefresh(null);
    }, [refresh]);

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
            toast.error(`Error deleting item ocurred. ${e}`);
        }
    };

    return (
        <div
            className={cx(
                "images-drawer",
                styles.imagesDrawer,
                isDarkMode && "dark",
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
                                className={cx(styles.input, "px-2 py-1.5 text-sm border border-border bg-input text-foreground rounded-md")}
                                value={image.name}
                            />
                            {image?.id && (
                                <Trash2
                                    size={16}
                                    className={cx(styles.deleteIcon, "text-red-500")}
                                    onClick={deleteImage(image?.id)}
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>
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
            className={isDarkMode ? "dark" : ""}
            onClose={onClose}
        >
            <React.Suspense fallback={Skeleton}>
                <ImagesDrawerInner />
            </React.Suspense>
        </Drawer>
    );
}
