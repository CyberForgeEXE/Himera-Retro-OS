import React, { useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import Window from './Window';
import Taskbar from './Dock';
import { UI_TEXT } from '../constants';
import DraggableDesktopIcon from './DraggableDesktopIcon';
import Clock from './Clock';
import { WindowInstance } from '../types';
import SystemMenu from './StartMenu';

// App components
import TerminalApp from './apps/TerminalApp';
import NotepadApp from './apps/NotepadApp';
import SettingsApp from './apps/SettingsApp';
import BlogApp from './apps/BlogApp';
import ContactApp from './apps/ContactApp';
import SnakeApp from './apps/SnakeApp';
import MinesweeperApp from './apps/MinesweeperApp';
import PacmanApp from './apps/PacmanApp';
import FileExplorerApp from './apps/FileExplorerApp';
import WebPageApp from './apps/WebPageApp';
import UpdaterApp from './apps/UpdaterApp';
import CodeExecutorApp from './apps/CodeExecutorApp';
import BioApp from './apps/BioApp';

const getAppComponent = (win: WindowInstance) => {
    switch (win.appType) {
        case 'Terminal': return <TerminalApp />;
        case 'Notepad': return <NotepadApp />;
        case 'Settings': return <SettingsApp />;
        case 'Blog': return <BlogApp />;
        case 'Contact': return <ContactApp />;
        case 'Snake': return <SnakeApp windowId={win.id} />;
        case 'Minesweeper': return <MinesweeperApp windowId={win.id} />;
        case 'Pacman': return <PacmanApp windowId={win.id} />;
        case 'FileExplorer': return <FileExplorerApp data={win.data} windowId={win.id} />;
        case 'WebPage': return <WebPageApp data={win.data} />;
        case 'Updater': return <UpdaterApp />;
        case 'CodeExecutor': return <CodeExecutorApp />;
        case 'Bio': return <BioApp />;
        default: return null;
    }
}

const Desktop: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { isAdmin, language, windows, desktopItems, settings, isSelecting } = state;
    const text = UI_TEXT[language];
    const longPressTimerRef = useRef<number | null>(null);
    
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        dispatch({ type: 'HIDE_SYSTEM_MENU' }); 
        dispatch({ type: 'HIDE_CONTEXT_MENU' }); 
        
        const targetIcon = (e.target as HTMLElement).closest('.draggable-icon');
        const targetId = targetIcon ? targetIcon.getAttribute('data-id') || undefined : undefined;
        
        dispatch({ type: 'SHOW_CONTEXT_MENU', payload: { x: e.clientX, y: e.clientY, targetId } });
    };

    const handleInteractionStart = (x: number, y: number, isTouch: boolean) => {
        dispatch({ type: 'HIDE_CONTEXT_MENU' });
        dispatch({ type: 'HIDE_SYSTEM_MENU' });

        if (isTouch) {
            longPressTimerRef.current = window.setTimeout(() => {
                longPressTimerRef.current = null;
                // Check if the long press was on an icon
                const targetIcon = (document.elementFromPoint(x, y) as HTMLElement)?.closest('.draggable-icon');
                const targetId = targetIcon ? targetIcon.getAttribute('data-id') || undefined : undefined;
                dispatch({ type: 'SHOW_CONTEXT_MENU', payload: { x, y, targetId } });
            }, 500);
        } else {
            // Only start selection for non-touch (mouse) events
            dispatch({ type: 'START_SELECTION', payload: { x, y } });
        }
    };
    
    const handleInteractionMove = (x: number, y: number) => {
         if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
        if (isSelecting) {
            dispatch({ type: 'UPDATE_SELECTION', payload: { x, y } });
        }
    };

    const handleInteractionEnd = () => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
        // End selection regardless of input type. For touch, this handles deselecting.
        if (isSelecting || state.desktopItems.some(i => i.isSelected)) {
            dispatch({ type: 'END_SELECTION' });
        }
    };
    
    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.draggable-icon, .window-component, .context-menu-component, .system-menu-component')) {
            if (e.button !== 2) {
                dispatch({ type: 'HIDE_CONTEXT_MENU' });
                if (!(e.target as HTMLElement).closest('.system-menu-component')) {
                    dispatch({ type: 'HIDE_SYSTEM_MENU' });
                }
            }
            return;
        }

        if (e.button === 0) {
            handleInteractionStart(e.clientX, e.clientY, false);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => handleInteractionMove(e.clientX, e.clientY);

    const handleTouchStart = (e: React.TouchEvent) => {
        if ((e.target as HTMLElement).closest('.draggable-icon, .window-component, .context-menu-component, .system-menu-component')) {
            // Let icon/window touch handlers manage their own logic
            if (!(e.target as HTMLElement).closest('.system-menu-component')) {
                dispatch({ type: 'HIDE_SYSTEM_MENU' });
            }
            dispatch({ type: 'HIDE_CONTEXT_MENU' });
            return;
        }
        const touch = e.touches[0];
        handleInteractionStart(touch.clientX, touch.clientY, true);
    };
    
    const handleTouchMove = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        handleInteractionMove(touch.clientX, touch.clientY);
    };

  return (
    <div 
        className="relative w-full h-full" 
        onContextMenu={handleContextMenu}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleInteractionEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleInteractionEnd}
    >
      {isAdmin && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 font-display text-sm text-red-500 animate-pulse bg-black/50 p-1 rounded z-[950]">
              {text.adminMode}
          </div>
      )}
      
      <main className="absolute inset-0 p-4">
        <div className="relative w-full h-full">
            {desktopItems
                .filter(item => {
                    // Hide admin-only apps if not admin
                    if ((item.iconType === 'Updater' || item.iconType === 'CodeExecutor') && !isAdmin) {
                        return false;
                    }
                    return true;
                })
                .map(item => (
                <DraggableDesktopIcon 
                    key={item.id}
                    item={item}
                />
            ))}
        </div>
      </main>

      {windows.map(win => (
        <Window
          key={win.id}
          id={win.id}
          title={win.title}
          position={win.position}
          size={win.size}
          initialSize={win.initialSize || win.size}
          zIndex={win.zIndex}
          isMinimized={win.isMinimized}
        >
          {getAppComponent(win)}
        </Window>
      ))}
      
      {settings.clock.position === 'center' && <Clock isTaskbarClock={false} size={settings.clock.size} />}
      
      <SystemMenu />
      <Taskbar />
    </div>
  );
};

export default Desktop;