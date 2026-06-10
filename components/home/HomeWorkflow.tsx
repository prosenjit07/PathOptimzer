"use client";

import { m, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";
import { Sparkles, FileText, Mail, Send, CheckCircle2 } from "lucide-react";

const steps = [
  {
    n: "01",
    title: "Seed the studio",
    body: "Drop a CV, a Notion doc, or a voice memo. We parse it the way a recruiter would — but in under four seconds.",
    icon: Sparkles,
    color: "bg-sky-500 text-white",
  },
  {
    n: "02",
    title: "Compose the surface",
    body: "Choose a template, a tone, a target. The system materializes three directions, you steer, it learns.",
    icon: FileText,
    color: "bg-blue-500 text-white",
  },
  {
    n: "03",
    title: "Brief the moment",
    body: "Paste a job link. The AI excavates the role, the company, and the unspoken — and pours it back into your draft.",
    icon: Mail,
    color: "bg-violet-500 text-white",
  },
  {
    n: "04",
    title: "Send it like a signal",
    body: "Export, share, or fire your campaign. Track opens, replies, and bookings on a single quiet dashboard.",
    icon: Send,
    color: "bg-cyan-500 text-white",
  },
];

export function HomeWorkflow() {
  const wrap = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: wrap,
    offset: ["start 80%", "end 30%"],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      id="workflow"
      ref={wrap}
      className="relative overflow-hidden py-32"
    >
      <div className="pointer-events-none absolute -left-40 top-1/2 -z-10 h-96 w-96 rounded-full bg-violet-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-1/3 -z-10 h-96 w-96 rounded-full bg-sky-200/50 blur-3xl" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-blue-600">
            — Workflow
          </span>
          <h2 className="mt-4 font-instrument text-[clamp(2.2rem,4.6vw,3.8rem)] leading-[1.02] tracking-tight text-slate-900">
            From raw noise to a
            <br />
            <span className="italic text-slate-500">delivered offer letter.</span>
          </h2>
        </div>

        <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* progress line */}
          <div className="relative hidden lg:block">
            <div className="absolute left-[27px] top-2 h-[calc(100%-1rem)] w-px bg-slate-200" />
            <m.div
              style={{ height: lineHeight }}
              className="absolute left-[27px] top-2 w-px bg-gradient-to-b from-sky-500 via-blue-500 to-violet-500"
            />
            <ol className="space-y-16">
              {steps.map((s, i) => (
                <Step key={s.n} step={s} index={i} />
              ))}
            </ol>
          </div>

          {/* mobile */}
          <ol className="space-y-8 lg:hidden">
            {steps.map((s, i) => (
              <Step key={s.n} step={s} index={i} />
            ))}
          </ol>

          {/* sticky right panel */}
          <div className="relative hidden lg:block">
            <div className="sticky top-32">
              <WorkflowMockup />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Step({
  step,
  index,
}: {
  step: (typeof steps)[number];
  index: number;
}) {
  const ref = useRef<HTMLLIElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <m.li
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1 }}
      className="relative pl-16"
    >
      <div
        className={`absolute left-0 top-0 grid h-14 w-14 place-items-center rounded-2xl ${step.color} font-mono text-sm font-bold shadow-lg`}
      >
        {step.n}
      </div>
      <h3 className="font-instrument text-2xl text-slate-900">{step.title}</h3>
      <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-slate-600">
        {step.body}
      </p>
      <div className="mt-3 flex items-center gap-2 text-[11px] uppercase tracking-widest text-slate-500">
        <step.icon className="h-3 w-3" />
        Step {index + 1} of {steps.length}
      </div>
    </m.li>
  );
}

function WorkflowMockup() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-1 shadow-[0_30px_80px_-30px_rgba(31,64,175,0.35)]">
      <div className="rounded-[1.4rem] border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          </div>
          <span className="font-mono text-[11px] tracking-widest text-slate-400">
            studio.pathoptimizer.ai
          </span>
        </div>

        <div className="mt-6 space-y-3">
          <m.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Sparkles className="h-3.5 w-3.5 text-sky-600" />
              Seed input
            </div>
            <div className="mt-2 font-mono text-xs text-slate-700">
              linkedin.com/in/mira-kapoor · 9y PM
            </div>
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Résumé · generated
              </span>
              <span className="font-mono text-slate-500">3.2s</span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-1">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <m.div
                    key={i}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.05, duration: 0.4 }}
                    className="h-1.5 origin-left rounded-full bg-gradient-to-r from-emerald-200 to-emerald-500"
                    style={{ width: `${30 + (i * 11) % 70}%` }}
                  />
              ))}
            </div>
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-sky-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Outreach · sequenced
              </span>
              <span className="font-mono text-slate-500">347 sent</span>
            </div>
            <div className="mt-3 flex h-16 items-end gap-1">
              {[28, 42, 36, 58, 47, 62, 75, 64, 82, 70, 90, 78, 95].map(
                (h, i) => (
                  <m.div
                    key={i}
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 + i * 0.04, duration: 0.4 }}
                    style={{ height: `${h}%` }}
                    className="flex-1 origin-bottom rounded-t-sm bg-gradient-to-t from-sky-200 to-sky-500"
                  />
                )
              )}
            </div>
          </m.div>
        </div>
      </div>

      {/* edge glow */}
      <div className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br from-sky-200/40 via-transparent to-violet-200/40" />
    </div>
  );
}
