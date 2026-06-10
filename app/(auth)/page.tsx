"use client";

import dynamic from "next/dynamic";
import { LazyMotion, domAnimation } from "framer-motion";
import { HomeNav } from "@/components/home/HomeNav";
import { HomeHero } from "@/components/home/HomeHero";

// Below-the-fold sections are code-split so they don't bloat the initial bundle
// or the main-thread work of the landing page.
const HomeFeatures = dynamic(
  () => import("@/components/home/HomeFeatures").then((m) => m.HomeFeatures),
  { ssr: false }
);
const HomeWorkflow = dynamic(
  () => import("@/components/home/HomeWorkflow").then((m) => m.HomeWorkflow),
  { ssr: false }
);
const HomeShowcaseSection = dynamic(
  () =>
    import("@/components/home/HomeShowcaseSection").then(
      (m) => m.HomeShowcaseSection
    ),
  { ssr: false }
);
const HomeTestimonials = dynamic(
  () => import("@/components/home/HomeTestimonials").then((m) => m.HomeTestimonials),
  { ssr: false }
);
const HomeShowcase = dynamic(
  () => import("@/components/home/HomeShowcase").then((m) => m.HomeShowcase),
  { ssr: false }
);
const HomeCTA = dynamic(
  () => import("@/components/home/HomeCTA").then((m) => m.HomeCTA),
  { ssr: false }
);
const HomeFooter = dynamic(
  () => import("@/components/home/HomeFooter").then((m) => m.HomeFooter),
  { ssr: false }
);

export default function LandingPage() {
  return (
    // LazyMotion + domAnimation: tree-shakes framer-motion features,
    // ships only the DOM animation subset we actually use.
    <LazyMotion features={domAnimation} strict>
      <div className="relative min-h-screen overflow-x-clip bg-gradient-to-b from-[#eaf2ff] via-[#f4f7ff] to-[#fef6ff] text-slate-900">
        {/* ambient background — sky gradient mesh applied page-wide */}
        <div className="pointer-events-none fixed inset-0 -z-50">
          <div className="absolute inset-0 bg-sky-bleed" />
          <div className="absolute inset-0 bg-grid-faint [background-size:80px_80px] [mask-image:radial-gradient(60%_60%_at_50%_30%,black,transparent_80%)] opacity-60" />
          <div className="grain absolute inset-0" />
        </div>

        <HomeNav />
        <main>
          <HomeHero />
          <HomeFeatures />
          <HomeWorkflow />
          <HomeShowcaseSection />
          <HomeTestimonials />
          <HomeShowcase />
          <section id="cta">
            <HomeCTA />
          </section>
        </main>
        <HomeFooter />
      </div>
    </LazyMotion>
  );
}
