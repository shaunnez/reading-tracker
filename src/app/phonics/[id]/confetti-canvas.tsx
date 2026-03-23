"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#ff595e", "#ffca3a", "#6a4c93", "#1982c4", "#8ac926", "#ff6d00", "#ee9b00", "#f72585"];

export default function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    type Particle = {
      x: number; y: number; vx: number; vy: number;
      color: string; w: number; h: number; angle: number; spin: number;
    };

    const particles: Particle[] = Array.from({ length: 150 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: -20 - (i / 150) * 200,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * 4 + 1.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      w: Math.random() * 14 + 6,
      h: Math.random() * 7 + 4,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.25,
    }));

    let rafId: number;

    function frame() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      let anyVisible = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.09;
        p.angle += p.spin;
        if (p.y < canvas!.height + 20) {
          anyVisible = true;
          const alpha = Math.max(0, 1 - p.y / (canvas!.height * 0.9));
          ctx!.save();
          ctx!.globalAlpha = alpha;
          ctx!.translate(p.x, p.y);
          ctx!.rotate(p.angle);
          ctx!.fillStyle = p.color;
          ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx!.restore();
        }
      }
      if (anyVisible) {
        rafId = requestAnimationFrame(frame);
      }
    }

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[200] pointer-events-none"
      aria-hidden="true"
    />
  );
}
