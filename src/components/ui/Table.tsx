/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-function-type */
import * as React from "react";

/**
 * Simple Table components to replace Blueprint Table
 * These provide a basic HTML table with editable cells
 */

export interface TableProps {
    numRows: number;
    numFrozenColumns?: number;
    children: React.ReactNode;
    className?: string;
}

export interface ColumnProps {
    name: string;
    cellRenderer: (rowIndex: number) => React.ReactNode;
}

export interface CellProps {
    children?: React.ReactNode;
    className?: string;
}

export interface EditableCellProps {
    value: string;
    onConfirm?: (value: string) => void;
    onChange?: (value: string) => void;
    className?: string;
}

// Cell component - simple wrapper for table cell content
export const Cell: React.FC<CellProps> = ({ children, className = "" }) => {
    return <span className={className}>{children}</span>;
};

// EditableCell component - input field for inline editing
export const EditableCell: React.FC<EditableCellProps> = ({
    value,
    onConfirm,
    onChange,
    className = "",
}) => {
    const [internalValue, setInternalValue] = React.useState(value);
    const [isEditing, setIsEditing] = React.useState(false);

    React.useEffect(() => {
        setInternalValue(value);
    }, [value]);

    const handleBlur = () => {
        setIsEditing(false);
        if (internalValue !== value) {
            onConfirm?.(internalValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.currentTarget.blur();
        } else if (e.key === "Escape") {
            setInternalValue(value);
            setIsEditing(false);
        }
    };

    if (isEditing) {
        return (
            <input
                type="text"
                value={internalValue}
                onChange={(e) => {
                    setInternalValue(e.target.value);
                    onChange?.(e.target.value);
                }}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                autoFocus
                className={`w-full px-1 py-0.5 text-xs border border-primary-500 rounded outline-none ${className}`}
            />
        );
    }

    return (
        <span
            onClick={() => setIsEditing(true)}
            className={`cursor-text block truncate ${className}`}
            title={internalValue}
        >
            {internalValue || <span className="text-fg-tertiary italic">—</span>}
        </span>
    );
};

// JSONFormat component - renders JSON nicely
export const JSONFormat: React.FC<{ children: object | null | undefined }> = ({ children }) => {
    if (children == null) return <span className="text-fg-tertiary">null</span>;
    try {
        const str = JSON.stringify(children, null, 2);
        return (
            <pre className="text-xs whitespace-pre-wrap max-w-xs overflow-hidden text-ellipsis">
                {str.length > 50 ? str.slice(0, 50) + "..." : str}
            </pre>
        );
    } catch {
        return <span className="text-fg-tertiary">[Object]</span>;
    }
};

// Column component - defines a table column
export const Column: React.FC<ColumnProps> = () => {
    // Column is a declarative component, rendering happens in Table
    return null;
};

// Table component - main table wrapper
export const Table: React.FC<TableProps> = ({
    numRows,
    numFrozenColumns = 0,
    children,
    className = "",
}) => {
    // Extract columns from children
    const columns = React.Children.toArray(children)
        .filter((child): child is React.ReactElement<ColumnProps> => 
            React.isValidElement(child) && (child.type as any) === Column
        )
        .map((child) => ({
            name: child.props.name,
            cellRenderer: child.props.cellRenderer,
        }));

    // Generate row indices
    const rowIndices = Array.from({ length: numRows }, (_, i) => i);

    return (
        <div className={`overflow-auto max-h-[600px] ${className}`}>
            <table className="min-w-full border-collapse text-sm">
                <thead className="sticky top-0 bg-bg-secondary z-10">
                    <tr>
                        {columns.map((col, colIdx) => (
                            <th
                                key={col.name}
                                className={`px-2 py-1.5 text-left font-semibold text-fg-primary border-b border-border whitespace-nowrap ${
                                    colIdx < numFrozenColumns ? "sticky left-0 bg-bg-secondary z-20" : ""
                                }`}
                                style={colIdx < numFrozenColumns ? { left: colIdx * 100 } : undefined}
                            >
                                {col.name}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rowIndices.map((rowIdx) => (
                        <tr
                            key={rowIdx}
                            className="hover:bg-bg-secondary/50 border-b border-border/50"
                        >
                            {columns.map((col, colIdx) => (
                                <td
                                    key={`${rowIdx}-${col.name}`}
                                    className={`px-2 py-1 text-fg-primary max-w-[200px] ${
                                        colIdx < numFrozenColumns ? "sticky left-0 bg-bg-primary z-10" : ""
                                    }`}
                                    style={colIdx < numFrozenColumns ? { left: colIdx * 100 } : undefined}
                                >
                                    {col.cellRenderer(rowIdx)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// CellRenderer type for compatibility
export type CellRenderer = (rowIndex: number) => React.ReactNode;

