import React from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import ContextMenu from './ContextMenu';
import type { ContextMenuSection } from './ContextMenu';
import {
    Copy,
    SquarePlus,
    Trash2,
    Combine,
    Ungroup as UngroupIcon,
    ArrowUpToLine,
    ArrowDownToLine,
    ClipboardPaste,
    Lock,
    Unlock,
    MousePointer2,
    Undo,
    Redo,
} from 'lucide-react';

const CanvasContextMenuOverlay: React.FC = () => {
    const contextMenu = useCanvasStore((state) => state.contextMenu);
    const setContextMenu = useCanvasStore((state) => state.setContextMenu);
    const snap = useCanvasStore((state) => state.snap);
    const selectedElementIds = useCanvasStore((state) => state.selectedElementIds);

    const copyToClipboard = useCanvasStore((state) => state.copyToClipboard);
    const duplicateElement = useCanvasStore((state) => state.duplicateElement);
    const pasteFromClipboard = useCanvasStore((state) => state.pasteFromClipboard);
    const deleteElement = useCanvasStore((state) => state.deleteElement);
    const groupSelection = useCanvasStore((state) => state.groupSelection);
    const ungroupSelection = useCanvasStore((state) => state.ungroupSelection);
    const bringToFront = useCanvasStore((state) => state.bringToFront);
    const sendToBack = useCanvasStore((state) => state.sendToBack);
    const updateElement = useCanvasStore((state) => state.updateElement);
    const selectAll = useCanvasStore((state) => state.selectAll);
    const undo = useCanvasStore((state) => state.undo);
    const redo = useCanvasStore((state) => state.redo);

    if (!contextMenu.isOpen) return null;

    const getContextMenuSections = (): ContextMenuSection[] => {
        const sections: ContextMenuSection[] = [];
        const hasSelection = selectedElementIds.length > 0;
        const selectedElements = snap.elements.filter((el) => selectedElementIds.includes(el.id));
        const anyLocked = selectedElements.some((el) => el.locked);
        const hasGroup = selectedElements.some((el) => el.type === 'group');

        // Section 1: Edit actions
        const editItems = [];
        if (hasSelection) {
            editItems.push({
                id: 'copy',
                label: 'Copy',
                icon: <Copy size={14} />,
                shortcut: 'Cmd+C',
                onClick: copyToClipboard,
            });
            editItems.push({
                id: 'duplicate',
                label: 'Duplicate',
                icon: <SquarePlus size={14} />,
                shortcut: 'Cmd+D',
                onClick: () => duplicateElement(),
            });
        }

        editItems.push({
            id: 'paste',
            label: 'Paste',
            icon: <ClipboardPaste size={14} />,
            shortcut: 'Cmd+V',
            onClick: () => {
                // We use the coordinates from the context menu state which were set on right-click
                // But we need to convert them to canvas coordinates or just use current mouse if we have it.
                // The store's pasteFromClipboard can take absolute coordinates.
                // However, the coordinates in contextMenu are screen relative.
                // We might need to pass canvas coordinates when setting the menu.
                // For now, let's just use the store's default paste if we can't easily get canvas coords here.
                pasteFromClipboard();
            },
        });

        if (hasSelection) {
            editItems.push({
                id: 'delete',
                label: 'Delete',
                icon: <Trash2 size={14} />,
                shortcut: 'Backspace',
                variant: 'danger' as const,
                onClick: () => deleteElement(),
            });
        }

        if (editItems.length > 0) sections.push({ items: editItems });

        // Section 2: Grouping / Order
        if (hasSelection) {
            const groupItems = [];

            if (selectedElementIds.length > 1) {
                groupItems.push({
                    id: 'group',
                    label: 'Group',
                    icon: <Combine size={14} />,
                    shortcut: 'Cmd+G',
                    onClick: groupSelection,
                });
            }

            if (hasGroup) {
                groupItems.push({
                    id: 'ungroup',
                    label: 'Ungroup',
                    icon: <UngroupIcon size={14} />,
                    shortcut: 'Cmd+Shift+G',
                    onClick: ungroupSelection,
                });
            }

            groupItems.push({
                id: 'front',
                label: 'Bring to Front',
                icon: <ArrowUpToLine size={14} />,
                shortcut: ']',
                onClick: bringToFront,
            });

            groupItems.push({
                id: 'back',
                label: 'Send to Back',
                icon: <ArrowDownToLine size={14} />,
                shortcut: '[',
                onClick: sendToBack,
            });

            sections.push({ items: groupItems });

            // Section 3: Lock
            sections.push({
                items: [
                    {
                        id: 'lock',
                        label: anyLocked ? 'Unlock' : 'Lock',
                        icon: anyLocked ? <Unlock size={14} /> : <Lock size={14} />,
                        shortcut: 'Cmd+L',
                        onClick: () => {
                            selectedElementIds.forEach((id) => {
                                const el = snap.elements.find((e) => e.id === id);
                                if (el) updateElement(id, { locked: !el.locked });
                            });
                        },
                    },
                ],
            });
        } else {
            // Empty canvas actions
            sections.push({
                items: [
                    {
                        id: 'undo',
                        label: 'Undo',
                        icon: <Undo size={14} />,
                        shortcut: 'Cmd+Z',
                        onClick: undo,
                    },
                    {
                        id: 'redo',
                        label: 'Redo',
                        icon: <Redo size={14} />,
                        shortcut: 'Cmd+Shift+Z',
                        onClick: redo,
                    },
                ],
            });

        }

        sections.push({
            items: [
                {
                    id: 'select-all',
                    label: 'Select All',
                    icon: <MousePointer2 size={14} />,
                    shortcut: 'Cmd+A',
                    onClick: selectAll,
                },
            ],
        });

        return sections;
    };

    return (
        <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            sections={getContextMenuSections()}
            onClose={() => setContextMenu({ isOpen: false })}
        />
    );
};

export default CanvasContextMenuOverlay;
