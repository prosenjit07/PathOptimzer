"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { createATSResume, deleteATSResume } from "@/lib/actions/ats-resume.actions";

const ATSResumeList = ({
  initialResumes,
  userId,
}: {
  initialResumes: any[];
  userId: string;
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState(initialResumes);
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleCreate = () => {
    startTransition(async () => {
      const res = await createATSResume({ userId });
      if (res.success && res.atsResumeId) {
        router.push(`/dashboard/ats-resume/${res.atsResumeId}/edit`);
      } else {
        toast({
          title: "Failed to create",
          description: res.error,
          variant: "destructive",
          className: "bg-white",
        });
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this ATS resume? This cannot be undone.")) return;
    setBusyId(id);
    startTransition(async () => {
      const res = await deleteATSResume({ atsResumeId: id, userId });
      if (res.success) {
        setItems((arr) => arr.filter((r) => r.atsResumeId !== id));
        toast({ title: "Deleted", className: "bg-white" });
      } else {
        toast({
          title: "Delete failed",
          description: res.error,
          variant: "destructive",
          className: "bg-white",
        });
      }
      setBusyId(null);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          className="bg-primary-700 hover:bg-primary-800 text-white"
          onClick={handleCreate}
          disabled={pending}
        >
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating…
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              New ATS Resume
            </>
          )}
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <FileText className="h-10 w-10 text-slate-400" />
            <p className="text-slate-500">
              No ATS resumes yet. Create one to start tailoring for a specific job.
            </p>
            <Button
              className="bg-primary-700 hover:bg-primary-800 text-white"
              onClick={handleCreate}
              disabled={pending}
            >
              <Plus className="mr-2 h-4 w-4" /> Create your first ATS Resume
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {items.map((r) => (
            <Card key={r.atsResumeId}>
              <CardHeader>
                <CardTitle className="truncate">
                  {r.firstName || r.lastName
                    ? `${r.firstName} ${r.lastName}`.trim()
                    : r.title || "Untitled ATS Resume"}
                </CardTitle>
                {r.jobTitle && (
                  <p className="text-sm text-muted-foreground">{r.jobTitle}</p>
                )}
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-xs text-slate-500">
                  Updated {new Date(r.updatedAt).toLocaleString()}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-primary-700 hover:bg-primary-800 text-white"
                    onClick={() =>
                      router.push(`/dashboard/ats-resume/${r.atsResumeId}/edit`)
                    }
                  >
                    Open
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(r.atsResumeId)}
                    disabled={busyId === r.atsResumeId}
                  >
                    {busyId === r.atsResumeId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ATSResumeList;
