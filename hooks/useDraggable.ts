import { useRef, useCallback, useEffect } from 'react';

interface UseDraggableProps {
  handleRef: React.RefObject<HTMLElement>;
  targetRef: React.RefObject<HTMLElement>; // The element to move
  onDragEnd: (position: { x: number; y: number }) => void;
  initialPosition: { x: number, y: number };
}

type DragEvent = MouseEvent | TouchEvent;

export const useDraggable = ({ handleRef, targetRef, onDragEnd, initialPosition }: UseDraggableProps) => {
  const isDraggingRef = useRef(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const elementStartPosRef = useRef({ x: 0, y: 0 });

  const getEventCoords = (e: DragEvent): { x: number, y: number } => {
    if ('touches' in e) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  const handleDragMove = useCallback((e: DragEvent) => {
    if (!isDraggingRef.current || !targetRef.current) return;
    const coords = getEventCoords(e);
    const dx = coords.x - dragStartPosRef.current.x;
    const dy = coords.y - dragStartPosRef.current.y;

    targetRef.current.style.transform = `translate(${dx}px, ${dy}px)`;

    if(e.cancelable) e.preventDefault();
  }, [targetRef]);

  const handleDragEndEvent = useCallback((e: DragEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    if (targetRef.current) {
        // Reset transform before state update to avoid visual jump
        targetRef.current.style.transform = '';
    }

    const coords = getEventCoords(e);
    const dx = coords.x - dragStartPosRef.current.x;
    const dy = coords.y - dragStartPosRef.current.y;
    const finalPos = {
      x: elementStartPosRef.current.x + dx,
      y: elementStartPosRef.current.y + dy,
    };
    onDragEnd(finalPos);
    
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEndEvent);
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('touchend', handleDragEndEvent);
  }, [handleDragMove, onDragEnd, targetRef]);
  
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (handleRef.current && handleRef.current.contains(e.target as Node)) {
      isDraggingRef.current = true;
      const coords = getEventCoords(e.nativeEvent);
      dragStartPosRef.current = { x: coords.x, y: coords.y };
      elementStartPosRef.current = initialPosition;

      document.addEventListener('mousemove', handleDragMove, { passive: true });
      document.addEventListener('mouseup', handleDragEndEvent);
      document.addEventListener('touchmove', handleDragMove, { passive: false });
      document.addEventListener('touchend', handleDragEndEvent);

      if (e.cancelable) {
        e.preventDefault();
      }
      e.stopPropagation();
    }
  }, [handleRef, initialPosition, handleDragMove, handleDragEndEvent]);

  // Cleanup effect
  useEffect(() => {
    return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEndEvent);
        document.removeEventListener('touchmove', handleDragMove);
        document.removeEventListener('touchend', handleDragEndEvent);
    }
  }, [handleDragMove, handleDragEndEvent]);

  return { handleDragStart };
};
