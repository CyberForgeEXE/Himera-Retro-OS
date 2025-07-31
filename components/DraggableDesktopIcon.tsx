import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useDraggable } from '../hooks/useDraggable';
import { DesktopItem } from '../types';
import { AppIcon } from './Icons';

interface DraggableDesktopIconProps {
  item: DesktopItem;
}

const DraggableDesktopIconComponent: React.FC<DraggableDesktopIconProps> = ({ item }) => {
  const { state, dispatch } = useAppContext();
  const { settings } = state;
  const iconRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [tempLabel, setTempLabel] = useState(item.label);
  
  const longPressTimerRef = useRef<number | null>(null);
  const lastTapRef = useRef<number>(0);

  const handleDragEnd = useCallback((position: { x: number; y: number }) => {
    if(item.isRenaming) return;
    dispatch({ type: 'MOVE_DESKTOP_ITEM', payload: { id: item.id, position } });
  }, [dispatch, item.id, item.isRenaming]);

  const { handleDragStart } = useDraggable({
    handleRef: iconRef,
    targetRef: iconRef,
    onDragEnd: handleDragEnd,
    initialPosition: item.position,
  });
  
  const openItem = () => {
    if(item.isRenaming) return;
    dispatch({ type: 'EXECUTE_COMMAND', payload: { command: `start ${item.label}`, history: state.terminalHistory } });
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 0 && !item.isRenaming) {
      if (e.ctrlKey) {
        dispatch({ type: 'SET_SELECTION', payload: { ids: [item.id], isSelected: !item.isSelected, isToggle: true } });
      } else if (!item.isSelected) {
        dispatch({ type: 'SET_SELECTION', payload: { ids: [item.id], isSelected: true, isToggle: false } });
      }
    }
    handleDragStart(e);
  };
  
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
      handleDragStart(e); // Start dragging logic immediately
      longPressTimerRef.current = window.setTimeout(() => {
          longPressTimerRef.current = null;
          const touch = e.touches[0];
          dispatch({ type: 'SHOW_CONTEXT_MENU', payload: { x: touch.clientX, y: touch.clientY, targetId: item.id } });
      }, 500);
  };

  const handleTouchEnd = () => {
      if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
          
          const now = Date.now();
          if (now - lastTapRef.current < 300) { // Double tap
              openItem();
              lastTapRef.current = 0; // Reset tap timer
          } else { // Single tap
              lastTapRef.current = now;
              dispatch({ type: 'SET_SELECTION', payload: { ids: [item.id], isSelected: true, isToggle: false } });
          }
      }
  };

  const handleDoubleClick = () => {
    if(item.isRenaming) return;
    openItem();
  };
  
  const handleRename = () => {
    dispatch({ type: 'RENAME_ITEM', payload: { id: item.id, newLabel: tempLabel || item.label } });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleRename();
    }
    if (e.key === 'Escape') {
      setTempLabel(item.label); // Revert changes
      dispatch({ type: 'RENAME_ITEM', payload: { id: item.id, newLabel: item.label } }); // Effectively just stops renaming
    }
  };
  
  useEffect(() => {
    if (item.isRenaming) {
      inputRef.current?.focus();
      inputRef.current?.select();
      setTempLabel(item.label);
    }
  }, [item.isRenaming, item.label]);

  const selectionStyle = item.isSelected ? { backgroundColor: 'rgba(0, 88, 225, 0.5)', outline: '1px dotted rgba(255, 255, 255, 0.7)' } : {};
  const iconDegradeClass = settings.vhsScanlines ? 'icon-degrade-effect' : '';

  return (
    <div
      ref={iconRef}
      data-id={item.id}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={handleDoubleClick}
      className="absolute flex flex-col items-center p-2 text-center cursor-pointer group draggable-icon"
      style={{
        left: `${item.position.x}px`,
        top: `${item.position.y}px`,
        width: `${settings.desktopIconSize + 24}px`,
        ...selectionStyle,
      }}
      aria-label={`Open ${item.label}`}
      role="button"
    >
      <AppIcon
        iconType={item.iconType}
        themeStyle={settings.themeStyle}
        className={`transition-transform duration-100 group-hover:scale-105 ${iconDegradeClass}`}
        style={{ width: `${settings.desktopIconSize}px`, height: `${settings.desktopIconSize}px` }}
      />
      {item.isRenaming ? (
        <input
            ref={inputRef}
            type="text"
            value={tempLabel}
            onChange={(e) => setTempLabel(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            className="mt-1 text-sm bg-white text-black text-center border border-blue-500 w-full outline-none"
            onClick={(e) => e.stopPropagation()} // Prevent click from propagating to the div
        />
      ) : (
        <span className="mt-1 text-sm text-white drop-shadow-[1px_1px_1px_rgba(0,0,0,0.8)] select-none truncate w-full desktop-icon-label">{item.label}</span>
      )}
    </div>
  );
};

const DraggableDesktopIcon = React.memo(DraggableDesktopIconComponent);
export default DraggableDesktopIcon;
