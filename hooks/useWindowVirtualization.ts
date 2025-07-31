import React, { useState, useEffect, useRef, useCallback } from 'react';

interface VirtualizationOptions {
  itemHeight: number;
  containerRef: React.RefObject<HTMLElement>;
}

export const useWindowVirtualization = (itemCount: number, options: VirtualizationOptions) => {
  const { itemHeight, containerRef } = options;
  const [scrollPosition, setScrollPosition] = useState(0);
  
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollPosition(containerRef.current.scrollTop);
    }
  }, [containerRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [containerRef]);

  const containerHeight = containerRef.current?.clientHeight || 0;
  
  const startIndex = Math.max(0, Math.floor(scrollPosition / itemHeight) - 5); // Render a few items before
  const endIndex = Math.min(itemCount, Math.ceil((scrollPosition + containerHeight) / itemHeight) + 5); // and after

  const visibleItems = Array.from({ length: endIndex - startIndex }, (_, i) => startIndex + i);
  
  const virtualizer = {
    style: {
      height: `${itemCount * itemHeight}px`,
      position: 'relative',
    } as React.CSSProperties,
    
    getItemStyle: (index: number) => ({
        position: 'absolute',
        top: `${index * itemHeight}px`,
        left: 0,
        right: 0,
        height: `${itemHeight}px`,
    } as React.CSSProperties)
  };

  return { visibleItems, virtualizer, scrollToBottom };
};
