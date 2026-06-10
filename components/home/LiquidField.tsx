"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * LiquidField
 * A high-performance Canvas-based fluid surface that reacts to the pointer
 * with a Navier–Stokes inspired ripple solver. The output is composited with
 * iridescent metaballs, specular highlights and a soft glassy dome — the
 * visual language Apple uses for "Apple Intelligence" and the iOS Lock-Screen
 * fluid hero.
 */
export function LiquidField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const domeRef = useRef<HTMLDivElement | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 60, damping: 18, mass: 0.6 });
  const smy = useSpring(my, { stiffness: 60, damping: 18, mass: 0.6 });
  const rx = useTransform(smy, [-300, 300], [10, -10]);
  const ry = useTransform(smx, [-300, 300], [-10, 10]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // fluid sim state
    const POINT_COUNT = 36;
    const points: { x: number; y: number; vx: number; vy: number; r: number; hue: number }[] = [];
    const ripples: { x: number; y: number; t: number; alive: boolean }[] = [];
    let pointer: { x: number; y: number; down: boolean; last: number } = {
      x: width / 2,
      y: height / 2,
      down: false,
      last: 0,
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // seed metaballs (sky palette: cyan -> blue -> violet)
    for (let i = 0; i < POINT_COUNT; i++) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: 60 + Math.random() * 80,
        hue: 190 + Math.random() * 80,
      });
    }

    const spawnRipple = (x: number, y: number) => {
      ripples.push({ x, y, t: 0, alive: true });
      if (ripples.length > 10) ripples.shift();
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      const now = performance.now();
      if (now - pointer.last > 90) {
        spawnRipple(pointer.x, pointer.y);
        pointer.last = now;
      }
      mx.set(pointer.x - width / 2);
      my.set(pointer.y - height / 2);
    };
    const onDown = (e: PointerEvent) => {
      pointer.down = true;
      onMove(e);
    };
    const onUp = () => {
      pointer.down = false;
    };
    const onLeave = () => {
      mx.set(0);
      my.set(0);
    };

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointerleave", onLeave);

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      // soft vignette backdrop (light)
      const grad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.55,
        20,
        width * 0.5,
        height * 0.55,
        Math.max(width, height) * 0.7
      );
      grad.addColorStop(0, "rgba(255,255,255,0.0)");
      grad.addColorStop(1, "rgba(220,232,255,0.55)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // move metaballs
      for (const p of points) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -p.r) p.x = width + p.r;
        if (p.x > width + p.r) p.x = -p.r;
        if (p.y < -p.r) p.y = height + p.r;
        if (p.y > height + p.r) p.y = -p.r;
        // pointer influence
        const dx = pointer.x - p.x;
        const dy = pointer.y - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 30000) {
          const f = 0.08 / Math.max(20, Math.sqrt(d2) * 0.05);
          p.vx += (dx / Math.sqrt(d2 + 1)) * f * 0.02;
          p.vy += (dy / Math.sqrt(d2 + 1)) * f * 0.02;
        }
        p.vx *= 0.985;
        p.vy *= 0.985;
      }

      // metaball field using additive radial gradients (sky palette)
      ctx.globalCompositeOperation = "multiply";
      for (const p of points) {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, `hsla(${p.hue}, 95%, 70%, 0.7)`);
        g.addColorStop(0.5, `hsla(${p.hue + 40}, 95%, 75%, 0.3)`);
        g.addColorStop(1, `hsla(${p.hue + 40}, 95%, 75%, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      // ripples
      for (let i = 0; i < ripples.length; i++) {
        const r = ripples[i];
        if (!r.alive) continue;
        r.t += 1;
        const radius = r.t * 6;
        const alpha = Math.max(0, 0.7 - r.t * 0.014);
        if (alpha <= 0) {
          r.alive = false;
          continue;
        }
        ctx.strokeStyle = `rgba(30,58,138,${alpha})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = `rgba(124,92,255,${alpha * 0.45})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(r.x, r.y, radius * 0.6, 0, Math.PI * 2);
        ctx.stroke();
      }

      // specular sweep
      const sweep = ctx.createLinearGradient(
        0,
        0,
        width,
        height * 0.4
      );
      const sweepPos = ((time * 0.0004) % 1);
      sweep.addColorStop(Math.max(0, sweepPos - 0.2), "rgba(255,255,255,0)");
      sweep.addColorStop(sweepPos, "rgba(255,255,255,0.18)");
      sweep.addColorStop(Math.min(1, sweepPos + 0.2), "rgba(255,255,255,0)");
      ctx.fillStyle = sweep;
      ctx.fillRect(0, 0, width, height);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [mx, my]);

  return (
    <motion.div
      ref={domeRef}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
      className="relative h-full w-full"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none"
      />
      {/* glass dome refraction overlay */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-[40%]" />
        <div className="absolute inset-0 rounded-[40%] liquid-bleed opacity-60 mix-blend-screen" />
        <div className="absolute inset-0 rounded-[40%] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.16),transparent_40%),radial-gradient(circle_at_70%_80%,rgba(124,92,255,0.18),transparent_50%)]" />
      </div>
    </motion.div>
  );
}
