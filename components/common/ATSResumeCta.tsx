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
};

export default ATSResumeCta;