/**
 * Tabs Component
 *
 * A tabs component built with native HTML and React.
 * Provides Blueprint-compatible API.
 */

import * as React from "react";

export interface TabProps {
    /** Unique tab ID */
    id: string;
    /** Tab title */
    title: React.ReactNode;
    /** Tab panel content */
    panel?: React.ReactNode;
    /** Whether the tab is disabled */
    disabled?: boolean;
    /** Additional class name */
    className?: string;
    /** Icon for the tab */
    icon?: React.ReactNode;
}

export const Tab: React.FC<TabProps> = ({ id, title, panel, disabled, className, icon }) => {
    // Tab is just a data component, rendering is handled by Tabs
    return null;
};

export interface TabsProps {
    /** Unique tabs container ID */
    id: string;
    /** Currently selected tab ID */
    selectedTabId?: string;
    /** Default selected tab ID (uncontrolled) */
    defaultSelectedTabId?: string;
    /** Change handler */
    onChange?: (newTabId: string, prevTabId: string | undefined, event: React.MouseEvent<HTMLElement>) => void;
    /** Whether to display vertically */
    vertical?: boolean;
    /** Whether to use large styling */
    large?: boolean;
    /** Whether to animate the indicator */
    animate?: boolean;
    /** Whether tabs should fill container */
    fill?: boolean;
    /** Additional class name */
    className?: string;
    /** Tab children */
    children?: React.ReactNode;
    /** Render props for active panel (alternative to panel prop on Tab) */
    renderActiveTabPanelOnly?: boolean;
}

export const Tabs: React.FC<TabsProps> = ({
    id,
    selectedTabId: controlledSelectedTabId,
    defaultSelectedTabId,
    onChange,
    vertical = false,
    large = false,
    animate = true,
    fill = false,
    className = "",
    children,
    renderActiveTabPanelOnly = true,
}) => {
    // Extract Tab children
    const tabs = React.Children.toArray(children).filter(
        (child): child is React.ReactElement<TabProps> =>
            React.isValidElement(child) && (child.type as any) === Tab
    );

    const [internalSelectedTabId, setInternalSelectedTabId] = React.useState<string | undefined>(
        defaultSelectedTabId || tabs[0]?.props.id
    );

    const selectedTabId = controlledSelectedTabId !== undefined ? controlledSelectedTabId : internalSelectedTabId;

    const handleTabClick = (tabId: string, event: React.MouseEvent<HTMLElement>) => {
        const prevTabId = selectedTabId;
        if (controlledSelectedTabId === undefined) {
            setInternalSelectedTabId(tabId);
        }
        onChange?.(tabId, prevTabId, event);
    };

    const selectedTab = tabs.find((tab) => tab.props.id === selectedTabId);

    return (
        <div className={`${vertical ? "flex" : ""} ${className}`}>
            {/* Tab list */}
            <div
                role="tablist"
                aria-orientation={vertical ? "vertical" : "horizontal"}
                className={`${
                    vertical
                        ? "flex flex-col border-r border-gray-200 dark:border-gray-700"
                        : "flex border-b border-gray-200 dark:border-gray-700"
                } ${fill ? "flex-1" : ""}`}
            >
                {tabs.map((tab) => (
                    <button
                        key={tab.props.id}
                        role="tab"
                        type="button"
                        aria-selected={tab.props.id === selectedTabId}
                        aria-controls={`${id}-panel-${tab.props.id}`}
                        aria-disabled={tab.props.disabled}
                        tabIndex={tab.props.id === selectedTabId ? 0 : -1}
                        onClick={(e) => !tab.props.disabled && handleTabClick(tab.props.id, e)}
                        className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                            fill ? "flex-1 justify-center" : ""
                        } ${large ? "py-3 text-base" : ""} ${
                            tab.props.disabled
                                ? "cursor-not-allowed text-gray-400"
                                : tab.props.id === selectedTabId
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                        } ${tab.props.className || ""}`}
                    >
                        {tab.props.icon}
                        {tab.props.title}
                        {/* Active indicator */}
                        {tab.props.id === selectedTabId && (
                            <span
                                className={`absolute bg-blue-500 ${
                                    vertical
                                        ? "right-0 top-0 bottom-0 w-0.5"
                                        : "bottom-0 left-0 right-0 h-0.5"
                                } ${animate ? "transition-all" : ""}`}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab panels */}
            <div className={`${vertical ? "flex-1 pl-4" : "pt-4"}`}>
                {renderActiveTabPanelOnly ? (
                    selectedTab?.props.panel && (
                        <div
                            id={`${id}-panel-${selectedTab.props.id}`}
                            role="tabpanel"
                            aria-labelledby={selectedTab.props.id}
                            tabIndex={0}
                        >
                            {selectedTab.props.panel}
                        </div>
                    )
                ) : (
                    tabs.map((tab) => (
                        <div
                            key={tab.props.id}
                            id={`${id}-panel-${tab.props.id}`}
                            role="tabpanel"
                            aria-labelledby={tab.props.id}
                            tabIndex={0}
                            hidden={tab.props.id !== selectedTabId}
                        >
                            {tab.props.panel}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Tabs;
