import { useEffect, useRef, useState } from 'react';

/**
 * Animated counter that ticks up from 0 to `value`.
 * Uses requestAnimationFrame for smooth 60fps animation.
 */
export default function AnimatedCounter({ value, duration = 1200, prefix = '', suffix = '', decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef(null);
  const startRef = useRef(null);
  const prevRef  = useRef(0);

  useEffect(() => {
    const from = prevRef.current;
    const to = Number(value) || 0;
    prevRef.current = to;

    if (from === to) {
      setDisplay(to);
      return;
    }

    startRef.current = performance.now();

    function animate(now) {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;
      setDisplay(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    }

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, duration]);

  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : Math.round(display).toLocaleString('en-IN');

  return <span>{prefix}{formatted}{suffix}</span>;
}
