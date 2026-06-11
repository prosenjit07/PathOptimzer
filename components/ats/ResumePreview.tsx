"use client";

import { useEffect, useRef, useState } from "react";
import { useAtomValue } from "jotai";
import dynamic from "next/dynamic";
import Script from "next/script";
import { Loader2, FileWarning } from "lucide-react";
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

// Helper functions to format data for Typst
function formatProfileForTypst(profile: any): string {
  if (!profile) return "(:)";
  const parts: string[] = [];
  if (profile.name) parts.push(`name: "${escapeTypstString(profile.name)}"`);
  if (profile.email) parts.push(`email: "${escapeTypstString(profile.email)}"`);
  if (profile.phone) parts.push(`phone: "${escapeTypstString(profile.phone)}"`);
  if (profile.location) parts.push(`location: "${escapeTypstString(profile.location)}"`);
  if (profile.github) parts.push(`github: "${escapeTypstString(profile.github)}"`);
  if (profile.linkedin) parts.push(`linkedin: "${escapeTypstString(profile.linkedin)}"`);
  if (profile.website) parts.push(`personal-site: "${escapeTypstString(profile.website)}"`);
  return "(" + parts.join(", ") + ")";
}

function formatArrayForTypst(items: any[]): string {
  if (!items || items.length === 0) return "()";
  const formatted = items.map(item => {
    const pairs: string[] = [];
    for (const [key, value] of Object.entries(item)) {
      if (value !== undefined && value !== null) {
        if (typeof value === 'string') {
          pairs.push(`${key}: "${escapeTypstString(value)}"`);
        } else if (Array.isArray(value)) {
          pairs.push(`${key}: (${value.map(v => `"${escapeTypstString(String(v))}"`).join(", ")})`);
        } else {
          pairs.push(`${key}: ${value}`);
        }
      }
    }
    return "(" + pairs.join(", ") + ")";
  });
  return "(" + formatted.join(", ") + ")";
}

function escapeTypstString(str: string): string {
  if (!str) return "";
  return str
    .replace(/\\/g, "\\\\")
    .replace(/"/g, "\\\"")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
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

  // Build the JSON payload
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
    console.log("[ResumePreview] Loading template...");
    fetch("/ats/templates/stephen.typ")
      .then((r) => {
        console.log("[ResumePreview] Template fetch response:", r.status, r.ok);
        return r.ok ? r.text() : Promise.reject(new Error(`template not found: ${r.status}`));
      })
      .then((t) => {
        console.log("[ResumePreview] Template loaded, length:", t.length);
        if (!cancelled) setTemplate(t);
      })
      .catch((e) => {
        console.error("[ResumePreview] Failed to load template:", e);
        if (!cancelled) setTypstError(`Failed to load template: ${e.message}`);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Re-compile when template or payload changes (debounced 300ms)
  useEffect(() => {
    if (!ready || !template) {
      console.log("[ResumePreview] Skipping compile - ready:", ready, "template:", !!template);
      return;
    }
    const t = setTimeout(async () => {
      const start = performance.now();
      try {
        console.log("[ResumePreview] Starting compile...");
        
        // Check if $typst is available
        if (!window.$typst) {
          console.error("[ResumePreview] window.$typst is not available");
          setTypstError("Typst runtime not available");
          return;
        }
        
        // Check if compile method exists
        if (typeof window.$typst.compile !== 'function') {
          console.error("[ResumePreview] window.$typst.compile is not a function");
          setTypstError("Typst compiler not available");
          return;
        }
        
        // The template uses {{placeholder}} syntax for replacements
        // Replace each placeholder with the corresponding JSON data
        let source = template;
        
        // Replace {{profile}} with profile data as Typst dict
        const profileStr = profile ? formatProfileForTypst(profile) : "(:)";
        source = source.replace(/\{\{profile\}\}/g, profileStr);
        
        // Replace other placeholders with JSON arrays
        source = source.replace(/\{\{education\}\}/g, formatArrayForTypst(payload.education));
        source = source.replace(/\{\{experience\}\}/g, formatArrayForTypst(payload.experience));
        source = source.replace(/\{\{project\}\}/g, formatArrayForTypst(payload.project));
        source = source.replace(/\{\{achievement\}\}/g, formatArrayForTypst(payload.achievement));
        source = source.replace(/\{\{skill\}\}/g, formatArrayForTypst(payload.skill));
        
        // Replace theme color
        source = source.replace(/accent-color:\s*"[^"]*"/, `accent-color: "${themeColor || "#26428b"}"`);
        
        console.log("[ResumePreview] Compiling with source length:", source.length);
        console.log("[ResumePreview] Source preview:", source.substring(0, 500));
        
        // The $typst.compile() expects an options object with mainContent or mainFilePath
        // See: https://github.com/Myriad-Dreamin/typst.ts/blob/main/packages/typst.ts/src/contrib/snippet.mts
        const compileOptions = {
          mainContent: source,
          // mainFilePath: "/main.typ", // Optional: use default
        };
        
        const result = await window.$typst.compile(compileOptions);
        
        console.log("[ResumePreview] Compile result:", result ? "success" : "undefined");
        
        // The result may be wrapped in a result object
        const next = result?.result || result;
        
        if (next) {
          setArtifact(next);
          onRenderTime?.(performance.now() - start);
        } else {
          console.error("[ResumePreview] Compile returned undefined");
          setTypstError("Compilation failed - returned undefined");
        }
      } catch (e: any) {
        console.error("[ResumePreview] Compile error:", e);
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
