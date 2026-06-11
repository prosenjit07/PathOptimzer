"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createATSResume } from "@/lib/actions/ats-resume.actions";

const features = [
  "Drag-and-drop section reordering",
  "Tailor per job, download ATS-friendly PDF",
  "Auto-saves to your account",
];

const ATSResumeCta = ({ userId }: { userId?: string }) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleCreate = () => {
    if (!userId) return;
    startTransition(async () => {
      const res = await createATSResume({ userId });
      if (res.success && res.atsResumeId) {
        router.push(`/dashboard/ats-resume/${res.atsResumeId}/edit`);
      }
    });
  };

  return (
    <div className="relative aspect-[1/1.2] border border-slate-200 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex flex-col justify-between hover:shadow-md transition-all overflow-hidden">
      <div className="flex items-center gap-2 text-slate-700">
        <Sparkles className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">
          New
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 leading-tight">
            Build an ATS-Friendly Resume
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Reorder sections, tailor to any job, and download a clean PDF.
          </p>
        </div>

        <ul className="space-y-2">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2 text-xs text-slate-700"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-emerald-600 shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          onClick={handleCreate}
          disabled={pending || !userId}
          className="w-full"
          size="sm"
        >
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ATSResumeCta;
