import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

const CarouselContext = createContext(null);

function useCarousel() {
  const context = useContext(CarouselContext);

  if (!context) {
    throw new Error('useCarousel must be used within Carousel');
  }

  return context;
}

function Carousel({ children, className, setApi }) {
  const viewportRef = useRef(null);
  const listenersRef = useRef({ select: new Set() });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollState = useCallback(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = viewport;
    setCanScrollPrev(scrollLeft > 0);
    setCanScrollNext(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  const emitSelect = useCallback(() => {
    updateScrollState();
    listenersRef.current.select.forEach((callback) => callback());
  }, [updateScrollState]);

  const scrollByDirection = useCallback((direction) => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const firstItem = viewport.querySelector('[data-carousel-item="true"]');
    const itemWidth = firstItem ? firstItem.getBoundingClientRect().width : viewport.clientWidth * 0.85;
    const gap = 24;

    viewport.scrollBy({
      left: direction * (itemWidth + gap),
      behavior: 'smooth',
    });
  }, []);

  const api = useMemo(() => ({
    scrollPrev: () => scrollByDirection(-1),
    scrollNext: () => scrollByDirection(1),
    canScrollPrev: () => canScrollPrev,
    canScrollNext: () => canScrollNext,
    on: (eventName, callback) => {
      if (!listenersRef.current[eventName]) {
        listenersRef.current[eventName] = new Set();
      }

      listenersRef.current[eventName].add(callback);
    },
    off: (eventName, callback) => {
      listenersRef.current[eventName]?.delete(callback);
    },
  }), [canScrollNext, canScrollPrev, scrollByDirection]);

  useEffect(() => {
    setApi?.(api);
  }, [api, setApi]);

  useEffect(() => {
    const handleResize = () => emitSelect();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [emitSelect]);

  return (
    <CarouselContext.Provider value={{ viewportRef, updateScrollState, emitSelect }}>
      <div className={cn('relative w-full', className)}>
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({ children, className }) {
  const { viewportRef, emitSelect, updateScrollState } = useCarousel();

  return (
    <div
      ref={(node) => {
        viewportRef.current = node;
        if (node) {
          updateScrollState();
          emitSelect();
        }
      }}
      onScroll={emitSelect}
      className={cn('hide-scrollbar flex overflow-x-auto scroll-smooth', className)}
    >
      {children}
    </div>
  );
}

function CarouselItem({ children, className }) {
  return (
    <div data-carousel-item="true" className={cn('min-w-0 shrink-0 grow-0 basis-full', className)}>
      {children}
    </div>
  );
}

export { Carousel, CarouselContent, CarouselItem, useCarousel };