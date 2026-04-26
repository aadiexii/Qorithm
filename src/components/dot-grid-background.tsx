"use client";

import { useEffect, useRef } from "react";

export function DotGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    const mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };
    
    // Dot configuration
    const spacing = 18; // Reduced base spacing between dots
    const baseRadius = 1.2; // Slightly larger base radius
    const maxRadius = 3; // Dots get larger near mouse
    const glowRadius = 350; // Size of spotlight

    // For subtle parallax/drift
    let time = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", resize);
    resize();

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };
    
    const handleMouseLeave = () => {
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const draw = () => {
      time += 0.005; // Animation speed
      
      // Smooth mouse follow
      mouse.x += (mouse.targetX - mouse.x) * 0.1;
      mouse.y += (mouse.targetY - mouse.y) * 0.1;

      // Fill background
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, width, height);

      // Draw dots
      const cols = Math.floor(width / spacing) + 2;
      const rows = Math.floor(height / spacing) + 2;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          // Base position
          let x = i * spacing;
          let y = j * spacing;

          // Parallax/wave offset
          if (!prefersReducedMotion) {
            const xOffset = Math.sin(time + j * 0.1) * 2;
            const yOffset = Math.cos(time + i * 0.1) * 2;
            x += xOffset;
            y += yOffset;
          }

          // Distance to mouse
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Calculate radius and alpha based on distance to mouse
          let radius = baseRadius;
          let alpha = 0.15; // Increased base opacity so dots are clearly visible everywhere
          
          // Spotlight and movement effect
          if (distance < glowRadius) {
            // Closer = bigger, brighter, and moved away
            const intensity = 1 - (distance / glowRadius);
            radius = baseRadius + (maxRadius - baseRadius) * Math.pow(intensity, 2);
            alpha = 0.15 + (0.5 * Math.pow(intensity, 1.5)); // Capped max opacity
            
            // Mouse repel movement (Push AWAY from mouse)
            if (!prefersReducedMotion && distance > 0) {
              const moveAmt = intensity * 15; // push up to 15px
              x += (dx / distance) * moveAmt;
              y += (dy / distance) * moveAmt;
            }
          }

          // Randomize some dots to create "clusters" or stars effect
          const randomFactor = Math.sin((i * 12.9898 + j * 78.233) * 43758.5453) * 0.5 + 0.5;
          if (randomFactor > 0.95) {
            alpha += 0.08; // Brighter specific dots
            radius *= 1.2;
          }

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.fill();
        }
      }

      // Draw global subtle ambient gradients over the canvas
      const gradient1 = ctx.createRadialGradient(width * 0.2, height * 0.3, 0, width * 0.2, height * 0.3, width * 0.8);
      gradient1.addColorStop(0, "rgba(255,255,255,0.015)"); // Monochrome hint
      gradient1.addColorStop(1, "transparent");
      
      const gradient2 = ctx.createRadialGradient(width * 0.8, height * 0.7, 0, width * 0.8, height * 0.7, width * 0.8);
      gradient2.addColorStop(0, "rgba(255,255,255,0.01)");
      gradient2.addColorStop(1, "transparent");

      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, width, height);

      // Draw the white spotlight overlay centered on mouse
      if (mouse.x > 0 && mouse.y > 0) {
        const mouseGradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, glowRadius);
        mouseGradient.addColorStop(0, "rgba(255,255,255,0.04)"); // Subtle white spotlight
        mouseGradient.addColorStop(1, "transparent");
        ctx.fillStyle = mouseGradient;
        ctx.fillRect(0, 0, width, height);
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 bg-[#050505]"
    />
  );
}
