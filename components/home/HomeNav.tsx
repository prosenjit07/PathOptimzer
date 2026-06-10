"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  m,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useState } from "react";
import { Menu, X, Sparkles, ArrowUpRight } from "lucide-react";

const navItems = [
  { name: "Studio", href: "#features" },
  { name: "Workflow", href: "#workflow" },
  { name: "Showcase", href: "#showcase" },
  { name: "Voices", href: "#testimonials" },
];

export function HomeNav() {
  const { isSignedIn } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const blur = useTransform(scrollY, [0, 200], [8, 22]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <m.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6"
    >
      <m.nav
        style={{ backdropFilter: useTransform(blur, (b) => `blur(${b}px)`) }}
        className={`mx-auto flex max-w-7xl items-center justify-between rounded-full border border-slate-200/70 bg-white/70 px-4 py-2.5 shadow-[0_10px_40px_-15px_rgba(31,64,175,0.18)] transition-colors sm:px-5 ${
          scrolled ? "bg-white/85" : "bg-white/60"
        }`}
      >
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 via-blue-500 to-violet-500 shadow-[0_8px_22px_-6px_rgba(59,130,246,0.55)]">
            <span className="font-instrument text-lg font-bold text-white">P</span>
            <span className="absolute -inset-px rounded-xl opacity-0 transition-opacity group-hover:opacity-100">
              <span className="absolute inset-0 rounded-xl liquid-iridescent opacity-60" />
            </span>
          </span>
          <span className="font-instrument text-lg tracking-tight text-slate-900">
            PathOptimizer
          </span>
          <span className="hidden rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-sky-700 sm:inline">
            v2 · liquid
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className="group relative inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                {item.name}
                <ArrowUpRight className="h-3 w-3 -translate-y-px opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Open studio
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="rounded-full px-3.5 py-1.5 text-sm text-slate-600 transition hover:text-slate-900"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Start free
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-sky-300 to-transparent opacity-70 transition-transform duration-700 group-hover:translate-x-full" />
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white/60 text-slate-800 md:hidden"
          aria-label="Toggle menu"
        >
          <AnimatePresence mode="wait">
            {open ? (
              <m.span
                key="x"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X className="h-4 w-4" />
              </m.span>
            ) : (
              <m.span
                key="m"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
              >
                <Menu className="h-4 w-4" />
              </m.span>
            )}
          </AnimatePresence>
        </button>
      </m.nav>

      <AnimatePresence>
        {open && (
          <m.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-auto mt-2 max-w-7xl overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-xl backdrop-blur-2xl md:hidden"
          >
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    onClick={() => setOpen(false)}
                    href={item.href}
                    className="flex items-center justify-between rounded-2xl px-4 py-3 text-slate-700 hover:bg-slate-50"
                  >
                    {item.name}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link
                href="/sign-in"
                onClick={() => setOpen(false)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm text-slate-700"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setOpen(false)}
                className="rounded-2xl bg-slate-900 px-4 py-3 text-center text-sm font-medium text-white"
              >
                Start free
              </Link>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </m.header>
  );
}
