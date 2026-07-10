import { useEffect, useRef, useState } from 'react';

export interface Trend {
  direction: 'up' | 'down';
  percent: number;
}

/** Derives a same-session trend badge by comparing the current value to the last distinct value seen. */
export function useTrend(value: number): Trend | undefined {
  const lastValueRef = useRef<number | null>(null);
  const [trend, setTrend] = useState<Trend | undefined>(undefined);

  useEffect(() => {
    const previous = lastValueRef.current;
    if (previous !== null && previous !== value && previous > 0) {
      const percent = Math.round((Math.abs(value - previous) / previous) * 100);
      if (percent > 0) {
        setTrend({ direction: value > previous ? 'up' : 'down', percent });
      }
    }
    lastValueRef.current = value;
  }, [value]);

  return trend;
}
