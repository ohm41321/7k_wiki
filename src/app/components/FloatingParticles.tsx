'use client';

import { useState, useEffect } from 'react';

const FloatingParticles = () => {
  const [particles, setParticles] = useState<JSX.Element[]>([]);
  const particleCount = 50;

  useEffect(() => {
    const newParticles = [];
    for (let i = 0; i < particleCount; i++) {
      const size = Math.random() * 3 + 1;
      const left = Math.random() * 100;
      const animationDelay = Math.random() * 20;
      const animationDuration = Math.random() * 10 + 10;

      newParticles.push(
        <div
          key={i}
          className="particle"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${left}%`,
            animationDelay: `${animationDelay}s`,
            animationDuration: `${animationDuration}s`,
            bottom: '0',
          }}
        />
      );
    }
    setParticles(newParticles);
  }, []); // Empty dependency array ensures this runs only once on mount

  return <div className="absolute top-0 left-0 w-full h-full overflow-hidden">{particles}</div>;
};

export default FloatingParticles;
