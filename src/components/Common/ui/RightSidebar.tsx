import * as React from "react";
import { fullGameData } from "utils/data/fullGameData";
import { ErrorBoundary } from "components/Common/Shared/ErrorBoundary";
import { FullGameDataView } from "components/Common/ui/FullGameDataView";

const MIN_WIDTH = 200;
const MAX_WIDTH = 500;
const DEFAULT_WIDTH = 256;
const STORAGE_KEY = "right-sidebar-width";

export const RightSidebar: React.FC = () => {
    const [width, setWidth] = React.useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
    });
    const [isResizing, setIsResizing] = React.useState(false);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    };

    React.useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            const newWidth = Math.min(
                MAX_WIDTH,
                Math.max(MIN_WIDTH, window.innerWidth - e.clientX)
            );
            setWidth(newWidth);
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            localStorage.setItem(STORAGE_KEY, width.toString());
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        document.body.style.userSelect = "none";
        document.body.style.cursor = "col-resize";

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.body.style.userSelect = "";
            document.body.style.cursor = "";
        };
    }, [isResizing, width]);

    return (
        <aside
            className="bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 h-screen relative flex-shrink-0 transition-colors flex flex-col group/sidebar"
            style={{ width }}
        >
            <div
                ref={scrollContainerRef}
                className="p-4 overflow-x-hidden overflow-y-auto flex-1 scrollbar-gutter-stable"
            >
                <ErrorBoundary errorMessage="Failed to load game data">
                    <FullGameDataView data={fullGameData} />
                </ErrorBoundary>
            </div>

            <div
                onMouseDown={handleMouseDown}
                className={`absolute top-0 left-0 w-1 h-full cursor-col-resize hover:bg-blue-400 transition-colors ${
                    isResizing ? "bg-blue-500" : "bg-transparent"
                }`}
                title="Drag to resize"
            />
        </aside>
    );
};

