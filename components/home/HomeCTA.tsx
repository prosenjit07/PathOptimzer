"use client";

import Link from "next/link";
import { m, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { LiquidField } from "./LiquidField";

export function HomeCTA() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-32"
    >
      <div className="mx-auto max-w-7xl px-6">
        <m.div
          style={{ y }}
          className="relative isolate overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white px-6 py-20 shadow-[0_40px_120px_-30px_rgba(31,64,175,0.3)] sm:px-16 sm:py-28"
        >
          {/* liquid field bg */}
          <div className="absolute inset-0 -z-10">
            <LiquidField />
          </div>
          {/* light veil for legibility */}
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-white/40 via-white/10 to-white/60" />
          {/* grain */}
          <div className="grain pointer-events-none absolute inset-0 -z-10 opacity-50" />

          <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-sky-600">
                — Begin
              </span>
              <h2 className="mt-4 font-instrument text-[clamp(2.6rem,6vw,5rem)] leading-[0.95] tracking-tight">
                <span className="liquid-text">
                  Pour yourself into the
                </span>
                <br />
                <span className="italic text-slate-900">
                  role you actually want.
                </span>
              </h2>
              <p className="mt-5 max-w-xl text-pretty text-base text-slate-700">
                Spin up the studio. Bring a CV, a voice memo, or a dream.
                We&apos;ll start sculpting by the time you finish reading this sentence.
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 lg:col-span-4 lg:items-end">
              <Link
                href="/sign-up"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-slate-900 px-7 py-4 text-base font-semibold text-white transition hover:bg-slate-800"
              >
                <span className="relative z-10">Start sculpting — free</span>
                <ArrowRight className="relative z-10 h-4 w-4 transition group-hover:translate-x-1" />
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-sky-300 to-transparent opacity-80 transition-transform duration-700 group-hover:translate-x-full" />
              </Link>
              <Link
                href="/sign-in"
                className="text-sm text-slate-600 transition hover:text-slate-900"
              >
                Have an account? <span className="underline">Sign in</span>
              </Link>
              <p className="mt-2 max-w-xs text-xs text-slate-500 lg:text-right">
                No credit card. Three full résumés, free forever.
              </p>
            </div>
          </div>
        </m.div>
      </div>
    </section>
  );
}
