"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Github, Twitter, Linkedin, ArrowUpRight } from "lucide-react";

const columns = [
  {
    title: "Studio",
    links: [
      { name: "Résumé Engine", href: "/dashboard" },
      { name: "Cover Letters", href: "/dashboard" },
      { name: "Outreach Sequencer", href: "/dashboard" },
      { name: "Interview Briefs", href: "/dashboard" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About", href: "#" },
      { name: "Manifesto", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Press", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Field guide", href: "#" },
      { name: "Templates", href: "/resume-templates" },
      { name: "Changelog", href: "#" },
      { name: "Status", href: "#" },
    ],
  },
];

export function HomeFooter() {
  return (
    <footer className="relative border-t border-slate-200 bg-white/70 py-20 backdrop-blur">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-sky-400 via-blue-500 to-violet-500 font-instrument text-lg font-bold text-white shadow-[0_8px_22px_-6px_rgba(59,130,246,0.55)]">
                P
              </span>
              <span className="font-instrument text-lg text-slate-900">
                PathOptimizer
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-pretty text-sm leading-relaxed text-slate-600">
              A generative career studio. We don&apos;t write résumés, we
              pour them.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {[
                { icon: Twitter, href: "#" },
                { icon: Github, href: "https://github.com/prosenjit07" },
                { icon: Linkedin, href: "#" },
              ].map((s, i) => (
                <motion.a
                  key={i}
                  href={s.href}
                  whileHover={{ y: -2 }}
                  className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:text-slate-900"
                >
                  <s.icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {columns.map((c) => (
            <div key={c.title} className="md:col-span-2">
              <p className="font-mono text-[11px] uppercase tracking-widest text-slate-400">
                {c.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.name}>
                    <Link
                      href={l.href}
                      className="group inline-flex items-center gap-1 text-sm text-slate-600 transition hover:text-slate-900"
                    >
                      {l.name}
                      <ArrowUpRight className="h-3 w-3 opacity-0 transition group-hover:opacity-60" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="md:col-span-1">
            <p className="font-mono text-[11px] uppercase tracking-widest text-slate-400">
              Connect
            </p>
            <Link
              href="mailto:hello@pathoptimizer.ai"
              className="mt-4 block text-sm text-slate-600 transition hover:text-slate-900"
            >
              hello@pathoptimizer.ai
            </Link>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center">
          <p>© 2026 PathOptimizer. Crafted in liquid form.</p>
          <div className="flex items-center gap-5">
            <Link href="#" className="hover:text-slate-900">
              Privacy
            </Link>
            <Link href="#" className="hover:text-slate-900">
              Terms
            </Link>
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-500 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sky-500" />
              </span>
              All systems pouring
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
