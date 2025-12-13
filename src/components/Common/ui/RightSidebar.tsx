import * as React from "react";
import { useParams } from "react-router-dom";
import { fullGameData } from "utils/data/fullGameData";
import { ErrorBoundary } from "components/Common/Shared/ErrorBoundary";
import { FullGameDataView } from "components/Common/ui/FullGameDataView";
import { GameSelector } from "components/Editors/GameEditor/GameSelector";
import { Icon } from "./Icon";
import { Button } from "./Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useHotkeyListener } from "hooks/useHotkeys";

const MIN_WIDTH = 0;
const MAX_WIDTH = 500;
const DEFAULT_WIDTH = 256;
const STORAGE_KEY = "right-sidebar-width";
const COLLAPSED_KEY = "right-sidebar-collapsed";

interface RightSidebarProps {
    onRunsChange?: () => void;
    isAuthenticated: boolean;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ onRunsChange, isAuthenticated }) => {
    const { id: runId } = useParams<{ id: string }>();
    const [isCollapsed, setIsCollapsed] = React.useState(() => {
        return localStorage.getItem(COLLAPSED_KEY) === "true";
    });
    const [width, setWidth] = React.useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        const parsed = saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
        return localStorage.getItem(COLLAPSED_KEY) === "true" ? 0 : parsed;
    });
    const [isResizing, setIsResizing] = React.useState(false);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const lastWidthRef = React.useRef<number>(width || DEFAULT_WIDTH);

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

    const handleCollapse = () => {
        lastWidthRef.current = width || DEFAULT_WIDTH;
        setIsCollapsed(true);
        setWidth(0);
        localStorage.setItem(COLLAPSED_KEY, "true");
    };

    const handleExpand = () => {
        setIsCollapsed(false);
        const nextWidth = lastWidthRef.current || DEFAULT_WIDTH;
        setWidth(nextWidth);
        localStorage.setItem(COLLAPSED_KEY, "false");
        localStorage.setItem(STORAGE_KEY, nextWidth.toString());
    };

    const handleToggle = React.useCallback(() => {
        if (isCollapsed) {
            handleExpand();
        } else {
            handleCollapse();
        }
    }, [isCollapsed]);

    useHotkeyListener('toggleRightSidebar', handleToggle);

    if (!isAuthenticated || !runId) {
        return null;
    }

    if (isCollapsed) {
        return (
            <Button
                onClick={handleExpand}
                variant="outline"
                className="fixed top-20 right-0 z-50 bg-sidebar text-sidebar-foreground border border-sidebar-border shadow w-6 h-8 !p-0 rounded-l hover:bg-sidebar/80 transition-colors flex items-center justify-center"
                aria-label="Open right sidebar"
            >
                <Icon icon={ChevronLeft} size={16} />
            </Button>
        );
    }

    return (
        <aside
            className="bg-sidebar text-sidebar-foreground border-l border-sidebar-border h-screen relative flex-shrink-0 transition-colors flex flex-col overflow-hidden group/sidebar"
            style={{ width }}
        >
            <div className="absolute top-4 left-0 z-20">
                <Button
                    onClick={handleCollapse}
                    variant="outline"
                    className="w-6 h-8 !p-0 bg-sidebar text-sidebar-foreground border border-sidebar-border rounded-r hover:bg-sidebar/80 flex items-center justify-center shadow"
                    aria-label="Collapse right sidebar"
                >
                    <Icon icon={ChevronRight} size={16} />
                </Button>
            </div>
            <div
                ref={scrollContainerRef}
                className="pt-12 pb-4 pr-4 pl-8 overflow-x-hidden overflow-y-auto flex-1 scrollbar-gutter-stable sidebar-scroll"
            >
                <div className="space-y-4">
                    {runId && (
                        <ErrorBoundary errorMessage="Ooops. Something failed...">
                            <GameSelector
                                runId={runId}
                                onGameUpdated={onRunsChange}
                            />
                        </ErrorBoundary>
                    )}
                    <ErrorBoundary errorMessage="Failed to load game data">
                        <FullGameDataView data={fullGameData} runId={runId} />
                    </ErrorBoundary>
                </div>
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

