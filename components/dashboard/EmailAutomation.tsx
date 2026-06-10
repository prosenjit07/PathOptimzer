"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Send,
  FileText,
  Settings2,
  Users,
  AlertCircle,
} from "lucide-react";

interface ContactData {
  Name: string;
  Email: string;
  Company: string;
  Role: string;
  Link?: string;
  [key: string]: string | undefined;
}

interface SenderConfig {
  name: string;
  title: string;
  email: string;
  phone: string;
  cvLink: string;
  linkedinLink: string;
  experience: {
    years: string;
    currentCompany: string;
    currentRole: string;
    duration: string;
  };
  education: string;
  skills: string[];
  achievements: string[];
}

interface EmailResult {
  index: number;
  name: string;
  email: string;
  company: string;
  role: string;
  success: boolean;
  messageId?: string;
  error?: string;
}

type Phase = "idle" | "loading" | "ready" | "sending" | "done" | "error";

const DEFAULT_SENDER: SenderConfig = {
  name: "Your Name",
  title: "Software Developer",
  email: "your.email@example.com",
  phone: "+1 (123) 456-7890",
  cvLink: "https://drive.google.com/your-cv-link",
  linkedinLink: "https://linkedin.com/in/yourprofile",
  experience: {
    years: "3+ years",
    currentCompany: "Current Company",
    currentRole: "Software Developer",
    duration: "2+ years",
  },
  education: "Bachelor's in Computer Science",
  skills: [
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "REST APIs",
    "GraphQL",
  ],
  achievements: [
    "Worked with teams serving 25M+ monthly active users",
    "Led frontend development for multiple projects",
  ],
};

