"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { FileText, Mail, Briefcase, BarChart3, Sparkles, Wand2 } from "lucide-react";

const features = [
  {
    n: "01",
    title: "Liquid Résumé Engine",
    body: "A draft that re-flows itself as you speak. Paste any background — LinkedIn, a brain-dump, a PDF — and watch a typographically-sharp résumé crystallize in seconds.",
    icon: FileText,
    accent: "from-sky-400 to-cyan-400",
  },
  {
    n: "02",
    title: "Cover Letters with Pulse",
    body: "No more cover letter purgatory. Compose a letter that inhales the job description, exhales your narrative, and lands in a hiring manager's inbox already half-sold.",
    icon: Wand2,
    accent: "from-cyan-400 to-blue-500",
  },
  {
    n: "03",
    title: "Outreach, in Bulk",
    body: "A studio for sequencing. Personalize 500 cold emails, track opens, and iterate copy in the same canvas — built on Resend + Sheets, so your list stays your list.",
    icon: Mail,
    accent: "from-blue-500 to-violet-500",
  },
  {
    n: "04",
    title: "Interview Briefs",
    body: "Walk in with the dossier. We distill company filings, news, and your gap-map into a 90-second study guide that sharpens your story on the way to the room.",
    icon: Briefcase,
    accent: "from-violet-500 to-fuchsia-400",
  },
  {
    n: "05",
    title: "Skill-Gap Cartography",
    body: "Visualize the delta between you and the role. Receive a curated curriculum — courses, projects, prompts — that closes the gap with surgical precision.",
    icon: BarChart3,
    accent: "from-sky-400 to-violet-500",
  },
  {
    n: "06",
    title: "Taste-Aware Templates",
    body: "Six rigorously-designed templates — none of them generic. They breathe, they rebalance, and they read like a magazine, not a form.",
    icon: Sparkles,
    accent: "from-cyan-400 to-fuchsia-400",
  },
];

export function HomeFeatures() {
  const wrap = useRef<HTMLDivElement | null>(null);
  const inView = useInView(wrap, { once: true, margin: "-100px" });

  return (
    <section id="features" className="relative py-32">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
        <div className="absolute inset-x-0 top-1/2 -z-10 h-px bg-slate-200/60" />
      </div>

      <div className="mx-auto max-w-7xl px-6">
        <div ref={wrap} className="mb-16 grid grid-cols-1 items-end gap-6 md:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="md:col-span-7"
          >
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-sky-600">
              — The Studio
            </span>
            <h2 className="mt-4 font-instrument text-[clamp(2.2rem,4.6vw,3.8rem)] leading-[1.02] tracking-tight text-slate-900">
              Six instruments,
              <br />
              <span className="italic text-slate-500">one continuous gesture.</span>
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-pretty text-base text-slate-600 md:col-span-5"
          >
            Every module talks to every other. Update your résumé and your
            cover letter, outreach, and interview brief all re-mold
            themselves — the way ink follows water.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <FeatureCard key={f.n} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white/70 p-7 shadow-sm backdrop-blur transition-shadow hover:shadow-[0_30px_60px_-30px_rgba(31,64,175,0.35)]"
    >
      {/* hover gradient */}
      <div
        className={`pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br ${feature.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-20`}
      />
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(125,175,255,0.18),transparent_50%)]" />
      </div>

      <div className="relative flex items-start justify-between">
        <motion.div
          whileHover={{ rotate: 8, scale: 1.08 }}
          className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${feature.accent} text-white shadow-lg`}
        >
          <feature.icon className="h-5 w-5" />
        </motion.div>
        <span className="font-mono text-xs tracking-widest text-slate-400">
          {feature.n}
        </span>
      </div>

      <h3 className="mt-6 font-instrument text-2xl text-slate-900">
        {feature.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {feature.body}
      </p>

      <div className="mt-7 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-slate-500">
          <span className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${feature.accent}`} />
          {index % 2 === 0 ? "Included" : "Pro"}
        </div>
        <span className="text-xs text-slate-400 transition group-hover:text-slate-700">
          Explore →
        </span>
      </div>
    </motion.div>
  );
}
