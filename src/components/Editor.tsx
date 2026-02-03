import { useRef, useEffect, useCallback } from 'react';
import type Konva from 'konva';
import { useNavigate } from 'react-router-dom';
import Canvas from './Canvas';
import TopBar from './TopBar';
import Toolbar from './Toolbar';
import Inspector from './Inspector';
import LayersPanel from './LayersPanel';
import FontLoader from './FontLoader';
import { useCanvasStore } from '../store/canvasStore';
import { useRecentSnapsStore } from '../store/recentSnapsStore';
import { Toaster } from 'sonner';
import { useAppCommands } from '../hooks/useAppCommands';

export default function Editor() {
    const stageRef = useRef<Konva.Stage>(null);
    const navigate = useNavigate();
    const { snap, selectElement } = useCanvasStore();
    const { addRecentSnap } = useRecentSnapsStore();

    const { commands } = useAppCommands();

    // Handle going back to main screen
    const handleGoToMainScreen = useCallback(() => {
        if (snap.elements.length > 0) {
            addRecentSnap(snap);
        }
        navigate('/');
    }, [snap, addRecentSnap, navigate]);

    // Global Keyboard Shortcuts Binding
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if input is focused
            const active = document.activeElement;
            const isInputFocused =
                active?.tagName === 'INPUT' ||
                active?.tagName === 'TEXTAREA' ||
                active?.tagName === 'SELECT' ||
                active?.isContentEditable;
            if (isInputFocused) return;

            const isMeta = e.metaKey || e.ctrlKey;
            const isShift = e.shiftKey;

            // Special case for Esc (handled differently in commands list usually, or we check mapping)
            if (e.key === 'Escape') {
                selectElement(null);
                return;
            }

            // Check against commands
            // A simple mapper or check. Since we have a small list, we can iterate or build a map.
            // Modifiers string construction:
            // "Cmd+N", "Cmd+Shift+Z", "Del", "H", etc.

            // Helper to match event to shortcut string
            const matchShortcut = (shortcut: string | undefined) => {
                if (!shortcut) return false;

                const parts = shortcut.split('+');
                const key = parts[parts.length - 1].toLowerCase();

                const hasCmd = parts.includes('Cmd');
                const hasShift = parts.includes('Shift');

                // Check modifiers
                if (hasCmd !== isMeta) return false;
                if (hasShift !== isShift) return false;

                // Check key
                if (key === 'del' && (e.key === 'Delete' || e.key === 'Backspace')) return true;
                if (e.key.toLowerCase() === key) return true;
                // Handle symbols like +, -, =, '
                if (key === '+' && (e.key === '+' || e.key === '=')) return true;
                if (key === '-' && e.key === '-') return true;
                if (key === '\'' && (e.key === '\'' || e.key === ';')) return true; // Mapping ; to ' for grid if needed or keep ; logic

                return false;
            };

            for (const cmd of commands) {
                if (matchShortcut(cmd.shortcut)) {
                    e.preventDefault();
                    cmd.action();
                    return;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [commands, selectElement]);

    return (
        <div className="h-screen flex flex-col bg-[#09090b] text-white">
            <FontLoader />
            <Toaster theme="dark" position="top-center" toastOptions={{ duration: 2600 }} />
            <TopBar stageRef={stageRef} onGoHome={handleGoToMainScreen} />
            <div className="flex-1 flex overflow-hidden">
                <LayersPanel />
                <Toolbar />
                <Canvas stageRef={stageRef} />
                <Inspector />
            </div>
        </div>
    );
}
