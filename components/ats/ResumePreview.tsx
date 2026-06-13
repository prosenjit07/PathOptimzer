"use client";

import { useEffect, useRef, useState } from "react";
import { useAtomValue } from "jotai";
import { Loader2, FileWarning } from "lucide-react";
// TypstDocument only runs in the browser; the parent component is
// `"use client"` and this file is only ever imported on the client, so a
// direct import is safe.
import { TypstDocument } from "@myriaddreamin/typst.react";
import {
  profileData,
  educationData,
  experienceData,
  projectData,
  achievementData,
  skillData,
  downloadData,
} from "@/lib/ats/store";

declare global {
  interface Window {
    $typst?: any;
  }
}

const COMPILER_WASM_URL = "/ats/typst_ts_web_compiler_bg.wasm";
const RENDERER_WASM_URL = "/ats/typst_ts_renderer_bg.wasm";
const BUNDLE_URL = "/ats/all-in-one-lite.bundle.js";
const TEMPLATE_URL = "/ats/templates/Einstein.typ";
const BUNDLE_LOAD_TIMEOUT_MS = 20000;

// --- helpers -----------------------------------------------------------------

function escapeTypstString(str: string): string {
  if (!str) return "";
  return str
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

// Build a Typst dictionary literal, e.g. `(name: "Jane", email: "j@x.com")`.
// Empty/missing values are omitted so the template's defaults apply.
// Socials are scanned to populate github/linkedin/personal-site (matched by
// the social label text) since the profile form does not expose those
// fields directly.
function formatProfileForTypst(profile: any): string {
  if (!profile) return "(:)";
  const parts: string[] = [];
  if (profile.name) parts.push(`name: "${escapeTypstString(profile.name)}"`);
  if (profile.email) parts.push(`email: "${escapeTypstString(profile.email)}"`);
  if (profile.phone) parts.push(`phone: "${escapeTypstString(profile.phone)}"`);
  if (profile.location) parts.push(`location: "${escapeTypstString(profile.location)}"`);

  let github = "";
  let linkedin = "";
  let personalSite = "";
  if (Array.isArray(profile.socials)) {
    for (const s of profile.socials) {
      if (!s || !s.selected) continue;
      const label = String(s.text || "").toLowerCase();
      const link = String(s.link || "");
      if (!link) continue;
      if (label.includes("github")) {
        github = link.replace(/^https?:\/\//, "");
      } else if (label.includes("linkedin")) {
        linkedin = link.replace(/^https?:\/\//, "");
      } else if (label.includes("site") || label.includes("portfolio") || label.includes("web")) {
        personalSite = link.replace(/^https?:\/\//, "");
      }
    }
  }
  if (github) parts.push(`github: "${escapeTypstString(github)}"`);
  if (linkedin) parts.push(`linkedin: "${escapeTypstString(linkedin)}"`);
  if (personalSite) parts.push(`personal-site: "${escapeTypstString(personalSite)}"`);
  if (parts.length === 0) return "(:)";
  return "(" + parts.join(", ") + ")";
}

// Build a Typst array of named-content dicts, e.g.:
//   ((id: "1", institution: "X", responsibilities: ((text: "..."))), (...))
function formatArrayForTypst(items: any[]): string {
  if (!items || items.length === 0) return "()";
  const formatted = items.map((item) => {
    const pairs: string[] = [];
    for (const [key, value] of Object.entries(item)) {
      if (value === undefined || value === null) continue;
      if (typeof value === "string") {
        pairs.push(`${key}: "${escapeTypstString(value)}"`);
      } else if (Array.isArray(value)) {
        const subItems = value.map((v) => {
          if (v && typeof v === "object") {
            const subPairs: string[] = [];
            for (const [k, vv] of Object.entries(v)) {
              if (vv === undefined || vv === null) continue;
              subPairs.push(
                `${k}: ${typeof vv === "string"
                  ? `"${escapeTypstString(vv)}"`
                  : typeof vv === "boolean"
                    ? `${vv}`
                    : `${vv}`
                }`
              );
            }
            if (subPairs.length === 0) return "(:)";
            return "(" + subPairs.join(", ") + ")";
          }
          return `"${escapeTypstString(String(v))}"`;
        });
        pairs.push(`${key}: (${subItems.join(", ")}${subItems.length === 1 ? "," : ""})`);
      } else if (typeof value === "boolean") {
        pairs.push(`${key}: ${value}`);
      } else {
        pairs.push(`${key}: ${value}`);
      }
    }
    if (pairs.length === 0) return "(:)";
    return "(" + pairs.join(", ") + ")";
  });
  return "(" + formatted.join(", ") + (formatted.length === 1 ? "," : "") + ")";
}

// Configure the global Typst snippet with our local WASM URLs.
function configureTypstRuntime() {
  if (typeof window === "undefined" || !window.$typst) {
    throw new Error("Typst runtime not available on window");
  }
  console.log("[configureTypstRuntime] window.$typst available", window.$typst);
  console.log("[configureTypstRuntime] Compiler WASM URL:", COMPILER_WASM_URL);
  console.log("[configureTypstRuntime] Renderer WASM URL:", RENDERER_WASM_URL);

  if (typeof window.$typst.cc === "function") {
    window.$typst.setCompilerInitOptions({
      getModule: () => {
        console.log("[configureTypstRuntime] Fetching compiler WASM");
        return fetch(COMPILER_WASM_URL)
          .then((r) => {
            console.log("[configureTypstRuntime] Compiler WASM fetch status:", r.status);
            if (!r.ok) throw new Error(`Failed to fetch compiler WASM: ${r.status}`);
            return r.arrayBuffer();
          })
          .then((buf) => {
            console.log("[configureTypstRuntime] Compiler WASM loaded, size:", buf.byteLength);
            return buf;
          });
      },
    });
  } else {
    console.log("[configureTypstRuntime] Compiler already initialized, skipping setCompilerInitOptions");
  }

  if (typeof window.$typst.ex === "function") {
    window.$typst.setRendererInitOptions({
      getModule: () => {
        console.log("[configureTypstRuntime] Fetching renderer WASM");
        return fetch(RENDERER_WASM_URL)
          .then((r) => {
            console.log("[configureTypstRuntime] Renderer WASM fetch status:", r.status);
            if (!r.ok) throw new Error(`Failed to fetch renderer WASM: ${r.status}`);
            return r.arrayBuffer();
          })
          .then((buf) => {
            console.log("[configureTypstRuntime] Renderer WASM loaded, size:", buf.byteLength);
            return buf;
          });
      },
    });
  } else {
    console.log("[configureTypstRuntime] Renderer already initialized, skipping setRendererInitOptions");
  }

  // The React renderer is a separate module instance bundled by webpack,
  // so it has its own static init options that must be set explicitly.
  TypstDocument.setWasmModuleInitOptions({
    getModule: () => {
      console.log("[configureTypstRuntime] TypstDocument fetching renderer WASM");
      return fetch(RENDERER_WASM_URL)
        .then((r) => {
          console.log("[configureTypstRuntime] TypstDocument renderer WASM fetch status:", r.status);
          if (!r.ok) throw new Error(`Failed to fetch TypstDocument renderer WASM: ${r.status}`);
          return r.arrayBuffer();
        })
        .then((buf) => {
          console.log("[configureTypstRuntime] TypstDocument renderer WASM loaded, size:", buf.byteLength);
          return buf;
        });
    },
    beforeBuild: [],
  });
}

// Inject the bundle script exactly once per page. Returns a promise that
// resolves when `window.$typst` is observed, or rejects after the timeout.
function ensureTypstBundle(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Window is undefined"));
      return;
    }
    if (window.$typst) {
      resolve();
      return;
    }

    // Inject script tag
    let scriptEl = document.querySelector<HTMLScriptElement>(
      "script[data-ats-typst-bundle]"
    );
    if (!scriptEl) {
      scriptEl = document.createElement("script");
      scriptEl.src = BUNDLE_URL;
      scriptEl.type = "module";
      scriptEl.dataset.atsTypstBundle = "true";
      document.head.appendChild(scriptEl);
    }

    let resolved = false;
    const settle = () => {
      if (resolved) return;
      if (window.$typst) {
        resolved = true;
        resolve();
      }
    };

    scriptEl.onload = settle;
    scriptEl.onerror = (e) => {
      if (!resolved) {
        resolved = true;
        reject(new Error(`Failed to load ${BUNDLE_URL}`));
      }
    };

    // Poll as a fallback
    const pollHandle = setInterval(() => {
      if (window.$typst) {
        clearInterval(pollHandle);
        settle();
      }
    }, 100);

    setTimeout(() => {
      clearInterval(pollHandle);
      if (!resolved) {
        resolved = true;
        reject(
          new Error(
            `Timed out waiting for ${BUNDLE_URL} to set window.$typst after ${BUNDLE_LOAD_TIMEOUT_MS}ms.`
          )
        );
      }
    }, BUNDLE_LOAD_TIMEOUT_MS);
  });
}

// --- component ---------------------------------------------------------------

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
  const [artifact, setArtifact] = useState<Uint8Array | undefined>(undefined);
  const [template, setTemplate] = useState<string | null>(null);
  const [currentThemeColor, setCurrentThemeColor] = useState(themeColor || "#26428b");
  const lastDownloadRef = useRef(download);

  useEffect(() => {
    let cancelled = false;
    console.log("[ResumePreview] Loading template from", TEMPLATE_URL);
    fetch(`${TEMPLATE_URL}?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => {
        console.log("[ResumePreview] Template fetch status", r.status);
        return r.ok ? r.text() : Promise.reject(new Error(`template not found: ${r.status}`));
      })
      .then((t) => {
        console.log("[ResumePreview] Template loaded successfully");
        if (!cancelled) setTemplate(t);
      })
      .catch((e) => {
        console.error("[ResumePreview] Failed to load template", e);
        if (!cancelled) setTypstError(`Failed to load template: ${e.message}`);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Bootstrap the Typst runtime.
  useEffect(() => {
    let cancelled = false;
    let pollHandle: ReturnType<typeof setInterval> | null = null;

    console.log("[ResumePreview] Starting Typst bootstrap");
    ensureTypstBundle()
      .then(() => {
        if (cancelled) return;
        console.log("[ResumePreview] Typst bundle loaded");
        configureTypstRuntime();
        console.log("[ResumePreview] Typst runtime configured");
        if (!cancelled) setReady(true);
      })
      .catch((e) => {
        console.error("[ResumePreview] Typst init failed", e);
        if (cancelled) return;
        setTypstError(e?.message || "Typst init failed");
      });

    return () => {
      cancelled = true;
      if (pollHandle) clearInterval(pollHandle);
    };
  }, []);

  // Re-compile when template or state changes (debounced 300ms)
  useEffect(() => {
    if (!ready) {
      return;
    }
    const t = setTimeout(async () => {
      const start = performance.now();
      try {
        console.log("[ResumePreview] Starting Typst compilation");
        if (typeof window === "undefined" || !window.$typst) {
          setTypstError("Typst runtime not available");
          return;
        }
        if (typeof window.$typst.vector !== "function") {
          setTypstError("Typst compiler API missing (vector)");
          return;
        }

        if (!template) return;

        // Build the Typst source by substituting placeholders.
        let source = template;
        const filteredEducation = education.filter((e) => e.selected);
        const filteredExperience = experience.filter((e) => e.selected);
        const filteredProject = project.filter((p) => p.selected);
        const filteredAchievement = achievement.filter((a) => a.selected);

        const formattedProfile = formatProfileForTypst(profile);
        const formattedEducation = formatArrayForTypst(filteredEducation);
        const formattedExperience = formatArrayForTypst(filteredExperience);
        const formattedProject = formatArrayForTypst(filteredProject);
        const formattedAchievement = formatArrayForTypst(filteredAchievement);
        const formattedSkill = formatArrayForTypst(skill);

        console.log("[ResumePreview] Formatted profile:", formattedProfile);
        console.log("[ResumePreview] Formatted education:", formattedEducation);
        console.log("[ResumePreview] Formatted experience:", formattedExperience);
        console.log("[ResumePreview] Formatted project:", formattedProject);
        console.log("[ResumePreview] Formatted achievement:", formattedAchievement);
        console.log("[ResumePreview] Formatted skill:", formattedSkill);

        source = source.replace(/\{\{profile\}\}/g, formattedProfile);
        source = source.replace(/\{\{education\}\}/g, formattedEducation);
        source = source.replace(/\{\{experience\}\}/g, formattedExperience);
        source = source.replace(/\{\{project\}\}/g, formattedProject);
        source = source.replace(/\{\{achievement\}\}/g, formattedAchievement);
        source = source.replace(/\{\{skill\}\}/g, formattedSkill);
        // Apply theme color (replaces any prior `accent-color: "..."` literal).
        const tc = currentThemeColor;
        source = source.replace(
          /accent-color:\s*"[^"]*"/,
          `accent-color: "${tc}"`
        );

        console.log("[ResumePreview] Typst source:", source);

        // The current TypstSnippet API exposes `vector({mainContent})` which
        // compiles to the intermediate vector (IR) format that TypstDocument
        // consumes via the renderer.
        const result = await window.$typst.vector({ mainContent: source });
        if (!result) {
          setTypstError("Compilation returned no result");
          return;
        }
        console.log("[ResumePreview] Typst compilation succeeded");
        setArtifact(result);
        onRenderTime?.(performance.now() - start);
      } catch (e: any) {
        console.error("[ResumePreview] compile error", e);
        setTypstError(e?.message || "Typst compile failed");
      }
    }, 300);
    return () => clearTimeout(t);
  }, [
    ready,
    template,
    profile,
    education,
    experience,
    project,
    achievement,
    skill,
    currentThemeColor,
    onRenderTime,
  ]);

  // Trigger a download whenever the "Get PDF" button bumps the atom.
  useEffect(() => {
    if (download <= lastDownloadRef.current) return;
    lastDownloadRef.current = download;
    if (typeof window === "undefined" || !window.$typst) return;
    if (!template) return;

    let source = template;
    source = source.replace(/\{\{profile\}\}/g, formatProfileForTypst(profile));
    source = source.replace(/\{\{education\}\}/g, formatArrayForTypst(education));
    source = source.replace(/\{\{experience\}\}/g, formatArrayForTypst(experience));
    source = source.replace(/\{\{project\}\}/g, formatArrayForTypst(project));
    source = source.replace(/\{\{achievement\}\}/g, formatArrayForTypst(achievement));
    source = source.replace(/\{\{skill\}\}/g, formatArrayForTypst(skill));
    source = source.replace(
      /accent-color:\s*"[^"]*"/,
      `accent-color: "${currentThemeColor}"`
    );

    (async () => {
      try {
        const pdf = await window.$typst.pdf({ mainContent: source });
        if (!pdf) return;
        const blob = new Blob([pdf], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${profile?.name || "resume"}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } catch (e: any) {
        console.error("[ResumePreview] pdf download failed", e);
        setTypstError(e?.message || "PDF download failed");
      }
    })();
  }, [download, template, profile, education, experience, project, achievement, skill, currentThemeColor]);

  // Keep current theme color in sync.
  useEffect(() => {
    setCurrentThemeColor(themeColor || "#26428b");
  }, [themeColor]);

  return (
    <div className="relative h-full w-full overflow-auto">
      {!ready && !typstError && (
        <div className="flex h-full min-h-[200px] items-center justify-center text-sm text-slate-500">
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
          <p className="mt-1 break-words text-rose-700">{typstError}</p>
          <p className="mt-2 text-xs text-rose-600">
            The editor still works and saves to MongoDB. PDF rendering requires the
            Typst WASM runtime to be reachable; check the network tab for failed
            fetches (e.g. <code>{COMPILER_WASM_URL}</code>,{" "}
            <code>{RENDERER_WASM_URL}</code>).
          </p>
        </div>
      )}

      {ready && !typstError && artifact && (
        <div className="min-h-full w-full bg-white p-4">
          <TypstDocument artifact={artifact} format="json" />
        </div>
      )}

      {ready && !typstError && !artifact && (
        <div className="flex h-full min-h-[200px] items-center justify-center text-sm text-slate-400">
          Waiting for content…
        </div>
      )}
    </div>
  );
};

export default ResumePreview;
