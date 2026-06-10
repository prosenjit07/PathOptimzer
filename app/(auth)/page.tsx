"use client";

import { HomeNav } from "@/components/home/HomeNav";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeFeatures } from "@/components/home/HomeFeatures";
import { HomeWorkflow } from "@/components/home/HomeWorkflow";
import { HomeShowcaseSection } from "@/components/home/HomeShowcaseSection";
import { HomeTestimonials } from "@/components/home/HomeTestimonials";
import { HomeShowcase } from "@/components/home/HomeShowcase";
import { HomeCTA } from "@/components/home/HomeCTA";
import { HomeFooter } from "@/components/home/HomeFooter";

export default function LandingPage() {
  return (
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
  );
}
