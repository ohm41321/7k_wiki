'use client';

import React, { useState, useEffect, ReactElement } from 'react';

const GeometricParticles = () => {
  const [particles, setParticles] = useState<ReactElement[]>([]);
  const particleCount = 75; // Reduced count for a cleaner look

  useEffect(() => {
    const newParticles = [];
    const shapes = ['triangle', 'square', 'circle'];

    for (let i = 0; i < particleCount; i++) {
      const size = Math.random() * 15 + 5; // Slightly larger particles
      const left = Math.random() * 100;
      const animationDelay = Math.random() * 25;
      const animationDuration = Math.random() * 20 + 15;
      const shape = shapes[Math.floor(Math.random() * shapes.length)];

      newParticles.push(
        <div
          key={i}
          className={`geometric-particle ${shape}`}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${left}%`,
            animationDelay: `${animationDelay}s`,
            animationDuration: `${animationDuration}s`,
            bottom: '-20px', // Start from below the screen
          }}
        />
      );
    }
    setParticles(newParticles);
  }, []);

  return <div className="absolute top-0 left-0 w-full h-full overflow-hidden">{particles}</div>;
};

export default GeometricParticles;
