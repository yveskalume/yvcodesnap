import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface ContextMenuItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    shortcut?: string;
    onClick: () => void;
    variant?: 'default' | 'danger';
    disabled?: boolean;
}

export interface ContextMenuSection {
    items: ContextMenuItem[];
}

interface ContextMenuProps {
    x: number;
    y: number;
    sections: ContextMenuSection[];
    onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, sections, onClose }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        // Delay attaching the listener to avoid catching the initial right-click event
        const timer = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 100); // 100ms is safer for most browsers

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    // Adjust position if menu goes off screen
    const adjustedX = Math.min(x, window.innerWidth - 220);
    const adjustedY = Math.min(y, window.innerHeight - 400);

    return createPortal(
        <div
            ref={menuRef}
            className="fixed z-[9999] min-w-[200px] bg-neutral-900/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl p-1 animate-in fade-in zoom-in duration-200"
            style={{ left: adjustedX, top: adjustedY }}
        >
            {sections.map((section, sectionIdx) => (
                <React.Fragment key={sectionIdx}>
                    {sectionIdx > 0 && <div className="my-1 border-t border-white/5" />}
                    <div className="space-y-0.5">
                        {section.items.map((item) => (
                            <button
                                key={item.id}
                                disabled={item.disabled}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    item.onClick();
                                    onClose();
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left ${item.disabled
                                    ? 'opacity-30 cursor-not-allowed'
                                    : item.variant === 'danger'
                                        ? 'text-red-400 hover:bg-red-400/10'
                                        : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <span className="shrink-0 opacity-70">
                                    {item.icon}
                                </span>
                                <span className="flex-1 font-medium">{item.label}</span>
                                {item.shortcut && (
                                    <span className="text-[10px] text-neutral-500 font-mono tracking-tighter uppercase ml-2 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                                        {item.shortcut}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </React.Fragment>
            ))}
        </div>,
        document.body
    );
};

export default ContextMenu;
