'use client';

import FloatingParticles from './FloatingParticles';

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 -z-10 bg-black">
      <FloatingParticles />
    </div>
  );
}
