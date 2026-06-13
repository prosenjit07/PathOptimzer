"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { ArrowLeft, Loader2, Save, FileDown } from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import ProfileSection from "./sections/ProfileSection";
import EducationSection from "./sections/EducationSection";
import ExperienceSection from "./sections/ExperienceSection";
import ProjectSection from "./sections/ProjectSection";
import SkillSection from "./sections/SkillSection";
import AchievementSection from "./sections/AchievementSection";
import ResumePreview from "./ResumePreview";
import {
  profileData,
  educationData,
  experienceData,
  projectData,
  achievementData,
  skillData,
  renderTimeData,
  downloadData,
  getEmptyProfile,
} from "@/lib/ats/store";
import { updateATSResume } from "@/lib/actions/ats-resume.actions";

type SaveStatus = "idle" | "saving" | "saved" | "error";
const AUTO_SAVE_DELAY = 1500;

const ResumeEditor = ({
  atsResumeId,
  userId,
  initialData,
  initialThemeColor,
}: {
  atsResumeId: string;
  userId: string;
  initialData?: any;
  initialThemeColor?: string;
}) => {
  const router = useRouter();
  const { toast } = useToast();

  const [profile, setProfile] = useAtom(profileData);
  const [education, setEducation] = useAtom(educationData);
  const [experience, setExperience] = useAtom(experienceData);
  const [project, setProject] = useAtom(projectData);
  const [achievement, setAchievement] = useAtom(achievementData);
  const [skill, setSkill] = useAtom(skillData);
  const [renderTime, setRenderTime] = useAtom(renderTimeData);
  const [download, setDownload] = useAtom(downloadData);

  // Hydrate once from server-provided initial data
  const hydrated = useRef(false);
  useEffect(() => {
    if (hydrated.current || !initialData) return;
    hydrated.current = true;
    // Only hydrate the profile if it has at least one populated field —
    // a freshly created resume has profile = {} which would clobber the
    // store defaults (e.g. the `socials` array).
    if (initialData.profile && Object.keys(initialData.profile).length > 0) {
      setProfile({ ...getEmptyProfile(), ...initialData.profile });
    }
    if (initialData.education?.length) setEducation(initialData.education);
    if (initialData.experience?.length) setExperience(initialData.experience);
    if (initialData.project?.length) setProject(initialData.project);
    if (initialData.achievement?.length) setAchievement(initialData.achievement);
    if (initialData.skill?.length) setSkill(initialData.skill);
  }, [initialData, setProfile, setEducation, setExperience, setProject, setAchievement, setSkill]);

  // -------- auto-save --------
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerAutoSave = () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus("saving");
    setSaveError(null);
    saveTimer.current = setTimeout(async () => {
      try {
        const payload = {
          profile,
          education,
          experience,
          project,
          achievement,
          skill,
          themeColor: initialThemeColor,
          firstName: profile?.name?.split(" ")[0] || "",
          lastName: profile?.name?.split(" ").slice(1).join(" ") || "",
        };
        const res = await updateATSResume({ atsResumeId, userId, payload });
        if (res.success) {
          setSaveStatus("saved");
          setLastSavedAt(new Date());
        } else {
          setSaveStatus("error");
          setSaveError(res.error || "Save failed");
        }
      } catch (e: any) {
        setSaveStatus("error");
        setSaveError(e?.message || "Save failed");
      }
    }, AUTO_SAVE_DELAY);
  };

  // Watch all sections; debounce auto-save
  useEffect(() => {
    if (!hydrated.current) return;
    triggerAutoSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, education, experience, project, achievement, skill]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const saveLabel =
    saveStatus === "saving"
      ? "Saving…"
      : saveStatus === "error"
      ? saveError || "Save failed"
      : saveStatus === "saved" && lastSavedAt
      ? `Saved · ${lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
      : "All changes auto-save";

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white/80 px-4 py-2 backdrop-blur">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/ats-resume")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="text-sm font-semibold">ATS Resume Editor</div>
            <div
              className={`flex items-center gap-1 text-xs ${
                saveStatus === "error"
                  ? "text-rose-600"
                  : saveStatus === "saved"
                  ? "text-emerald-600"
                  : "text-slate-500"
              }`}
            >
              {saveStatus === "saving" ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : saveStatus === "error" ? (
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              ) : saveStatus === "saved" ? (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              )}
              {saveLabel}
              {renderTime > 0 && (
                <span className="ml-2 text-slate-400">· rendered in {renderTime.toFixed(0)}ms</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={triggerAutoSave}
            disabled={saveStatus === "saving"}
          >
            <Save className="mr-1 h-4 w-4" /> Save now
          </Button>
          <Button
            size="sm"
            className="bg-primary-700 hover:bg-primary-800 text-white"
            onClick={() => {
              setDownload(download + 1);
              toast({
                title: "Download started",
                description: "Your PDF is being prepared.",
                className: "bg-white",
              });
            }}
          >
            <FileDown className="mr-1 h-4 w-4" /> Get PDF
          </Button>
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        <ResizablePanel defaultSize={50} minSize={30} className="overflow-y-auto bg-slate-50">
          <div className="space-y-4 p-4">
            <ProfileSection />
            <ExperienceSection />
            <EducationSection />
            <ProjectSection />
            <SkillSection />
            <AchievementSection />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} minSize={30} className="overflow-auto bg-slate-100">
          <ResumePreview
            themeColor={initialThemeColor}
            onRenderTime={(t) => setRenderTime(t)}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default ResumeEditor;
