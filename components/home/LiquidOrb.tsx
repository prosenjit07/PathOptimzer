"use client";

import { m, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

/**
 * LiquidOrb — an Apple Intelligence–style floating iridescent orb.
 * A SVG metaball blob with chromatic highlights, parallax tilt and a
 * reactive ripple that follows the pointer.
 */
export function LiquidOrb({
  size = 360,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const wrap = useRef<HTMLDivElement | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 80, damping: 14 });
  const smy = useSpring(my, { stiffness: 80, damping: 14 });
  const rx = useTransform(smy, [-200, 200], [18, -18]);
  const ry = useTransform(smx, [-200, 200], [-18, 18]);
  const px = useTransform(smx, (v) => v * 0.04);
  const py = useTransform(smy, (v) => v * 0.04);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      mx.set(e.clientX - (r.left + r.width / 2));
      my.set(e.clientY - (r.top + r.height / 2));
    };
    const onLeave = () => {
      mx.set(0);
      my.set(0);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [mx, my]);

  return (
    <div
      ref={wrap}
      className={`relative isolate ${className}`}
      style={{ width: size, height: size }}
    >
      <m.div
        className="absolute inset-0"
        style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
      >
        {/* soft glow halo */}
        <div
          className="absolute -inset-1/3 blur-3xl opacity-80 animate-pulse-soft"
          style={{
            background:
              "conic-gradient(from 120deg, #7dd3fc, #5b8dff, #a78bfa, #67e8f9, #7dd3fc)",
            borderRadius: "50%",
          }}
        />
        {/* iridescent body */}
        <m.svg
          viewBox="0 0 200 200"
          className="relative h-full w-full"
          style={{ x: px, y: py }}
        >
          <defs>
            <radialGradient id="orbCore" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="35%" stopColor="#cfe6ff" stopOpacity="0.95" />
              <stop offset="65%" stopColor="#7aa8ff" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#3b6cff" stopOpacity="1" />
            </radialGradient>
            <radialGradient id="orbRim" cx="50%" cy="50%" r="50%">
              <stop offset="80%" stopColor="rgba(255,255,255,0)" />
              <stop offset="92%" stopColor="rgba(255,255,255,0.6)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
            <filter id="orbGoo">
              <feGaussianBlur stdDeviation="6" result="b" />
              <feColorMatrix
                in="b"
                type="matrix"
                values="1 0 0 0 0  0 0 1 0 0  0 0 0 1 0  0 0 0 22 -10"
              />
            </filter>
            <filter id="orbShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="20"
                stdDeviation="22"
                floodColor="#3b82f6"
                floodOpacity="0.35"
              />
            </filter>
          </defs>

          <m.g
            filter="url(#orbGoo)"
            animate={{ rotate: 360 }}
            transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "100px 100px" }}
          >
            {[
              { cx: 80, cy: 90, r: 40, fill: "#5b8dff" },
              { cx: 130, cy: 80, r: 36, fill: "#7dd3fc" },
              { cx: 100, cy: 130, r: 38, fill: "#a78bfa" },
              { cx: 60, cy: 130, r: 30, fill: "#67e8f9" },
              { cx: 140, cy: 130, r: 28, fill: "#c4b5fd" },
            ].map((c, i) => (
              <m.circle
                key={i}
                cx={c.cx}
                cy={c.cy}
                r={c.r}
                fill={c.fill}
                animate={{
                  cx: [c.cx, c.cx + 6, c.cx - 4, c.cx],
                  cy: [c.cy, c.cy - 4, c.cy + 6, c.cy],
                }}
                transition={{
                  duration: 6 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </m.g>

          <circle
            cx="100"
            cy="100"
            r="78"
            fill="url(#orbCore)"
            filter="url(#orbShadow)"
          />
          <circle cx="100" cy="100" r="78" fill="url(#orbRim)" />
          {/* highlight */}
          <ellipse
            cx="78"
            cy="68"
            rx="32"
            ry="14"
            fill="rgba(255,255,255,0.45)"
            transform="rotate(-22 78 68)"
          />
          <ellipse
            cx="120"
            cy="140"
            rx="22"
            ry="6"
            fill="rgba(255,255,255,0.18)"
            transform="rotate(-22 120 140)"
          />
        </m.svg>
      </m.div>
    </div>
  );
}
