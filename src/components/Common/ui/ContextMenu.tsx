import React, { useRef, useState, useCallback } from "react";
import { Popover } from "./Popover";

export interface ContextMenuProps {
    menu: React.ReactNode;
    children: React.ReactNode;
    menuClassName?: string;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
    menu,
    children,
    menuClassName = "",
}) => {
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setCoords({ x: e.clientX, y: e.clientY });
        setOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
        setCoords(null);
    }, []);

    return (
        <div ref={wrapperRef} onContextMenu={handleContextMenu} className="inline-block select-none">
            <Popover
                content={
                    <div className={`min-w-[120px] rounded bg-popover text-popover-foreground shadow border border-border ${menuClassName}`}>
                        {menu}
                    </div>
                }
                interactionKind="click-target-only"
                minimal
                popoverClassName=""
                onClose={handleClose}
            >
                <div>
                    {children}
                </div>
            </Popover>
            {open && coords && (
                <div
                    style={{
                        position: "fixed",
                        zIndex: 1000,
                        left: coords.x,
                        top: coords.y
                    }}
                    onClick={handleClose}
                >
                    <div
                        className={`min-w-[120px] rounded bg-popover text-popover-foreground shadow border border-border ${menuClassName}`}
                        onClick={e => {
                            e.stopPropagation();
                        }}
                    >
                        {menu}
                    </div>
                </div>
            )}
        </div>
    );
};
