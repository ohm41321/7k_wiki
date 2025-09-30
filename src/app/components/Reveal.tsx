'use client';

import { useEffect, useRef, ReactNode } from 'react';

export default function Reveal({ children, className = '', replay = false }: { children: ReactNode; className?: string; replay?: boolean }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          el.classList.add('revealed');
          if (!replay) {
            obs.unobserve(el);
          }
        } else {
          if (replay) {
            el.classList.remove('revealed');
          }
        }
      });
    }, { threshold: 0.15 });

    el.classList.add('reveal');
    obs.observe(el);

    return () => obs.disconnect();
  }, [replay]);

  return <div ref={ref} className={className}>{children}</div>;
}
