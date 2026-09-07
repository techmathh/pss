import React, { useEffect, useRef } from 'react';
import { useInView, animate } from 'framer-motion';

export function AnimatedNumber({ value, suffix = '' }: { value: number, suffix?: string }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(nodeRef, { once: true, amount: 0.5 });
  
  useEffect(() => {
    if (!isInView) return;
    
    // Animate from 0 to value
    const controls = animate(0, value, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate(v) {
        if (nodeRef.current) {
          nodeRef.current.textContent = Math.round(v).toString() + suffix;
        }
      }
    });
    return () => controls.stop();
  }, [value, isInView, suffix]);

  return <span ref={nodeRef}>0{suffix}</span>;
}
