"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next-nprogress-bar";
import { Brain, CheckCircle2, Loader2, Minus, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import RichTextEditor from "@/components/common/RichTextEditor";
import { useToast } from "@/components/ui/use-toast";
import { useFormContext } from "@/lib/context/FormProvider";
import {
  addEducationToResume,
  addExperienceToResume,
  addSkillToResume,
  updateResume,
} from "@/lib/actions/resume.actions";
import {
  generateEducationDescription,
  generateExperienceDescription,
  generateSummary,
} from "@/lib/actions/gemini.actions";
import ThemeColor from "@/components/layout/ThemeColor";

type SaveStatus = "idle" | "saving" | "saved" | "error";

const AUTO_SAVE_DELAY = 1200; // ms after the last edit

const ResumeForm = ({
  params,
  userId,
}: {
  params: { id: string };
  userId: string | undefined;
}) => {
  if (!userId) return null;

  const router = useRouter();
  const { toast } = useToast();
  const { formData, handleInputChange } = useFormContext();

  // -------- local state synced with form context --------
  const [summary, setSummary] = useState<string>(formData?.summary || "");
  const [experienceList, setExperienceList] = useState<any[]>(
    formData?.experience?.length
      ? formData.experience
      : [
          {
            title: "",
            companyName: "",
            city: "",
            state: "",
            startDate: "",
            endDate: "",
            workSummary: "",
          },
        ]
  );
  const [educationList, setEducationList] = useState<any[]>(
    formData?.education?.length
      ? formData.education
      : [
          {
            universityName: "",
            degree: "",
            major: "",
            startDate: "",
            endDate: "",
            description: "",
          },
        ]
  );
  const [skillsList, setSkillsList] = useState<any[]>(
    formData?.skills?.length
      ? formData.skills
      : [{ name: "", rating: 1 }]
  );

  // Keep local state in sync once formData loads from server
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    if (!formData || Object.keys(formData).length === 0) return;
    initialized.current = true;
    setSummary(formData.summary || "");
    if (formData.experience?.length) setExperienceList(formData.experience);
    if (formData.education?.length) setEducationList(formData.education);
    if (formData.skills?.length) setSkillsList(formData.skills);
  }, [formData]);

  // -------- save status --------
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstSaveSkipped = useRef(false);

  const triggerAutoSave = () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus("saving");
    setSaveError(null);
    saveTimer.current = setTimeout(async () => {
      try {
        // Sanitize values before they hit the server. Anything in the form
        // context that is supposed to be a primitive string but accidentally
        // got an event-like object (e.g. from RichTextEditor's wrapped
        // onChange) will be unwrapped here.
        const sanitizeExperience = (list: any[]) =>
          (list || []).map((e: any) => ({
            ...e,
            workSummary:
              typeof e?.workSummary === "string"
                ? e.workSummary
                : e?.workSummary?.target?.value ?? "",
            title: e?.title ?? "",
            companyName: e?.companyName ?? "",
            city: e?.city ?? "",
            state: e?.state ?? "",
            startDate: e?.startDate ?? "",
            endDate: e?.endDate ?? "",
          }));
        const sanitizeEducation = (list: any[]) =>
          (list || []).map((e: any) => ({
            ...e,
            description:
              typeof e?.description === "string"
                ? e.description
                : e?.description?.target?.value ?? "",
            universityName: e?.universityName ?? "",
            degree: e?.degree ?? "",
            major: e?.major ?? "",
            startDate: e?.startDate ?? "",
            endDate: e?.endDate ?? "",
          }));
        const sanitizeSkills = (list: any[]) =>
          (list || []).map((s: any) => ({
            name: typeof s?.name === "string" ? s.name : "",
            rating: Number(s?.rating) || 1,
          }));

        const cleanExperience = sanitizeExperience(
          formData?.experience?.length ? formData.experience : experienceList
        );
        const cleanEducation = sanitizeEducation(
          formData?.education?.length ? formData.education : educationList
        );
        const cleanSkills = sanitizeSkills(
          formData?.skills?.length ? formData.skills : skillsList
        );

        const summaryValue =
          typeof formData?.summary === "string" ? formData.summary : summary;

        const updates = {
          firstName: formData?.firstName ?? "",
          lastName: formData?.lastName ?? "",
          jobTitle: formData?.jobTitle ?? "",
          address: formData?.address ?? "",
          phone: formData?.phone ?? "",
          email: formData?.email ?? "",
          summary: summaryValue,
        };

        const results = await Promise.all([
          updateResume({ resumeId: params.id, updates }),
          addExperienceToResume(params.id, cleanExperience),
          addEducationToResume(params.id, cleanEducation),
          addSkillToResume(params.id, cleanSkills),
        ]);

        const firstError = results.find((r) => !r.success);
        if (firstError) {
          setSaveStatus("error");
          setSaveError(firstError.error || "Save failed");
        } else {
          setSaveStatus("saved");
          setSaveError(null);
          setLastSavedAt(new Date());
        }
      } catch (err) {
        console.error("auto-save error", err);
        setSaveStatus("error");
        setSaveError(err instanceof Error ? err.message : String(err));
      }
    }, AUTO_SAVE_DELAY);
  };

  // Once formData finishes its first load, skip the spurious first auto-save
  useEffect(() => {
    if (!firstSaveSkipped.current && formData && Object.keys(formData).length > 0) {
      firstSaveSkipped.current = true;
    }
  }, [formData]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  // -------- personal details handlers --------
  const onPersonalField = (e: any) => handleInputChange(e);

  // -------- summary handlers --------
  const onSummaryChange = (v: string) => {
    setSummary(v);
    handleInputChange({ target: { name: "summary", value: v } });
    triggerAutoSave();
  };

  const [isSummaryAiLoading, setIsSummaryAiLoading] = useState(false);
  const [aiSummaryList, setAiSummaryList] = useState<any[]>([]);
  const generateSummaryFromAI = async () => {
    setIsSummaryAiLoading(true);
    const result = await generateSummary(formData?.jobTitle);
    setAiSummaryList(result || []);
    setIsSummaryAiLoading(false);
  };

  // -------- experience handlers --------
  const onExperienceChange = (index: number, e: any) => {
    const next = experienceList.slice();
    const { name, value } = e.target;
    next[index][name] = value;
    setExperienceList(next);
    handleInputChange({ target: { name: "experience", value: next } });
    triggerAutoSave();
  };
  const onExperienceRichText = (index: number, value: string) => {
    const next = experienceList.slice();
    next[index].workSummary = value;
    setExperienceList(next);
    handleInputChange({ target: { name: "experience", value: next } });
    triggerAutoSave();
  };
  const addExperience = () => {
    const next = [
      ...experienceList,
      {
        title: "",
        companyName: "",
        city: "",
        state: "",
        startDate: "",
        endDate: "",
        workSummary: "",
      },
    ];
    setExperienceList(next);
    handleInputChange({ target: { name: "experience", value: next } });
  };
  const removeExperience = () => {
    if (experienceList.length <= 1) return;
    const next = experienceList.slice(0, -1);
    setExperienceList(next);
    handleInputChange({ target: { name: "experience", value: next } });
    triggerAutoSave();
  };

  const [aiExpList, setAiExpList] = useState<any[]>([]);
  const [aiExpLoadingIndex, setAiExpLoadingIndex] = useState<number | null>(null);
  const [aiExpTargetIndex, setAiExpTargetIndex] = useState<number>(0);
  const generateExperienceAI = async (index: number) => {
    const item = experienceList[index];
    if (!item?.title || !item?.companyName) {
      toast({
        title: "Add title & company first",
        description: "Enter position title and company name to generate a summary.",
        variant: "destructive",
        className: "bg-white border-2",
      });
      return;
    }
    setAiExpTargetIndex(index);
    setAiExpLoadingIndex(index);
    const result = await generateExperienceDescription(
      `${item.title} at ${item.companyName}`
    );
    setAiExpList(result || []);
    setAiExpLoadingIndex(null);
  };

  // -------- education handlers --------
  const onEducationChange = (index: number, e: any) => {
    const next = educationList.slice();
    const { name, value } = e.target;
    next[index][name] = value;
    setEducationList(next);
    handleInputChange({ target: { name: "education", value: next } });
    triggerAutoSave();
  };
  const addEducation = () => {
    const next = [
      ...educationList,
      {
        universityName: "",
        degree: "",
        major: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ];
    setEducationList(next);
    handleInputChange({ target: { name: "education", value: next } });
  };
  const removeEducation = () => {
    if (educationList.length <= 1) return;
    const next = educationList.slice(0, -1);
    setEducationList(next);
    handleInputChange({ target: { name: "education", value: next } });
    triggerAutoSave();
  };

  const [aiEduList, setAiEduList] = useState<any[]>([]);
  const [aiEduLoadingIndex, setAiEduLoadingIndex] = useState<number | null>(null);
  const [aiEduTargetIndex, setAiEduTargetIndex] = useState<number>(0);
  const generateEducationAI = async (index: number) => {
    const item = educationList[index];
    if (!item?.universityName || !item?.degree || !item?.major) {
      toast({
        title: "Add institute, degree & major first",
        description: "Enter those three fields to generate a description.",
        variant: "destructive",
        className: "bg-white border-2",
      });
      return;
    }
    setAiEduTargetIndex(index);
    setAiEduLoadingIndex(index);
    const result = await generateEducationDescription(
      `${item.universityName} on ${item.degree} in ${item.major}`
    );
    setAiEduList(result || []);
    setAiEduLoadingIndex(null);
  };

  // -------- skills handlers --------
  const onSkillChange = (index: number, name: string, value: any) => {
    const next = [...skillsList];
    next[index][name] = value;
    setSkillsList(next);
    handleInputChange({ target: { name: "skills", value: next } });
    triggerAutoSave();
  };
  const addSkill = () => {
    const next = [...skillsList, { name: "", rating: 1 }];
    setSkillsList(next);
    handleInputChange({ target: { name: "skills", value: next } });
  };
  const removeSkill = () => {
    if (skillsList.length <= 1) return;
    const next = skillsList.slice(0, -1);
    setSkillsList(next);
    handleInputChange({ target: { name: "skills", value: next } });
    triggerAutoSave();
  };

  // -------- save indicator --------
  const saveLabel = useMemo(() => {
    if (saveStatus === "saving") return "Saving…";
    if (saveStatus === "error") return saveError || "Save failed";
    if (saveStatus === "saved" && lastSavedAt) {
      return `Saved · ${lastSavedAt.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }
    return "All changes auto-save";
  }, [saveStatus, lastSavedAt, saveError]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
        <div className="flex items-center gap-3">
          <ThemeColor params={params} />
          <div
            className={`flex items-center gap-1.5 text-xs ${
              saveStatus === "error"
                ? "text-rose-600"
                : saveStatus === "saved"
                ? "text-emerald-600"
                : "text-slate-500"
            }`}
            aria-live="polite"
          >
            {saveStatus === "saving" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : saveStatus === "saved" ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : saveStatus === "error" ? (
              <span className="h-2 w-2 rounded-full bg-rose-500" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-slate-300" />
            )}
            {saveLabel}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => triggerAutoSave()}
            disabled={saveStatus === "saving"}
            className="flex gap-2"
          >
            {saveStatus === "saving" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Save now
          </Button>
          <Button
            size="sm"
            className="bg-primary-700 hover:bg-primary-800 text-white"
            onClick={() => router.push(`/my-resume/${params.id}/view`)}
          >
            Preview
          </Button>
        </div>
      </div>

      {/* ============= Personal details ============= */}
      <Section title="Personal Details" subtitle="Get started with the basics">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="First Name">
            <Input
              name="firstName"
              defaultValue={formData?.firstName}
              onChange={(e) => {
                onPersonalField(e);
                triggerAutoSave();
              }}
              className="no-focus"
            />
          </Field>
          <Field label="Last Name">
            <Input
              name="lastName"
              defaultValue={formData?.lastName}
              onChange={(e) => {
                onPersonalField(e);
                triggerAutoSave();
              }}
              className="no-focus"
            />
          </Field>
          <Field label="Job Title" className="sm:col-span-2">
            <Input
              name="jobTitle"
              defaultValue={formData?.jobTitle}
              onChange={(e) => {
                onPersonalField(e);
                triggerAutoSave();
              }}
              className="no-focus"
            />
          </Field>
          <Field label="Address" className="sm:col-span-2">
            <Input
              name="address"
              defaultValue={formData?.address}
              onChange={(e) => {
                onPersonalField(e);
                triggerAutoSave();
              }}
              className="no-focus"
            />
          </Field>
          <Field label="Phone">
            <Input
              name="phone"
              defaultValue={formData?.phone}
              onChange={(e) => {
                onPersonalField(e);
                triggerAutoSave();
              }}
              className="no-focus"
            />
          </Field>
          <Field label="Email">
            <Input
              name="email"
              defaultValue={formData?.email}
              onChange={(e) => {
                onPersonalField(e);
                triggerAutoSave();
              }}
              className="no-focus"
            />
          </Field>
        </div>
      </Section>

      {/* ============= Summary ============= */}
      <Section
        title="Summary"
        subtitle="A short pitch about your work"
        right={
          <Button
            size="sm"
            variant="outline"
            onClick={generateSummaryFromAI}
            disabled={isSummaryAiLoading}
            className="border-primary text-primary flex gap-2"
          >
            {isSummaryAiLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Brain className="h-4 w-4" />
            )}
            Generate from AI
          </Button>
        }
      >
        <Textarea
          className="no-focus min-h-[10em]"
          value={summary}
          onChange={(e) => onSummaryChange(e.target.value)}
          placeholder="A short summary that captures your value…"
        />
        {aiSummaryList.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              AI Suggestions — click to apply
            </p>
            {aiSummaryList.map((item: any, i: number) => (
              <button
                key={i}
                type="button"
                onClick={() => onSummaryChange(item?.summary || "")}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left text-sm text-slate-700 shadow-sm transition hover:border-primary-300 hover:bg-primary-50/50"
              >
                <span className="block text-xs font-semibold text-primary-700">
                  Level: {item?.experience_level}
                </span>
                <span className="mt-1 block text-pretty">{item?.summary}</span>
              </button>
            ))}
          </div>
        )}
      </Section>

      {/* ============= Experience ============= */}
      <Section
        title="Professional Experience"
        subtitle="Add your previous jobs"
        right={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={addExperience}
              className="text-primary"
            >
              <Plus className="size-4 mr-1" /> Add
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={removeExperience}
              disabled={experienceList.length <= 1}
              className="text-primary"
            >
              <Minus className="size-4 mr-1" /> Remove
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {experienceList.map((item: any, index: number) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-4"
            >
              <Field label="Position Title">
                <Input
                  name="title"
                  defaultValue={item?.title}
                  onChange={(e) => onExperienceChange(index, e)}
                  className="no-focus"
                />
              </Field>
              <Field label="Company Name">
                <Input
                  name="companyName"
                  defaultValue={item?.companyName}
                  onChange={(e) => onExperienceChange(index, e)}
                  className="no-focus"
                />
              </Field>
              <Field label="City">
                <Input
                  name="city"
                  defaultValue={item?.city}
                  onChange={(e) => onExperienceChange(index, e)}
                  className="no-focus"
                />
              </Field>
              <Field label="State">
                <Input
                  name="state"
                  defaultValue={item?.state}
                  onChange={(e) => onExperienceChange(index, e)}
                  className="no-focus"
                />
              </Field>
              <Field label="Start Date">
                <Input
                  type="date"
                  name="startDate"
                  defaultValue={item?.startDate}
                  onChange={(e) => onExperienceChange(index, e)}
                  className="no-focus"
                />
              </Field>
              <Field label="End Date">
                <Input
                  type="date"
                  name="endDate"
                  defaultValue={item?.endDate}
                  onChange={(e) => onExperienceChange(index, e)}
                  className="no-focus"
                />
              </Field>
              <div className="sm:col-span-2 space-y-2">
                <div className="flex items-end justify-between">
                  <label className="text-sm font-semibold text-slate-700">
                    Summary
                  </label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateExperienceAI(index)}
                    disabled={aiExpLoadingIndex === index}
                    className="border-primary text-primary flex gap-2"
                  >
                    {aiExpLoadingIndex === index ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Brain className="h-4 w-4" />
                    )}
                    Generate from AI
                  </Button>
                </div>
                <RichTextEditor
                  defaultValue={item?.workSummary || ""}
                  onRichTextEditorChange={(e: any) => {
                    // RichTextEditor wraps the value into a fake event:
                    // { target: { name: "workSummary", value: html } }
                    const html = e?.target?.value ?? "";
                    onExperienceRichText(index, html);
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {aiExpList.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              AI Suggestions — click to apply to entry #{aiExpTargetIndex + 1}
            </p>
            {aiExpList.map((item: any, i: number) => (
              <button
                key={i}
                type="button"
                onClick={() =>
                  onExperienceChange(aiExpTargetIndex, {
                    target: { name: "workSummary", value: item?.description },
                  })
                }
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left text-sm text-slate-700 shadow-sm transition hover:border-primary-300 hover:bg-primary-50/50"
              >
                <span className="block text-xs font-semibold text-primary-700">
                  Level: {item?.activity_level}
                </span>
                <span className="mt-1 block text-pretty">
                  {item?.description}
                </span>
              </button>
            ))}
          </div>
        )}
      </Section>

      {/* ============= Education ============= */}
      <Section
        title="Education"
        subtitle="Add your educational details"
        right={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={addEducation}
              className="text-primary"
            >
              <Plus className="size-4 mr-1" /> Add
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={removeEducation}
              disabled={educationList.length <= 1}
              className="text-primary"
            >
              <Minus className="size-4 mr-1" /> Remove
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {educationList.map((item: any, index: number) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-4"
            >
              <Field label="Name of Institute" className="sm:col-span-2">
                <Input
                  name="universityName"
                  defaultValue={item?.universityName}
                  onChange={(e) => onEducationChange(index, e)}
                  className="no-focus"
                />
              </Field>
              <Field label="Degree">
                <Input
                  name="degree"
                  defaultValue={item?.degree}
                  onChange={(e) => onEducationChange(index, e)}
                  className="no-focus"
                />
              </Field>
              <Field label="Major">
                <Input
                  name="major"
                  defaultValue={item?.major}
                  onChange={(e) => onEducationChange(index, e)}
                  className="no-focus"
                />
              </Field>
              <Field label="Start Date">
                <Input
                  type="date"
                  name="startDate"
                  defaultValue={item?.startDate}
                  onChange={(e) => onEducationChange(index, e)}
                  className="no-focus"
                />
              </Field>
              <Field label="End Date">
                <Input
                  type="date"
                  name="endDate"
                  defaultValue={item?.endDate}
                  onChange={(e) => onEducationChange(index, e)}
                  className="no-focus"
                />
              </Field>
              <div className="sm:col-span-2 space-y-2">
                <div className="flex items-end justify-between">
                  <label className="text-sm font-semibold text-slate-700">
                    Description
                  </label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateEducationAI(index)}
                    disabled={aiEduLoadingIndex === index}
                    className="border-primary text-primary flex gap-2"
                  >
                    {aiEduLoadingIndex === index ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Brain className="h-4 w-4" />
                    )}
                    Generate from AI
                  </Button>
                </div>
                <Textarea
                  name="description"
                  defaultValue={item?.description || ""}
                  onChange={(e) => onEducationChange(index, e)}
                  className="no-focus min-h-[7em]"
                />
              </div>
            </div>
          ))}
        </div>

        {aiEduList.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              AI Suggestions — click to apply to entry #{aiEduTargetIndex + 1}
            </p>
            {aiEduList.map((item: any, i: number) => (
              <button
                key={i}
                type="button"
                onClick={() =>
                  onEducationChange(aiEduTargetIndex, {
                    target: { name: "description", value: item?.description },
                  })
                }
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left text-sm text-slate-700 shadow-sm transition hover:border-primary-300 hover:bg-primary-50/50"
              >
                <span className="block text-xs font-semibold text-primary-700">
                  Level: {item?.activity_level}
                </span>
                <span className="mt-1 block text-pretty">
                  {item?.description}
                </span>
              </button>
            ))}
          </div>
        )}
      </Section>

      {/* ============= Skills ============= */}
      <Section
        title="Skill Sets"
        subtitle="Add your top professional key skills"
        right={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={addSkill}
              className="text-primary"
            >
              <Plus className="size-4 mr-1" /> Add
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={removeSkill}
              disabled={skillsList.length <= 1}
              className="text-primary"
            >
              <Minus className="size-4 mr-1" /> Remove
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          {skillsList.map((item: any, index: number) => (
            <div
              key={index}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 lg:flex-row lg:items-end lg:justify-between"
            >
              <div className="w-full space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Skill #{index + 1}
                </label>
                <Input
                  defaultValue={item.name}
                  onChange={(e) =>
                    onSkillChange(index, "name", e.target.value)
                  }
                  className="no-focus"
                />
              </div>
              <Rating
                style={{ maxWidth: 160, height: 46 }}
                value={item.rating || 1}
                onChange={(v: any) => onSkillChange(index, "rating", v)}
                orientation="horizontal"
                isRequired
              />
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
};

export default ResumeForm;

// =============== helpers ===============
function Section({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {subtitle && (
            <p className="text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}
