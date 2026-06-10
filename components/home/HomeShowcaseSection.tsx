"use client";

import { m, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { LiquidField } from "./LiquidField";
import { ScanLine, FileText, Mail, Sparkles, ArrowUpRight } from "lucide-react";

export function HomeShowcaseSection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const yText = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1, 1.04]);

  return (
    <section
      id="showcase"
      ref={ref}
      className="relative overflow-hidden py-32"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-12">
        <m.div style={{ y: yText }} className="lg:col-span-5">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-600">
            — Liquid Studio
          </span>
          <h2 className="mt-4 font-instrument text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.98] tracking-tight text-slate-900">
            A surface that{" "}
            <span className="italic text-slate-500">remembers</span>
            <br />
            the shape you want to be.
          </h2>
          <p className="mt-5 max-w-md text-pretty text-base text-slate-600">
            Move your cursor across the surface. The studio responds — every
            gesture a brushstroke, every save a mold. This is what an AI
            career tool feels like when it&apos;s been designed by people who
            actually care.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-slate-700">
            {[
              { icon: ScanLine, label: "Pointer-reactive metaballs" },
              { icon: FileText, label: "Glass-dome refraction" },
              { icon: Mail, label: "Iridescent chrome highlights" },
            ].map((it) => (
              <li key={it.label} className="flex items-center gap-3">
                <span className="grid h-7 w-7 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm">
                  <it.icon className="h-3.5 w-3.5" />
                </span>
                {it.label}
              </li>
            ))}
          </ul>
          <a
            href="#cta"
            className="group mt-8 inline-flex items-center gap-1.5 text-sm text-slate-700 transition hover:text-slate-900"
          >
            Try the studio
            <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </m.div>

        <div className="relative lg:col-span-7">
          <m.div
            style={{ scale }}
            className="relative aspect-[5/4] overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_40px_120px_-20px_rgba(31,64,175,0.25)]"
          >
            <LiquidField />

            {/* floating glass panels */}
            <m.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="absolute left-6 top-6 max-w-[260px] rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-xl backdrop-blur-xl"
            >
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-slate-500">
                <Sparkles className="h-3 w-3 text-sky-600" />
                Co-pilot
              </div>
              <p className="mt-2 font-instrument text-lg leading-snug text-slate-900">
                Tighten the summary to one breath. Keep the metrics.
              </p>
              <div className="mt-3 flex items-center gap-1.5">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700">
                  Refine
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700">
                  Make sharper
                </span>
                <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-medium text-white">
                  Apply
                </span>
              </div>
            </m.div>

            <m.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="absolute bottom-6 right-6 max-w-[260px] rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-xl backdrop-blur-xl"
            >
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-slate-500">
                <Mail className="h-3 w-3 text-blue-600" />
                Sequence · live
              </div>
              <div className="mt-3 space-y-1.5">
                {[
                  { c: "Stripe · Recruiter", s: "Replied", color: "bg-emerald-500" },
                  { c: "Vercel · Eng Lead", s: "Opened", color: "bg-sky-500" },
                  { c: "Linear · Founder", s: "Bounced", color: "bg-rose-500" },
                ].map((r) => (
                  <div
                    key={r.c}
                    className="flex items-center justify-between text-xs text-slate-700"
                  >
                    <span className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${r.color}`} />
                      {r.c}
                    </span>
                    <span className="text-slate-500">{r.s}</span>
                  </div>
                ))}
              </div>
            </m.div>

            {/* light flare */}
            <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-sky-300/40 blur-3xl" />
          </m.div>
        </div>
      </div>
    </section>
  );
}
