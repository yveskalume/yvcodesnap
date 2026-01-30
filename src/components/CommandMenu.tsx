import React, { useState, useEffect, useRef } from 'react';
import type { ToolId } from '../store/canvasStore';

interface Command {
    id: string;
    label: string;
    shortcut?: string;
    icon?: React.ReactNode;
    action: () => void;
    group: 'tools' | 'actions';
}

interface CommandMenuProps {
    isOpen: boolean;
    onClose: () => void;
    tool: ToolId;
    setTool: (tool: ToolId) => void;
    showGrid: boolean;
    setShowGrid: (show: boolean) => void;
    zoom: number;
    setZoom: (zoom: number) => void;
    onClearCanvas?: () => void;
}

export const CommandMenu: React.FC<CommandMenuProps> = ({
    isOpen,
    onClose,
    tool,
    setTool,
    showGrid,
    setShowGrid,
    zoom,
    setZoom,
    onClearCanvas,
}) => {
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    // Tool commands
    const toolCommands: Command[] = [
        {
            id: 'select',
            label: 'Hand Tool',
            shortcut: 'H',
            action: () => {
                setTool('select');
                onClose();
            },
            group: 'tools',
        },
        {
            id: 'rectangle',
            label: 'Rectangle',
            shortcut: 'R',
            action: () => {
                setTool('rectangle');
                onClose();
            },
            group: 'tools',
        },
        {
            id: 'ellipse',
            label: 'Ellipse',
            shortcut: 'O',
            action: () => {
                setTool('ellipse');
                onClose();
            },
            group: 'tools',
        },
        {
            id: 'polygon',
            label: 'Polygon',
            shortcut: 'P',
            action: () => {
                setTool('polygon');
                onClose();
            },
            group: 'tools',
        },
        {
            id: 'star',
            label: 'Star',
            shortcut: 'S',
            action: () => {
                setTool('star');
                onClose();
            },
            group: 'tools',
        },
        {
            id: 'line',
            label: 'Line',
            shortcut: 'L',
            action: () => {
                setTool('line');
                onClose();
            },
            group: 'tools',
        },
        {
            id: 'arrow',
            label: 'Arrow',
            shortcut: 'A',
            action: () => {
                setTool('arrow');
                onClose();
            },
            group: 'tools',
        },
        {
            id: 'text',
            label: 'Text',
            shortcut: 'T',
            action: () => {
                setTool('text');
                onClose();
            },
            group: 'tools',
        },
        {
            id: 'code',
            label: 'Code Block',
            shortcut: 'C',
            action: () => {
                setTool('code');
                onClose();
            },
            group: 'tools',
        },
    ];

    // Action commands
    const actionCommands: Command[] = [
        {
            id: 'toggle-grid',
            label: showGrid ? 'Hide Grid' : 'Show Grid',
            shortcut: 'Cmd+G',
            action: () => {
                setShowGrid(!showGrid);
                onClose();
            },
            group: 'actions',
        },
        {
            id: 'zoom-in',
            label: 'Zoom In',
            shortcut: 'Cmd++',
            action: () => {
                setZoom(Math.min(zoom + 0.1, 3));
                onClose();
            },
            group: 'actions',
        },
        {
            id: 'zoom-out',
            label: 'Zoom Out',
            shortcut: 'Cmd+-',
            action: () => {
                setZoom(Math.max(zoom - 0.1, 0.1));
                onClose();
            },
            group: 'actions',
        },
        {
            id: 'reset-zoom',
            label: 'Reset Zoom',
            shortcut: 'Cmd+0',
            action: () => {
                setZoom(1);
                onClose();
            },
            group: 'actions',
        },
    ];

    if (onClearCanvas) {
        actionCommands.push({
            id: 'clear-canvas',
            label: 'Clear Canvas',
            shortcut: 'Cmd+Shift+L',
            action: () => {
                onClearCanvas();
                onClose();
            },
            group: 'actions',
        });
    }

    const allCommands = [...toolCommands, ...actionCommands];

    // Filter commands based on search
    const filteredCommands = allCommands.filter((cmd) =>
        cmd.label.toLowerCase().includes(search.toLowerCase())
    );

    // Group filtered commands
    const toolResults = filteredCommands.filter((cmd) => cmd.group === 'tools');
    const actionResults = filteredCommands.filter((cmd) => cmd.group === 'actions');

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setSearch('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    }, [isOpen]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredCommands[selectedIndex]) {
                    filteredCommands[selectedIndex].action();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedIndex, filteredCommands, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-[640px] mx-4 bg-[#0f1117] rounded-2xl shadow-[0_16px_70px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Input */}
                <div className="p-4 border-b border-white/10">
                    <input
                        ref={inputRef}
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setSelectedIndex(0);
                        }}
                        placeholder="Type a command or search..."
                        className="w-full bg-transparent text-white text-lg placeholder:text-neutral-500 outline-none"
                    />
                </div>

                {/* Results */}
                <div className="max-h-[400px] overflow-y-auto py-2">
                    {filteredCommands.length === 0 ? (
                        <div className="px-4 py-8 text-center text-neutral-500">
                            No commands found
                        </div>
                    ) : (
                        <>
                            {/* Tools */}
                            {toolResults.length > 0 && (
                                <div className="mb-2">
                                    <div className="px-4 py-1.5 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                                        Tools
                                    </div>
                                    {toolResults.map((cmd) => {
                                        const globalIndex = filteredCommands.indexOf(cmd);
                                        // Check if this command corresponds to the current tool
                                        const isSelectedTool =
                                            (cmd.id === 'hand' && tool === 'select') ||
                                            cmd.id === tool;

                                        return (
                                            <button
                                                key={cmd.id}
                                                onClick={cmd.action}
                                                className={`w-full px-4 py-2.5 flex items-center justify-between transition-colors ${selectedIndex === globalIndex
                                                    ? 'bg-white/10'
                                                    : 'hover:bg-white/5'
                                                    } ${isSelectedTool ? 'text-blue-400' : ''}`}
                                            >
                                                <span className="text-white flex items-center gap-3">
                                                    {cmd.icon}
                                                    {cmd.label}
                                                </span>
                                                {cmd.shortcut && (
                                                    <span className="text-xs text-neutral-400 font-mono">
                                                        {cmd.shortcut}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Actions */}
                            {actionResults.length > 0 && (
                                <div>
                                    <div className="px-4 py-1.5 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                                        Actions
                                    </div>
                                    {actionResults.map((cmd) => {
                                        const globalIndex = filteredCommands.indexOf(cmd);
                                        return (
                                            <button
                                                key={cmd.id}
                                                onClick={cmd.action}
                                                className={`w-full px-4 py-2.5 flex items-center justify-between transition-colors ${selectedIndex === globalIndex
                                                    ? 'bg-white/10'
                                                    : 'hover:bg-white/5'
                                                    }`}
                                            >
                                                <span className="text-white flex items-center gap-3">
                                                    {cmd.icon}
                                                    {cmd.label}
                                                </span>
                                                {cmd.shortcut && (
                                                    <span className="text-xs text-neutral-400 font-mono">
                                                        {cmd.shortcut}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2.5 border-t border-white/10 flex items-center justify-between text-xs text-neutral-500">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                            <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono">↑</kbd>
                            <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono">↓</kbd>
                            Navigate
                        </span>
                        <span className="flex items-center gap-1.5">
                            <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono">↵</kbd>
                            Select
                        </span>
                    </div>
                    <span className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono">Esc</kbd>
                        Close
                    </span>
                </div>
            </div>
        </div>
    );
};