export default function EmailAutomation() {
  // Config
  const [range, setRange] = useState("Sheet1!A:Z");
  const [fromAddress, setFromAddress] = useState(
    process.env.NEXT_PUBLIC_DEFAULT_FROM || "onboarding@resend.dev"
  );
  const [useAttachments, setUseAttachments] = useState(false);
  const [sender, setSender] = useState<SenderConfig>(DEFAULT_SENDER);

  // Data
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewMeta, setPreviewMeta] = useState<{ range: string; count: number } | null>(
    null
  );

  // Runtime
  const [phase, setPhase] = useState<Phase>("idle");
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [results, setResults] = useState<EmailResult[]>([]);
  const [summary, setSummary] = useState<{
    total: number;
    successful: number;
    failed: number;
  } | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const canSend = useMemo(
    () =>
      contacts.length > 0 &&
      fromAddress.trim().length > 0 &&
      sender.name.trim().length > 0 &&
      sender.email.trim().length > 0 &&
      !sending,
    [contacts.length, fromAddress, sender.email, sender.name, sending]
  );

  async function handlePreview() {
    setPhase("loading");
    setPreviewError(null);
    setResults([]);
    setSummary(null);
    setSendError(null);
    try {
      const res = await fetch("/api/email-automation/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ range }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Request failed: ${res.status}`);
      }
      setContacts(data.contacts as ContactData[]);
      setPreviewMeta({ range: data.range, count: data.count });
      setPhase("ready");
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : String(err));
      setPhase("error");
    }
  }

  async function handleSend() {
    if (!canSend) return;
    setSending(true);
    setPhase("sending");
    setSendError(null);
    setResults([]);
    setSummary(null);
    setProgress({ completed: 0, total: contacts.length });

    try {
      const res = await fetch("/api/email-automation/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          range,
          from: fromAddress,
          senderConfig: sender,
          useAttachments,
          delayMs: 600,
          maxRetries: 3,
        }),
      });

      if (!res.ok || !res.body) {
        const text = await res.text();
        throw new Error(text || `Request failed: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // Simple SSE parser
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        // eslint-disable-next-line no-cond-assign
        while ((idx = buffer.indexOf("\n\n")) !== -1) {
          const chunk = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);

          const eventLine = chunk.split("\n").find((l) => l.startsWith("event:"));
          const dataLine = chunk.split("\n").find((l) => l.startsWith("data:"));
          if (!eventLine || !dataLine) continue;
          const event = eventLine.slice(6).trim();
          const data = JSON.parse(dataLine.slice(5).trim());

          if (event === "start") {
            setProgress({ completed: 0, total: data.total });
          } else if (event === "progress") {
            setProgress({ completed: data.completed, total: data.total });
          } else if (event === "email") {
            setResults((prev) => [
              ...prev,
              {
                index: data.index,
                name: data.name,
                email: data.email,
                company: data.company,
                role: data.role,
                success: data.success,
                messageId: data.messageId,
                error: data.error,
              },
            ]);
          } else if (event === "done") {
            setSummary({
              total: data.total,
              successful: data.successful,
              failed: data.failed,
            });
            setPhase("done");
          }
        }
      }
    } catch (err) {
      setSendError(err instanceof Error ? err.message : String(err));
      setPhase("error");
    } finally {
      setSending(false);
    }
  }

  function updateSender<K extends keyof SenderConfig>(
    key: K,
    value: SenderConfig[K]
  ) {
    setSender((s) => ({ ...s, [key]: value }));
  }

  function updateExperience<K extends keyof SenderConfig["experience"]>(
    key: K,
    value: SenderConfig["experience"][K]
  ) {
    setSender((s) => ({
      ...s,
      experience: { ...s.experience, [key]: value },
    }));
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* LEFT: Sheet range + sender config */}
      <div className="space-y-6 lg:col-span-1">
        <section className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-sky-600" />
            <h3 className="font-semibold text-slate-900">Google Sheet</h3>
          </div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-slate-500">
            Cell range
          </label>
          <Input
            value={range}
            onChange={(e) => setRange(e.target.value)}
            placeholder="Sheet1!A:Z"
            className="mb-3"
          />
          <Button
            onClick={handlePreview}
            disabled={phase === "loading"}
            className="w-full"
            variant="outline"
          >
            {phase === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading…
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Preview contacts
              </>
            )}
          </Button>

          {previewError && (
            <p className="mt-3 flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {previewError}
            </p>
          )}
          {previewMeta && (
            <p className="mt-3 flex items-center gap-1 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              {previewMeta.count} contact{previewMeta.count === 1 ? "" : "s"}{" "}
              loaded from <code className="rounded bg-slate-100 px-1">
                {previewMeta.range}
              </code>
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
          <div className="mb-4 flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-violet-600" />
            <h3 className="font-semibold text-slate-900">Sender config</h3>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field
              label="Your name"
              value={sender.name}
              onChange={(v) => updateSender("name", v)}
            />
            <Field
              label="Title"
              value={sender.title}
              onChange={(v) => updateSender("title", v)}
            />
            <Field
              label="Email"
              value={sender.email}
              onChange={(v) => updateSender("email", v)}
            />
            <Field
              label="Phone"
              value={sender.phone}
              onChange={(v) => updateSender("phone", v)}
            />
            <Field
              label="CV link"
              value={sender.cvLink}
              onChange={(v) => updateSender("cvLink", v)}
              className="sm:col-span-2"
            />
            <Field
              label="LinkedIn"
              value={sender.linkedinLink}
              onChange={(v) => updateSender("linkedinLink", v)}
              className="sm:col-span-2"
            />
            <Field
              label="Education"
              value={sender.education}
              onChange={(v) => updateSender("education", v)}
              className="sm:col-span-2"
            />
            <Field
              label="Experience years"
              value={sender.experience.years}
              onChange={(v) => updateExperience("years", v)}
            />
            <Field
              label="Current company"
              value={sender.experience.currentCompany}
              onChange={(v) => updateExperience("currentCompany", v)}
            />
          </div>

          <label className="mt-4 block text-xs font-medium uppercase tracking-widest text-slate-500">
            Skills (comma separated)
          </label>
          <Textarea
            rows={3}
            value={sender.skills.join(", ")}
            onChange={(e) =>
              updateSender(
                "skills",
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
          />

          <label className="mt-3 block text-xs font-medium uppercase tracking-widest text-slate-500">
            Achievements (one per line)
          </label>
          <Textarea
            rows={3}
            value={sender.achievements.join("\n")}
            onChange={(e) =>
              updateSender(
                "achievements",
                e.target.value
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
          />
        </section>
      </div>

      {/* RIGHT: Send panel */}
      <div className="space-y-6 lg:col-span-2">
        <section className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5 text-emerald-600" />
              <h3 className="font-semibold text-slate-900">Send campaign</h3>
            </div>
            {previewMeta && (
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                {contacts.length} recipient
                {contacts.length === 1 ? "" : "s"} ready
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-slate-500">
                From address (must be verified in Resend)
              </label>
              <Input
                value={fromAddress}
                onChange={(e) => setFromAddress(e.target.value)}
                placeholder="you@yourdomain.com"
              />
            </div>
            <label className="mt-6 flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300"
                checked={useAttachments}
                onChange={(e) => setUseAttachments(e.target.checked)}
              />
              Attach CV.pdf + Transcript.pdf from /files
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              onClick={handleSend}
              disabled={!canSend}
              className="min-w-[180px]"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending… {progress.completed}/{progress.total}
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send to {contacts.length} contact
                  {contacts.length === 1 ? "" : "s"}
                </>
              )}
            </Button>

            {sending && progress.total > 0 && (
              <div className="h-2 w-full flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 via-blue-500 to-violet-500 transition-all"
                  style={{
                    width: `${
                      (progress.completed / Math.max(progress.total, 1)) * 100
                    }%`,
                  }}
                />
              </div>
            )}
          </div>

          {sendError && (
            <p className="mt-3 flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {sendError}
            </p>
          )}
          {summary && (
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                ✓ {summary.successful} sent
              </span>
              <span className="rounded-full bg-rose-50 px-3 py-1 text-rose-700">
                ✗ {summary.failed} failed
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                {summary.total} total
              </span>
            </div>
          )}
        </section>

        {/* Contact preview + live results */}
        <section className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900">
              {phase === "sending" || phase === "done"
                ? "Live send results"
                : "Contact preview"}
            </h3>
          </div>

          {contacts.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
              No contacts loaded yet. Click <b>Preview contacts</b> to fetch
              them from your Google Sheet.
            </p>
          ) : (
            <div className="max-h-[28rem] overflow-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-50 text-left text-xs uppercase tracking-widest text-slate-500">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Company</th>
                    <th className="px-3 py-2">Role</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contacts.map((c, i) => {
                    const live = results.find((r) => r.email === c.Email);
                    return (
                      <tr key={`${c.Email}-${i}`} className="text-slate-700">
                        <td className="px-3 py-2 text-slate-400">
                          {live?.index ?? i + 1}
                        </td>
                        <td className="px-3 py-2 font-medium text-slate-900">
                          {c.Name}
                        </td>
                        <td className="px-3 py-2">{c.Email}</td>
                        <td className="px-3 py-2">{c.Company}</td>
                        <td className="px-3 py-2">{c.Role}</td>
                        <td className="px-3 py-2">
                          {!live ? (
                            <span className="text-slate-400">—</span>
                          ) : live.success ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                              <CheckCircle2 className="h-3.5 w-3.5" /> sent
                            </span>
                          ) : (
                            <span
                              className="inline-flex max-w-[16rem] items-center gap-1 truncate rounded-full bg-rose-50 px-2 py-0.5 text-xs text-rose-700"
                              title={live.error}
                            >
                              <XCircle className="h-3.5 w-3.5" /> failed
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-slate-500">
        {label}
      </label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
