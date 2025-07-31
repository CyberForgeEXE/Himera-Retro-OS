import React, { useRef, useCallback, useEffect } from 'react';
import { useDraggable } from '../hooks/useDraggable';
import { useAppContext } from '../contexts/AppContext';
import { XPCloseIcon, XPMinimizeIcon } from './Icons';

interface WindowProps {
  id: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  initialSize: { width: number; height: number };
  zIndex: number;
  children: React.ReactNode;
  isMinimized: boolean;
}

const MIN_WIDTH = 200;
const MIN_HEIGHT = 150;
type ResizeEvent = MouseEvent | TouchEvent;

const WindowComponent: React.FC<WindowProps> = ({ id, title, children, position, size, initialSize, zIndex, isMinimized }) => {
  const { state, dispatch } = useAppContext();
  const { activeWindowId } = state;
  const handleRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0, winX: 0, winY: 0 });
  const currentResizeDirection = useRef('');

  const handleDragEnd = useCallback((finalPosition: { x: number; y: number }) => {
    dispatch({ type: 'MOVE_WINDOW', payload: { id, position: finalPosition } });
  }, [id, dispatch]);
  
  const { handleDragStart } = useDraggable({ 
    handleRef, 
    targetRef: windowRef,
    onDragEnd: handleDragEnd, 
    initialPosition: position 
  });

  const handleFocus = () => {
    dispatch({ type: 'FOCUS_WINDOW', payload: id });
  };

  const handleClose = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    dispatch({ type: 'CLOSE_WINDOW', payload: id });
  };
  
  const handleMinimize = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_MINIMIZE_WINDOW', payload: id });
  };

  const getEventCoords = (e: ResizeEvent): { x: number, y: number } => {
    if ('touches' in e) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  const handleResizeMouseMove = useCallback((e: ResizeEvent) => {
    if (!currentResizeDirection.current) return;

    const coords = getEventCoords(e);
    const dx = coords.x - resizeStartRef.current.x;
    const dy = coords.y - resizeStartRef.current.y;
    let newWidth = resizeStartRef.current.width;
    let newHeight = resizeStartRef.current.height;
    let newX = resizeStartRef.current.winX;
    let newY = resizeStartRef.current.winY;

    if (currentResizeDirection.current.includes('e')) {
        newWidth = Math.max(MIN_WIDTH, resizeStartRef.current.width + dx);
    }
    if (currentResizeDirection.current.includes('w')) {
        newWidth = Math.max(MIN_WIDTH, resizeStartRef.current.width - dx);
        if (newWidth > MIN_WIDTH) newX = resizeStartRef.current.winX + dx;
    }
    if (currentResizeDirection.current.includes('s')) {
        newHeight = Math.max(MIN_HEIGHT, resizeStartRef.current.height + dy);
    }
    if (currentResizeDirection.current.includes('n')) {
        newHeight = Math.max(MIN_HEIGHT, resizeStartRef.current.height - dy);
        if (newHeight > MIN_HEIGHT) newY = resizeStartRef.current.winY + dy;
    }

    dispatch({ type: 'RESIZE_WINDOW', payload: { id, size: { width: newWidth, height: newHeight } } });
    dispatch({ type: 'MOVE_WINDOW', payload: { id, position: { x: newX, y: newY } } });
  }, [id, dispatch]);

  const handleResizeMouseUp = useCallback(() => {
    currentResizeDirection.current = '';
    document.removeEventListener('mousemove', handleResizeMouseMove);
    document.removeEventListener('mouseup', handleResizeMouseUp);
    document.removeEventListener('touchmove', handleResizeMouseMove);
    document.removeEventListener('touchend', handleResizeMouseUp);
    document.body.style.cursor = 'default';
  }, [handleResizeMouseMove]);

  const handleResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent, direction: string) => {
    e.stopPropagation();
    currentResizeDirection.current = direction;
    const coords = getEventCoords(e.nativeEvent as ResizeEvent);
    resizeStartRef.current = {
      x: coords.x,
      y: coords.y,
      width: size.width,
      height: size.height,
      winX: position.x,
      winY: position.y,
    };
    
    if (e.nativeEvent instanceof MouseEvent) {
        document.addEventListener('mousemove', handleResizeMouseMove);
        document.addEventListener('mouseup', handleResizeMouseUp);
    } else {
        document.addEventListener('touchmove', handleResizeMouseMove, { passive: false });
        document.addEventListener('touchend', handleResizeMouseUp);
    }
  }, [size, position, handleResizeMouseMove, handleResizeMouseUp]);

  useEffect(() => {
    return () => { // Cleanup listeners on unmount
      document.removeEventListener('mousemove', handleResizeMouseMove);
      document.removeEventListener('mouseup', handleResizeMouseUp);
      document.removeEventListener('touchmove', handleResizeMouseMove);
      document.removeEventListener('touchend', handleResizeMouseUp);
    };
  }, [handleResizeMouseMove, handleResizeMouseUp]);

  if (isMinimized) {
    return null;
  }

  const isActive = activeWindowId === id;
  
  const windowStyle = {
    backgroundColor: 'var(--window-bg)',
    color: 'var(--text-color)',
    border: `1px solid ${isActive ? 'var(--accent-color)' : 'var(--border-color)'}`,
    boxShadow: '2px 2px 8px rgba(0,0,0,0.5)',
  };
  
  const activeTitlebarStyle = { background: 'var(--accent-color)', color: 'white' };
  const inactiveTitlebarStyle = { background: 'var(--border-color)', color: '#c0c0c0' };
  
  const resizeHandleClass = "absolute bg-transparent z-10";

  const scaleFactor = size.width / initialSize.width;
  const contentWrapperStyle: React.CSSProperties = {
    width: `${100 / scaleFactor}%`,
    height: `${100 / scaleFactor}%`,
    transform: `scale(${scaleFactor})`,
    transformOrigin: 'top left',
  };
  
  const childrenWithProps = children ? React.cloneElement(children as React.ReactElement, { scaleFactor } as any) : null;

  return (
    <div
      ref={windowRef}
      className="absolute flex flex-col window-component select-none"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        zIndex: zIndex,
        width: `${size.width}px`,
        height: `${size.height}px`,
        ...windowStyle
      }}
      onMouseDown={handleFocus}
      onTouchStart={handleFocus}
    >
      {/* Resize Handles (made larger for touch) */}
      <div className={`${resizeHandleClass} top-[-8px] left-[-8px] w-4 h-full cursor-w-resize`} onMouseDown={(e) => handleResizeStart(e, 'w')} onTouchStart={(e) => handleResizeStart(e, 'w')}></div>
      <div className={`${resizeHandleClass} top-[-8px] right-[-8px] w-4 h-full cursor-e-resize`} onMouseDown={(e) => handleResizeStart(e, 'e')} onTouchStart={(e) => handleResizeStart(e, 'e')}></div>
      <div className={`${resizeHandleClass} top-[-8px] left-[-8px] w-full h-4 cursor-n-resize`} onMouseDown={(e) => handleResizeStart(e, 'n')} onTouchStart={(e) => handleResizeStart(e, 'n')}></div>
      <div className={`${resizeHandleClass} bottom-[-8px] left-[-8px] w-full h-4 cursor-s-resize`} onMouseDown={(e) => handleResizeStart(e, 's')} onTouchStart={(e) => handleResizeStart(e, 's')}></div>
      <div className={`${resizeHandleClass} top-[-8px] left-[-8px] w-4 h-4 cursor-nwse-resize`} onMouseDown={(e) => handleResizeStart(e, 'nw')} onTouchStart={(e) => handleResizeStart(e, 'nw')}></div>
      <div className={`${resizeHandleClass} top-[-8px] right-[-8px] w-4 h-4 cursor-nesw-resize`} onMouseDown={(e) => handleResizeStart(e, 'ne')} onTouchStart={(e) => handleResizeStart(e, 'ne')}></div>
      <div className={`${resizeHandleClass} bottom-[-8px] left-[-8px] w-4 h-4 cursor-nesw-resize`} onMouseDown={(e) => handleResizeStart(e, 'sw')} onTouchStart={(e) => handleResizeStart(e, 'sw')}></div>
      <div className={`${resizeHandleClass} bottom-[-8px] right-[-8px] w-4 h-4 cursor-nwse-resize`} onMouseDown={(e) => handleResizeStart(e, 'se')} onTouchStart={(e) => handleResizeStart(e, 'se')}></div>

      <div
        ref={handleRef}
        className="flex justify-between items-center px-2 py-1 cursor-move select-none"
        style={isActive ? activeTitlebarStyle : inactiveTitlebarStyle}
        onMouseDown={(e) => { handleFocus(); handleDragStart(e); }}
        onTouchStart={(e) => { handleFocus(); handleDragStart(e); }}
      >
        <span className="font-bold text-base pl-1">{title}</span>
        <div className="flex items-center space-x-1">
            <button onClick={handleMinimize} onTouchStart={handleMinimize} className="w-6 h-6 flex items-center justify-center bg-gray-500/50 hover:bg-gray-400/50 rounded-sm p-1" ><XPMinimizeIcon className="w-full h-full text-white"/></button>
            <button onClick={handleClose} onTouchStart={handleClose} className="w-6 h-6 flex items-center justify-center bg-red-600/80 hover:bg-red-500/80 rounded-sm p-1"><XPCloseIcon className="w-full h-full text-white"/></button>
        </div>
      </div>
      <div className="flex-grow p-1 overflow-auto custom-scrollbar" style={{ backgroundColor: 'var(--window-bg)'}}>
        <div className='select-text h-full' style={contentWrapperStyle}>
            {childrenWithProps}
        </div>
      </div>
    </div>
  );
};

const Window = React.memo(WindowComponent);
export default Window;
