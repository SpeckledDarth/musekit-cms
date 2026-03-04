"use client";

import { useState, useEffect, useRef } from "react";

interface Counter {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
}

interface AnimatedCountersProps {
  counters: Counter[];
  backgroundColor?: string;
  enabled?: boolean;
}

function useCountUp(target: number, isVisible: boolean, duration = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, isVisible, duration]);

  return count;
}

function CounterItem({ counter, isVisible }: { counter: Counter; isVisible: boolean }) {
  const count = useCountUp(counter.value, isVisible);

  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-bold text-primary animate-count-up">
        {counter.prefix}
        {count.toLocaleString()}
        {counter.suffix}
      </div>
      <p className="text-muted-foreground mt-2 text-sm font-medium">{counter.label}</p>
    </div>
  );
}

export function AnimatedCounters({
  counters,
  backgroundColor,
  enabled = true,
}: AnimatedCountersProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  if (!enabled) return null;

  return (
    <section ref={ref} className="py-20 px-4" style={{ backgroundColor }}>
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {counters.map((counter, i) => (
          <CounterItem key={i} counter={counter} isVisible={isVisible} />
        ))}
      </div>
    </section>
  );
}
