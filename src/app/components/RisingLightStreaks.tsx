'use client';

import React, { useRef, useEffect, useState } from 'react';

const SketchComponent: React.FC = () => {
  const sketchRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !sketchRef.current) return;

    let p5Instance: any = null;
    let particles: any[] = [];
    let stars: any[] = [];
    const particleDensity = 0.00004;
    const starDensity = 0.0001;

    const loadP5 = async () => {
      try {
        const p5 = await import('p5');

        const sketch = (p: any) => {
          p.setup = () => {
            if (sketchRef.current) {
              const canvas = p.createCanvas(sketchRef.current.offsetWidth, sketchRef.current.offsetHeight);
              canvas.parent(sketchRef.current);

              // Initialize particles (streaks)
              const numParticles = p.width * p.height * particleDensity;
              for (let i = 0; i < numParticles; i++) {
                particles.push(new Particle(p));
              }

              // Initialize stars
              const numStars = p.width * p.height * starDensity;
              for (let i = 0; i < numStars; i++) {
                stars.push(new Star(p));
              }
            }
          };

          p.draw = () => {
            p.background(0, 0, 0, 40);

            // Draw stars first, so they are in the background
            stars.forEach(star => {
              star.draw();
            });

            // Draw particles (streaks) on top
            particles.forEach(particle => {
              particle.update();
              particle.draw();
            });
          };

          p.windowResized = () => {
            if (sketchRef.current) {
              p.resizeCanvas(sketchRef.current.offsetWidth, sketchRef.current.offsetHeight);
              particles = [];
              stars = [];

              const numParticles = p.width * p.height * particleDensity;
              for (let i = 0; i < numParticles; i++) {
                particles.push(new Particle(p));
              }

              const numStars = p.width * p.height * starDensity;
              for (let i = 0; i < numStars; i++) {
                stars.push(new Star(p));
              }
            }
          };
        };

        p5Instance = new p5.default(sketch);
      } catch (error) {
        console.error('Failed to load p5.js:', error);
      }
    };

    loadP5();

    return () => {
      if (p5Instance) {
        p5Instance.remove();
      }
    };
  }, [isClient]);

  if (!isClient) {
    return <div className="absolute inset-0 -z-10 bg-black" />;
  }

  return <div ref={sketchRef} className="absolute inset-0 -z-10" />;
};

// Particle and Star classes remain the same but need to be defined after p5 is loaded
class Particle {
  p: any;
  x: number;
  y: number;
  speed: number;
  len: number;
  size: number;
  color: any;

  constructor(p: any) {
    this.p = p;
    this.x = p.random(p.width);
    this.y = p.random(p.height);
    this.speed = p.random(0.5, 1.2);
    this.len = p.random(12, 30);
    this.size = p.random(1.5, 3);
    // Changed color palette to white and orange tones
    this.color = p.random([
      p.color(255, 255, 255, 80), // White
      p.color(255, 165, 0, 70),   // Orange
      p.color(255, 200, 100, 75)  // Light Orange
    ]);
  }

  update() {
    this.y -= this.speed;
    if (this.y < -this.len) {
      this.y = this.p.height;
      this.x = this.p.random(this.p.width);
    }
  }

  draw() {
    const p = this.p;
    p.stroke(this.color);
    p.strokeWeight(this.size);
    p.line(this.x, this.y, this.x, this.y + this.len);
  }
}

class Star {
  p: any;
  x: number;
  y: number;
  size: number;
  twinkleOffset: number;

  constructor(p: any) {
    this.p = p;
    this.x = p.random(p.width);
    this.y = p.random(p.height);
    this.size = p.random(1, 2.5);
    this.twinkleOffset = p.random(p.TWO_PI);
  }

  draw() {
    const p = this.p;
    // Use a sine wave for a smooth twinkling effect
    const alpha = p.map(p.sin(p.frameCount * 0.02 + this.twinkleOffset), -1, 1, 50, 180);
    const starColor = p.color(255, 255, 255, alpha);

    // Apply glow effect using shadowBlur
    p.drawingContext.shadowBlur = this.size * 2.5;
    p.drawingContext.shadowColor = starColor;

    p.noStroke();
    p.fill(starColor);
    p.ellipse(this.x, this.y, this.size, this.size);

    // Reset glow effect so it doesn't affect other elements like the streaks
    p.drawingContext.shadowBlur = 0;
  }
}

export default function RisingLightStreaks() {
  return <SketchComponent />;
}
