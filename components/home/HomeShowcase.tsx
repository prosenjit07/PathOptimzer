"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const stats = [
  { kpi: "12,400+", label: "résumés poured" },
  { kpi: "3.1×", label: "more callbacks, on average" },
  { kpi: "47", label: "industries served" },
  { kpi: "94%", label: "say it sounds like them" },
];

const faqs = [
  {
    q: "Will my résumé still sound like me?",
    a: "Yes. PathOptimizer reads the grain of your voice before it writes a word. The first draft is a mirror, not a mask — every line is editable, every claim stays yours.",
  },
  {
    q: "What does the AI actually look at?",
    a: "Only what you give it. We parse documents on our servers, never train on your data, and you can delete everything in one click.",
  },
  {
    q: "Is the free plan really free?",
    a: "Yes — three full résumés, one cover letter, and the outreach studio on us. Pro unlocks unlimited projects, voice brief, and the recruiter-curated templates.",
  },
];

export function HomeShowcase() {
  return (
    <>
      <HomeStats />
      <HomeFAQ />
    </>
  );
}

function HomeStats() {
  return (
    <section className="relative py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((s, i) => (
            <StatItem key={s.label} s={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatItem({
  s,
  index,
}: {
  s: (typeof stats)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300 to-transparent" />
      <div className="font-instrument text-5xl tracking-tight text-slate-900">
        {s.kpi}
      </div>
      <p className="mt-2 text-sm text-slate-500">{s.label}</p>
    </motion.div>
  );
}

function HomeFAQ() {
  return (
    <section id="faq" className="relative py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-12 grid grid-cols-1 items-end gap-6 md:grid-cols-12">
          <div className="md:col-span-7">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-rose-500">
              — Field notes
            </span>
            <h2 className="mt-4 font-instrument text-[clamp(2rem,4vw,3.4rem)] leading-[1.02] tracking-tight text-slate-900">
              Questions, asked{" "}
              <span className="italic text-slate-500">honestly.</span>
            </h2>
          </div>
        </div>

        <ul className="space-y-3">
          {faqs.map((f, i) => (
            <FAQItem key={f.q} f={f} i={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function FAQItem({
  f,
  i,
}: {
  f: (typeof faqs)[number];
  i: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.li
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: i * 0.05 }}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="font-instrument text-xl text-slate-900">{f.q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          className="grid h-7 w-7 place-items-center rounded-full border border-slate-200 bg-white text-slate-700"
        >
          +
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden"
      >
        <p className="px-6 pb-6 text-sm leading-relaxed text-slate-600">
          {f.a}
        </p>
      </motion.div>
    </motion.li>
  );
}
