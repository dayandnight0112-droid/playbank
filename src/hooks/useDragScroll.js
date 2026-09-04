import { useRef, useState } from 'react';

export function useDragScroll() {
  const ref = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = (e) => {
    setIsDragging(true);
    startX.current = e.pageX - ref.current.offsetLeft;
    scrollLeft.current = ref.current.scrollLeft;
    // Disable snapping during drag to prevent jittering fighting with JS
    if (ref.current) {
      ref.current.style.scrollSnapType = 'none';
      ref.current.style.scrollBehavior = 'auto';
    }
  };

  const onMouseLeave = () => {
    setIsDragging(false);
    if (ref.current) {
      ref.current.style.scrollSnapType = 'x mandatory';
      ref.current.style.scrollBehavior = 'smooth';
    }
  };

  const onMouseUp = () => {
    setIsDragging(false);
    if (ref.current) {
      ref.current.style.scrollSnapType = 'x mandatory';
      ref.current.style.scrollBehavior = 'smooth';
    }
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX.current) * 2; // Scroll speed multiplier
    ref.current.scrollLeft = scrollLeft.current - walk;
  };

  return {
    ref,
    onMouseDown,
    onMouseLeave,
    onMouseUp,
    onMouseMove,
    style: { cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none' }
  };
}
