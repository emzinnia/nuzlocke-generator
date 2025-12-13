import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type HotkeyAction = 
    | 'toggleLeftSidebar'
    | 'toggleRightSidebar';

export interface HotkeyBinding {
    action: HotkeyAction;
    label: string;
    key: string;
    modifiers: {
        ctrl?: boolean;
        shift?: boolean;
        alt?: boolean;
        meta?: boolean;
    };
}

const DEFAULT_BINDINGS: HotkeyBinding[] = [
    {
        action: 'toggleLeftSidebar',
        label: 'Toggle Left Sidebar',
        key: '[',
        modifiers: { meta: true },
    },
    {
        action: 'toggleRightSidebar',
        label: 'Toggle Right Sidebar',
        key: ']',
        modifiers: { meta: true },
    },
];

interface HotkeysState {
    bindings: HotkeyBinding[];
    listeners: Map<HotkeyAction, Set<() => void>>;
    
    getBinding: (action: HotkeyAction) => HotkeyBinding | undefined;
    updateBinding: (action: HotkeyAction, key: string, modifiers: HotkeyBinding['modifiers']) => void;
    resetToDefaults: () => void;
    
    subscribe: (action: HotkeyAction, callback: () => void) => () => void;
    trigger: (action: HotkeyAction) => void;
}

function formatHotkey(binding: HotkeyBinding): string {
    const parts: string[] = [];
    if (binding.modifiers.ctrl) parts.push('Ctrl');
    if (binding.modifiers.alt) parts.push('Alt');
    if (binding.modifiers.shift) parts.push('Shift');
    if (binding.modifiers.meta) parts.push('⌘');
    parts.push(binding.key.toUpperCase());
    return parts.join('+');
}

function matchesEvent(binding: HotkeyBinding, event: KeyboardEvent): boolean {
    const keyMatches = event.key.toLowerCase() === binding.key.toLowerCase();
    const ctrlMatches = !!binding.modifiers.ctrl === (event.ctrlKey && !event.metaKey);
    const shiftMatches = !!binding.modifiers.shift === event.shiftKey;
    const altMatches = !!binding.modifiers.alt === event.altKey;
    const metaMatches = !!binding.modifiers.meta === event.metaKey;
    
    return keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches;
}

export const useHotkeysStore = create<HotkeysState>()(
    persist(
        (set, get) => ({
            bindings: DEFAULT_BINDINGS,
            listeners: new Map(),

            getBinding: (action: HotkeyAction) => {
                return get().bindings.find(b => b.action === action);
            },

            updateBinding: (action: HotkeyAction, key: string, modifiers: HotkeyBinding['modifiers']) => {
                set((state) => ({
                    bindings: state.bindings.map(b => 
                        b.action === action 
                            ? { ...b, key, modifiers }
                            : b
                    ),
                }));
            },

            resetToDefaults: () => {
                set({ bindings: DEFAULT_BINDINGS });
            },

            subscribe: (action: HotkeyAction, callback: () => void) => {
                const { listeners } = get();
                if (!listeners.has(action)) {
                    listeners.set(action, new Set());
                }
                listeners.get(action)!.add(callback);
                
                return () => {
                    listeners.get(action)?.delete(callback);
                };
            },

            trigger: (action: HotkeyAction) => {
                const { listeners } = get();
                listeners.get(action)?.forEach(callback => callback());
            },
        }),
        {
            name: 'hotkeys-storage',
            partialize: (state) => ({ bindings: state.bindings }),
        }
    )
);

export function useGlobalHotkeys() {
    const store = useHotkeysStore();
    
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.target instanceof HTMLInputElement || 
                event.target instanceof HTMLTextAreaElement) {
                return;
            }
            
            for (const binding of store.bindings) {
                if (matchesEvent(binding, event)) {
                    event.preventDefault();
                    store.trigger(binding.action);
                    break;
                }
            }
        };
        
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [store.bindings]);
}

import * as React from 'react';

export function useHotkeyListener(action: HotkeyAction, callback: () => void) {
    const subscribe = useHotkeysStore(state => state.subscribe);
    
    React.useEffect(() => {
        return subscribe(action, callback);
    }, [action, callback, subscribe]);
}

export { formatHotkey };

