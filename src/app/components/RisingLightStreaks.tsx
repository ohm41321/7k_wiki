'use client';

import React, { useRef, useEffect } from 'react';

const RisingLightStreaks = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: any[] = [];
        const particleCount = 100; // Increased particle count

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const createParticles = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                const width = Math.random() * 2.5 + 1; // Wider streaks
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height + canvas.height, // Start below the screen
                    speed: width * 0.7, // Speed proportional to width for parallax
                    length: Math.random() * 200 + 100, // Longer streaks
                    opacity: Math.random() * 0.6 + 0.2, // Brighter
                    width: width,
                });
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.y -= p.speed;

                if (p.y < -p.length) {
                    p.y = canvas.height;
                    p.x = Math.random() * canvas.width;
                }

                // Main streak gradient
                const gradient = ctx.createLinearGradient(p.x, p.y, p.x, p.y - p.length);
                gradient.addColorStop(0, `rgba(255, 236, 179, 0)`);
                gradient.addColorStop(0.5, `rgba(255, 236, 179, ${p.opacity})`);
                gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

                ctx.beginPath();
                ctx.strokeStyle = gradient;
                ctx.lineWidth = p.width;
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x, p.y - p.length);
                ctx.stroke();

                // Add a sparkling head to the streak
                const headY = p.y - p.length;
                const headGradient = ctx.createRadialGradient(p.x, headY, 0, p.x, headY, p.width * 4);
                headGradient.addColorStop(0, `rgba(255, 255, 255, ${p.opacity * 1.5})`);
                headGradient.addColorStop(1, `rgba(255, 236, 179, 0)`);

                ctx.beginPath();
                ctx.fillStyle = headGradient;
                ctx.arc(p.x, headY, p.width * 2, 0, Math.PI * 2);
                ctx.fill();
            });

            animationFrameId = window.requestAnimationFrame(animate);
        };

        const init = () => {
            resizeCanvas();
            createParticles();
            animate();
        };

        init();

        window.addEventListener('resize', init);

        return () => {
            window.cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', init);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />;
};

export default RisingLightStreaks;
