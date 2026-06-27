"use client";

import { useEffect, useState, useRef } from "react";

interface AnimatedNumberProps {
  value: number;
  duration?: number; // duration in ms
  formatter?: (val: number) => string;
}

export default function AnimatedNumber({
  value,
  duration = 500,
  formatter = (val: number) => Math.round(val).toString(),
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValueRef = useRef(value);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const startVal = previousValueRef.current;
    const endVal = value;

    if (startVal === endVal) {
      setDisplayValue(endVal);
      return;
    }

    let startTime: number | null = null;

    const animate = (time: number) => {
      if (startTime === null) {
        startTime = time;
      }

      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out quadratic function
      const easedProgress = progress * (2 - progress);
      const currentVal = startVal + easedProgress * (endVal - startVal);

      setDisplayValue(currentVal);

      if (progress < 1) {
        animationFrameIdRef.current = requestAnimationFrame(animate);
      } else {
        previousValueRef.current = endVal;
      }
    };

    animationFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [value, duration]);

  return <span>{formatter(displayValue)}</span>;
}
