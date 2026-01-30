import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Hand, Square, Circle, Triangle, Star as StarIcon,
    Minus, ArrowRight, Type, Code, Grid, ZoomIn,
    ZoomOut, Maximize, Copy, Clipboard, Copy as DuplicateIcon,
    CheckSquare, FilePlus, FileText, Download, RotateCcw, RotateCw, Trash2
} from 'lucide-react';
import { useCanvasStore } from '../store/canvasStore';
import { useRecentSnapsStore } from '../store/recentSnapsStore';
import { toast } from 'sonner';

export interface Command {
    id: string;
    label: string;
    shortcut?: string;
    icon?: React.ReactNode;
    action: () => void;
    group: 'tools' | 'actions' | 'edit' | 'file';
}

export const useAppCommands = () => {
    const navigate = useNavigate();
    const {
        snap,
        setTool,
        tool,
        setShowGrid,
        showGrid,
        setZoom,
        zoom,
        copyToClipboard,
        pasteFromClipboard,
        duplicateElement,
        selectAll,
        undo,
        redo,
        deleteElement,
        selectElement,
        newSnap,
        exportSnap,
        importSnap,
        saveToHistory
    } = useCanvasStore();

    const { addRecentSnap } = useRecentSnapsStore();

    // File Operations
    const handleNewSnap = useCallback(() => {
        if (confirm('Create a new canvas? Unsaved changes will be lost.')) {
            if (snap.elements.length > 0) {
                addRecentSnap(snap);
            }
            newSnap({ title: 'Untitled', aspect: '16:9', width: 1920, height: 1080 });
            toast.success('New canvas created');
        }
    }, [snap, addRecentSnap, newSnap]);

    const handleImportFile = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.yvsnap';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                if (snap.elements.length > 0) {
                    addRecentSnap(snap);
                }
                saveToHistory();
                const reader = new FileReader();
                reader.onload = (evt) => {
                    const json = evt.target?.result as string;
                    importSnap(json);
                    toast.success('Project imported');
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }, [snap, addRecentSnap, saveToHistory, importSnap]);

    const handleExportFile = useCallback(() => {
        try {
            const json = exportSnap();
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `${snap.meta.title || 'canvas'}.yvsnap`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            addRecentSnap(snap);
            toast.success('Project exported');
        } catch (error) {
            console.error(error);
            toast.error('Export failed');
        }
    }, [exportSnap, snap, addRecentSnap]);

    const commands: Command[] = [
        // File
        {
            id: 'new',
            label: 'New Canvas',
            shortcut: 'Cmd+N',
            icon: <FilePlus className="w-4 h-4" />,
            action: handleNewSnap,
            group: 'file'
        },
        {
            id: 'open',
            label: 'Open File',
            shortcut: 'Cmd+O',
            icon: <FileText className="w-4 h-4" />,
            action: handleImportFile,
            group: 'file'
        },
        {
            id: 'save',
            label: 'Save Project',
            shortcut: 'Cmd+S',
            icon: <Download className="w-4 h-4" />,
            action: handleExportFile,
            group: 'file'
        },

        // Tools
        { id: 'select', label: 'Hand Tool', shortcut: 'H', icon: <Hand className="w-4 h-4" />, action: () => setTool('select'), group: 'tools' },
        { id: 'rectangle', label: 'Rectangle', shortcut: 'R', icon: <Square className="w-4 h-4" />, action: () => setTool('rectangle'), group: 'tools' },
        { id: 'ellipse', label: 'Ellipse', shortcut: 'O', icon: <Circle className="w-4 h-4" />, action: () => setTool('ellipse'), group: 'tools' },
        { id: 'polygon', label: 'Polygon', shortcut: 'P', icon: <Triangle className="w-4 h-4" />, action: () => setTool('polygon'), group: 'tools' },
        { id: 'star', label: 'Star', shortcut: 'S', icon: <StarIcon className="w-4 h-4" />, action: () => setTool('star'), group: 'tools' },
        { id: 'line', label: 'Line', shortcut: 'L', icon: <Minus className="w-4 h-4" />, action: () => setTool('line'), group: 'tools' },
        { id: 'arrow', label: 'Arrow', shortcut: 'A', icon: <ArrowRight className="w-4 h-4" />, action: () => setTool('arrow'), group: 'tools' },
        { id: 'text', label: 'Text', shortcut: 'T', icon: <Type className="w-4 h-4" />, action: () => setTool('text'), group: 'tools' },
        { id: 'code', label: 'Code Block', shortcut: 'C', icon: <Code className="w-4 h-4" />, action: () => setTool('code'), group: 'tools' },

        // Edit
        { id: 'undo', label: 'Undo', shortcut: 'Cmd+Z', icon: <RotateCcw className="w-4 h-4" />, action: undo, group: 'edit' },
        { id: 'redo', label: 'Redo', shortcut: 'Cmd+Shift+Z', icon: <RotateCw className="w-4 h-4" />, action: redo, group: 'edit' },
        { id: 'copy', label: 'Copy', shortcut: 'Cmd+C', icon: <Copy className="w-4 h-4" />, action: copyToClipboard, group: 'edit' },
        { id: 'paste', label: 'Paste', shortcut: 'Cmd+V', icon: <Clipboard className="w-4 h-4" />, action: pasteFromClipboard, group: 'edit' },
        { id: 'duplicate', label: 'Duplicate', shortcut: 'Cmd+D', icon: <DuplicateIcon className="w-4 h-4" />, action: duplicateElement, group: 'edit' },
        { id: 'select-all', label: 'Select All', shortcut: 'Cmd+A', icon: <CheckSquare className="w-4 h-4" />, action: selectAll, group: 'edit' },
        { id: 'delete', label: 'Delete', shortcut: 'Del', icon: <Trash2 className="w-4 h-4" />, action: () => deleteElement(), group: 'edit' },

        // Actions
        {
            id: 'toggle-grid',
            label: showGrid ? 'Hide Grid' : 'Show Grid',
            shortcut: 'Cmd+\'',
            icon: <Grid className="w-4 h-4" />,
            action: () => setShowGrid(!showGrid),
            group: 'actions'
        },
        {
            id: 'zoom-in',
            label: 'Zoom In',
            shortcut: 'Cmd++',
            icon: <ZoomIn className="w-4 h-4" />,
            action: () => setZoom(Math.min(zoom + 0.1, 3)),
            group: 'actions'
        },
        {
            id: 'zoom-out',
            label: 'Zoom Out',
            shortcut: 'Cmd+-',
            icon: <ZoomOut className="w-4 h-4" />,
            action: () => setZoom(Math.max(zoom - 0.1, 0.1)),
            group: 'actions'
        },
        {
            id: 'reset-zoom',
            label: 'Reset Zoom',
            shortcut: 'Cmd+0',
            icon: <Maximize className="w-4 h-4" />,
            action: () => setZoom(1),
            group: 'actions'
        }
    ];

    return { commands, handleNewSnap, handleImportFile, handleExportFile };
};
