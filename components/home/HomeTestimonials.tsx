"use client";

import { m, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Quote, Star } from "lucide-react";

const voices = [
  {
    quote:
      "It felt less like a tool and more like a brilliant friend who already understood my career. I had three final rounds in a week.",
    author: "Mira Kapoor",
    role: "Senior PM, Stripe",
    accent: "from-sky-400 to-cyan-400",
  },
  {
    quote:
      "I went from a generic CV to a cover letter that actually sounds like me. The outreach sequence got me 11 interviews in two weeks.",
    author: "Daniel Okafor",
    role: "Staff Engineer, Vercel",
    accent: "from-cyan-400 to-blue-500",
  },
  {
    quote:
      "The skill-gap map was a slap of clarity. I spent 30 days on the curriculum and landed a role I wasn't sure I was ready for.",
    author: "Anya Petrova",
    role: "Product Designer, Linear",
    accent: "from-blue-500 to-violet-500",
  },
];

const press = [
  "TechCrunch",
  "The Verge",
  "WIRED",
  "Fast Company",
  "Product Hunt",
  "Hacker News",
];

export function HomeTestimonials() {
  return (
    <section id="testimonials" className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-violet-600">
              — Voices
            </span>
            <h2 className="mt-4 font-instrument text-[clamp(2.2rem,4.6vw,3.8rem)] leading-[1.02] tracking-tight text-slate-900">
              Hired humans.
              <br />
              <span className="italic text-slate-500">Living their best chapter.</span>
            </h2>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-2 text-xs text-slate-600">
              4.92 · 1,240 reviews
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {voices.map((v, i) => (
            <VoiceCard key={v.author} v={v} index={i} />
          ))}
        </div>

        {/* press marquee */}
        <div className="mt-24 overflow-hidden">
          <p className="mb-6 text-center font-mono text-[11px] uppercase tracking-[0.3em] text-slate-400">
            As seen in
          </p>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-[#f4f7ff] to-transparent" />
            <div className="absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-[#f4f7ff] to-transparent" />
            <div className="flex w-max animate-marquee gap-16 py-2">
              {[...press, ...press, ...press].map((p, i) => (
                <span
                  key={`${p}-${i}`}
                  className="font-instrument text-3xl tracking-tight text-slate-300 transition hover:text-slate-700"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function VoiceCard({
  v,
  index,
}: {
  v: (typeof voices)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <m.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white/80 p-7 shadow-sm backdrop-blur"
    >
      <div
        className={`pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br ${v.accent} opacity-20 blur-2xl transition-opacity duration-500 group-hover:opacity-40`}
      />
      <Quote className="h-7 w-7 text-sky-500" />
      <m.p
        style={{ y }}
        className="mt-5 font-instrument text-2xl leading-snug text-slate-800"
      >
        &ldquo;{v.quote}&rdquo;
      </m.p>
      <div className="mt-7 flex items-center gap-3">
        <div
          className={`grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br ${v.accent} font-mono text-sm font-bold text-white shadow`}
        >
          {v.author
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>
        <div>
          <div className="text-sm font-medium text-slate-900">{v.author}</div>
          <div className="text-xs text-slate-500">{v.role}</div>
        </div>
      </div>
    </m.div>
  );
}
