"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { m, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, ArrowDown, Play, Stars, Cpu, Mail, FileText, Briefcase } from "lucide-react";
import { LiquidOrb } from "./LiquidOrb";

export function HomeHero() {
  const { isSignedIn } = useUser();
  const wrap = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: wrap,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);

  return (
    <section
      ref={wrap}
      className="relative isolate overflow-hidden pb-24 pt-40 sm:pt-48"
    >
      {/* layered atmospheric backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(125,175,255,0.45),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(40%_35%_at_80%_20%,rgba(196,181,253,0.35),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(40%_35%_at_15%_70%,rgba(186,230,253,0.45),transparent_60%)]" />
        <div className="absolute inset-0 bg-grid-faint [background-size:64px_64px] [mask-image:radial-gradient(60%_60%_at_50%_30%,black,transparent_75%)] opacity-60" />
        <m.div
          className="absolute -top-32 left-1/2 h-[44rem] w-[44rem] -translate-x-1/2 rounded-full liquid-bleed"
          animate={{ rotate: 360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <m.div style={{ y, opacity, scale }} className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/70 px-3 py-1.5 text-xs text-slate-700 shadow-sm backdrop-blur"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-500 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sky-500" />
              </span>
              <span className="font-mono uppercase tracking-widest text-slate-600">
                Introducing · Career OS v2
              </span>
              <span className="ml-1 rounded-full bg-slate-900 px-1.5 py-0.5 text-[10px] font-medium text-white">
                liquid
              </span>
            </m.div>

            <m.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="font-instrument text-[clamp(2.6rem,7vw,5.6rem)] leading-[0.95] tracking-tight text-slate-900"
            >
              <span className="block">From a rough draft,</span>
              <span className="block">
                to{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-sky-500 via-blue-600 to-violet-600 bg-clip-text italic text-transparent">
                    career&nbsp;artifact.
                  </span>
                  <svg
                    viewBox="0 0 300 12"
                    className="absolute -bottom-2 left-0 w-full text-sky-500"
                    fill="none"
                  >
                    <m.path
                      d="M2 6 Q 50 0 100 6 T 200 6 T 298 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.6, delay: 0.6 }}
                    />
                  </svg>
                </span>
              </span>
            </m.h1>

            <m.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-7 max-w-xl text-balance text-lg text-slate-600"
            >
             PathOptimizer is a generative career platform that crafts résumé and cover letter and automate HR outreach, streamlining your job application process end-to-end.
            </m.p>

            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <Link
                href={isSignedIn ? "/dashboard" : "/sign-up"}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <span className="relative z-10">
                  {isSignedIn ? "Open the studio" : "Start free — no card"}
                </span>
                <ArrowRight className="relative z-10 h-4 w-4 transition group-hover:translate-x-1" />
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-sky-300 to-transparent opacity-80 transition-transform duration-700 group-hover:translate-x-full" />
              </Link>

              <Link
                href="#showcase"
                className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-5 py-3 text-sm text-slate-800 shadow-sm backdrop-blur transition hover:bg-white"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-900 text-white">
                  <Play className="h-3 w-3 fill-current" />
                </span>
                Watch the showcase
              </Link>
            </m.div>

            <m.dl
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-12 grid max-w-md grid-cols-3 divide-x divide-slate-200 rounded-2xl border border-slate-200 bg-white/80 p-1 shadow-sm backdrop-blur"
            >
              {[
                { k: "12.4k", v: "résumés sculpted" },
                { k: "3.1×", v: "more callbacks" },
                { k: "47", v: "industries" },
              ].map((s) => (
                <div key={s.v} className="px-4 py-3 text-center">
                  <dt className="font-instrument text-2xl text-slate-900">
                    {s.k}
                  </dt>
                  <dd className="mt-0.5 text-[11px] uppercase tracking-widest text-slate-500">
                    {s.v}
                  </dd>
                </div>
              ))}
            </m.dl>
          </div>

          <m.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="relative lg:col-span-5"
          >
            <div className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center">
              {/* big soft halo */}
              <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_90deg,#7dd3fc,#5b8dff,#a78bfa,#67e8f9,#7dd3fc)] opacity-50 blur-3xl animate-blob" />

              <LiquidOrb size={420} className="relative" />

              {/* orbiting chips */}
              {[
                { icon: FileText, label: "Résumé", angle: -30, dist: 200, color: "bg-sky-100 text-sky-800 border-sky-200" },
                { icon: Briefcase, label: "Interview", angle: 60, dist: 220, color: "bg-violet-100 text-violet-800 border-violet-200" },
                { icon: Mail, label: "Outreach", angle: 150, dist: 210, color: "bg-blue-100 text-blue-800 border-blue-200" },
                { icon: Cpu, label: "Coach", angle: 230, dist: 220, color: "bg-cyan-100 text-cyan-800 border-cyan-200" },
              ].map((chip, i) => {
                const rad = (chip.angle * Math.PI) / 180;
                return (
                  <m.div
                    key={chip.label}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.1, duration: 0.6 }}
                    className="absolute"
                    style={{
                      left: "50%",
                      top: "50%",
                      transform: `translate(${Math.cos(rad) * chip.dist - 32}px, ${
                        Math.sin(rad) * chip.dist - 32
                      }px)`,
                    }}
                  >
                    <m.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
                      className={`flex items-center gap-1.5 rounded-full border ${chip.color} px-3 py-1.5 text-xs font-medium shadow-lg backdrop-blur`}
                    >
                      <chip.icon className="h-3 w-3" />
                      {chip.label}
                    </m.div>
                  </m.div>
                );
              })}

              {/* floating glass card */}
              <m.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="absolute -bottom-6 right-0 max-w-[240px] rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-xl backdrop-blur-xl"
              >
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Stars className="h-3.5 w-3.5 text-sky-600" />
                  Live preview
                </div>
                <p className="mt-2 font-instrument text-base leading-snug text-slate-900">
                 Transformed an engineer’s career journey into a polished résumé in 11 seconds.
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                  <span>— mira.k</span>
                  <span>now @ Stripe</span>
                </div>
              </m.div>
            </div>
          </m.div>
        </div>

        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-20 flex items-center justify-center"
        >
          <Link
            href="#features"
            className="group flex flex-col items-center gap-1 text-[11px] uppercase tracking-[0.3em] text-slate-500 transition hover:text-slate-900"
          >
            Scroll into the studio
            <ArrowDown className="h-4 w-4 animate-bounce" />
          </Link>
        </m.div>
      </m.div>
    </section>
  );
}
