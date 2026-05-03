"use client";

import { useEffect, useRef } from "react";

type Dot = {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
};

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
    const mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000, isActive: false };
    
    // Dot configuration
    const spacing = 18; // Reduced base spacing between dots
    const baseRadius = 1.2; // Slightly larger base radius
    const maxRadius = 3; // Dots get larger near mouse
    const glowRadius = 350; // Size of spotlight

    // For subtle parallax/drift
    let time = 0;
    let dots: Dot[] = [];

    const initDots = () => {
      dots = [];
      const cols = Math.floor(width / spacing) + 2;
      const rows = Math.floor(height / spacing) + 2;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const baseX = i * spacing;
          const baseY = j * spacing;
          dots.push({ baseX, baseY, x: baseX, y: baseY });
        }
      }
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initDots();
    };

    window.addEventListener("resize", resize);
    resize();

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      if (!mouse.isActive) {
        // Snap the current mouse position to target on first entry to avoid trailing from old position
        mouse.x = mouse.targetX;
        mouse.y = mouse.targetY;
      }
      mouse.isActive = true;
    };
    
    const handleMouseLeave = () => {
      mouse.isActive = false;
    };

    const handleBlur = () => {
      mouse.isActive = false;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        mouse.isActive = false;
        // Hard reset guardrail on tab change
        for (const dot of dots) {
          dot.x = dot.baseX;
          dot.y = dot.baseY;
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const draw = () => {
      time += 0.005; // Animation speed
      
      // Smooth mouse follow
      if (mouse.isActive) {
        mouse.x += (mouse.targetX - mouse.x) * 0.1;
        mouse.y += (mouse.targetY - mouse.y) * 0.1;
      }

      // Fill background
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, width, height);

      // Draw dots
      for (const dot of dots) {
        let targetX = dot.baseX;
        let targetY = dot.baseY;

        // Parallax/wave offset
        if (!prefersReducedMotion) {
          const xOffset = Math.sin(time + (dot.baseY / spacing) * 0.1) * 2;
          const yOffset = Math.cos(time + (dot.baseX / spacing) * 0.1) * 2;
          targetX += xOffset;
          targetY += yOffset;
        }

        // Compute interaction relative to BASE position to prevent drift
        const dx = dot.baseX - mouse.x;
        const dy = dot.baseY - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        let radius = baseRadius;
        let alpha = 0.15; // Increased base opacity so dots are clearly visible everywhere
        
        // Spotlight and movement effect
        if (mouse.isActive && distance < glowRadius) {
          // Closer = bigger, brighter, and moved away
          const intensity = 1 - (distance / glowRadius);
          radius = baseRadius + (maxRadius - baseRadius) * Math.pow(intensity, 2);
          alpha = 0.15 + (0.5 * Math.pow(intensity, 1.5)); // Capped max opacity
          
          // Mouse repel movement (Push AWAY from mouse)
          if (distance > 0) {
            const moveAmt = prefersReducedMotion ? intensity * 2 : intensity * 15; 
            targetX += (dx / distance) * moveAmt;
            targetY += (dy / distance) * moveAmt;
          }
        }

        // Randomize some dots to create "clusters" or stars effect
        const i = dot.baseX / spacing;
        const j = dot.baseY / spacing;
        const randomFactor = Math.sin((i * 12.9898 + j * 78.233) * 43758.5453) * 0.5 + 0.5;
        if (randomFactor > 0.95) {
          alpha += 0.08; // Brighter specific dots
          radius *= 1.2;
        }

        // Smooth return behavior
        dot.x += (targetX - dot.x) * 0.15;
        dot.y += (targetY - dot.y) * 0.15;

        // Hard reset guardrail: fix anomalous drift
        if (Math.abs(dot.x - targetX) > 100 || Math.abs(dot.y - targetY) > 100) {
          dot.x = targetX;
          dot.y = targetY;
        }

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
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
      if (mouse.isActive && mouse.x > 0 && mouse.y > 0) {
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
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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
