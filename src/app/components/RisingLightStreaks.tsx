'use client';

import React, { useRef, useEffect } from 'react';
import p5 from 'p5';

// A simplified P5 type interface for our use case
interface P5 extends p5 {}

class Particle {
  p: P5;
  x: number;
  y: number;
  speed: number;
  len: number;
  size: number;
  color: any;

  constructor(p: P5) {
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
  p: P5;
  x: number;
  y: number;
  size: number;
  twinkleOffset: number;

  constructor(p: P5) {
    this.p = p;
    this.x = p.random(p.width);
    this.y = p.random(p.height);
    this.size = p.random(0.5, 1.5);
    this.twinkleOffset = p.random(p.TWO_PI);
  }

  draw() {
    const p = this.p;
    // Use a sine wave for a smooth twinkling effect
    const alpha = p.map(p.sin(p.frameCount * 0.02 + this.twinkleOffset), -1, 1, 50, 180);
    p.noStroke();
    p.fill(255, 255, 255, alpha); // Soft white color
    p.ellipse(this.x, this.y, this.size, this.size);
  }
}

const SketchComponent: React.FC = () => {
  const sketchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let particles: Particle[] = [];
    let stars: Star[] = [];
    const particleDensity = 0.00004;
    const starDensity = 0.0001;

    const sketch = (p: P5) => {
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

    new p5(sketch);

  }, []);

  return <div ref={sketchRef} className="absolute inset-0 -z-10" />;
};

export default function RisingLightStreaks() {
  return <SketchComponent />;
}
