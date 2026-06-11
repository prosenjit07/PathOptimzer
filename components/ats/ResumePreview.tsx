"use client";

import { useEffect, useRef, useState } from "react";
import { useAtomValue } from "jotai";
import dynamic from "next/dynamic";
import Script from "next/script";
import { Loader2, FileWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  profileData,
  educationData,
  experienceData,
  projectData,
  achievementData,
  skillData,
  downloadData,
} from "@/lib/ats/store";

// TypstDocument only runs in the browser; load it client-only
const TypstDocument = dynamic(
  () => import("@myriaddreamin/typst.react").then((m) => m.TypstDocument),
  { ssr: false }
);

declare global {
  interface Window {
    $typst?: any;
  }
}

const ResumePreview = ({
  themeColor,
  onRenderTime,
}: {
  themeColor?: string;
  onRenderTime?: (ms: number) => void;
}) => {
  const profile = useAtomValue(profileData);
  const education = useAtomValue(educationData);
  const experience = useAtomValue(experienceData);
  const project = useAtomValue(projectData);
  const achievement = useAtomValue(achievementData);
  const skill = useAtomValue(skillData);
  const download = useAtomValue(downloadData);

  const [ready, setReady] = useState(false);
  const [typstError, setTypstError] = useState<string | null>(null);
  const [artifact, setArtifact] = useState<any>(undefined);
  const [template, setTemplate] = useState<string | null>(null);
  const lastDownloadRef = useRef(download);

  // Build the JSON payload the source marlincv Preview.tsx produces
  const payload = {
    profile,
    education: education.filter((e) => e.selected),
    experience: experience.filter((e) => e.selected),
    project: project.filter((p) => p.selected),
    achievement: achievement.filter((a) => a.selected),
    skill,
    themeColor: themeColor || "#26428b",
  };

  // Load the stephen.typ template once
  useEffect(() => {
    let cancelled = false;
    fetch("/ats/templates/stephen.typ")
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error("template not found"))))
      .then((t) => {
        if (!cancelled) setTemplate(t);
      })
      .catch((e) => {
        if (!cancelled) setTypstError(`Failed to load template: ${e.message}`);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Re-compile when template or payload changes (debounced 300ms)
  useEffect(() => {
    if (!ready || !template) return;
    const t = setTimeout(async () => {
      const start = performance.now();
      try {
        // The @myriaddreamin/typst.react API takes a `source` (the template)
        // and `artifact` (the JSON data injected via #let on the template side).
        // We build the document by concatenating a JSON dump as the artifact
        // that the template can include.
        const json = JSON.stringify(payload, null, 2);
        const source = template.replace(
          "#let data = json(\"\")",
          `#let data = json(\`${json.replace(/`/g, "\\`")}\`)`
        );
        const next = await window.$typst?.compile(source);
        if (next) {
          setArtifact(next);
          onRenderTime?.(performance.now() - start);
        }
      } catch (e: any) {
        setTypstError(e?.message || "Typst compile failed");
      }
    }, 300);
    return () => clearTimeout(t);
  }, [ready, template, payload, onRenderTime]);

  // Trigger a download whenever the "Get PDF" button bumps the atom
  useEffect(() => {
    if (download > lastDownloadRef.current) {
      lastDownloadRef.current = download;
      if (!artifact) return;
      // Fetch the artifact as a blob
      window
        .$typst?.fetchAsBlob?.(artifact)
        ?.then((blob: Blob | undefined) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${profile?.name || "resume"}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
        });
    }
  }, [download, artifact, profile]);

  return (
    <div className="relative h-full w-full">
      <Script
        src="/ats/all-in-one-lite.bundle.js"
        strategy="afterInteractive"
        onReady={() => {
          try {
            // The bundle exposes `$typst` with init helpers. Point both
            // compiler and renderer at our local WASM files.
            window.$typst?.setCompilerInitOptions({
              getModule: () =>
                fetch("/ats/typst_ts_web_compiler_bg.wasm").then((r) => r.arrayBuffer()),
            });
            window.$typst?.setRendererInitOptions({
              getModule: () =>
                fetch("/ats/typst_ts_renderer_bg.wasm").then((r) => r.arrayBuffer()),
            });
            setReady(true);
          } catch (e: any) {
            setTypstError(e?.message || "Typst init failed");
          }
        }}
        onError={() => setTypstError("Failed to load the Typst runtime bundle")}
      />

      {!ready && !typstError && (
        <div className="flex h-full items-center justify-center text-sm text-slate-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading Typst runtime…
        </div>
      )}

      {typstError && (
        <div className="m-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <div className="flex items-center gap-2 font-semibold">
            <FileWarning className="h-4 w-4" />
            Preview unavailable
          </div>
          <p className="mt-1 text-rose-700">{typstError}</p>
          <p className="mt-2 text-xs text-rose-600">
            The editor still works and saves to MongoDB. PDF rendering requires the Typst
            WASM runtime to be reachable; check the network tab for failed fetches.
          </p>
        </div>
      )}

      {ready && !typstError && artifact && (
        <div className="h-full w-full overflow-auto bg-white p-4">
          <TypstDocument artifact={artifact} />
        </div>
      )}

      {ready && !typstError && !artifact && (
        <div className="flex h-full items-center justify-center text-sm text-slate-400">
          Waiting for content…
        </div>
      )}
    </div>
  );
};

export default ResumePreview;
