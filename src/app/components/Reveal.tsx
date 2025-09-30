'use client';

import { useEffect, useRef, ReactNode } from 'react';

export default function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          el.classList.add('revealed');
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.15 });

    el.classList.add('reveal');
    obs.observe(el);

    return () => obs.disconnect();
  }, []);

  return <div ref={ref} className={className}>{children}</div>;
}
