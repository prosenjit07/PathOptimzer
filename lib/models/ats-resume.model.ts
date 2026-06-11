import mongoose from "mongoose";
import { themeColors } from "../utils";

/**
 * ATSPdfResume — a separate model from the legacy `Resume` model.
 * Used by the Marlin-style ATS builder (Typst-rendered, drag-and-drop,
 * responsibilities-based). Lives in the same MongoDB but does not share
 * any data with the older `Resume` model.
 */
const socialSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    text: { type: String, default: "" },
    link: { type: String, default: "" },
    selected: { type: Boolean, default: true },
  },
  { _id: false }
);

const responsibilitySchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    text: { type: String, default: "" },
    selected: { type: Boolean, default: true },
  },
  { _id: false }
);

const educationEntrySchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    institution: { type: String, default: "" },
    location: { type: String, default: "" },
    degree: { type: String, default: "" },
    result: { type: String, default: "" },
    startDate: { type: String, default: "" },
    endDate: { type: String, default: "" },
    isCurrent: { type: Boolean, default: false },
    responsibilities: { type: [responsibilitySchema], default: [] },
    selected: { type: Boolean, default: true },
  },
  { _id: false }
);

const experienceEntrySchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    company: { type: String, default: "" },
    position: { type: String, default: "" },
    location: { type: String, default: "" },
    startDate: { type: String, default: "" },
    endDate: { type: String, default: "" },
    isCurrent: { type: Boolean, default: false },
    responsibilities: { type: [responsibilitySchema], default: [] },
    selected: { type: Boolean, default: true },
  },
  { _id: false }
);

const projectEntrySchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, default: "" },
    link: { type: String, default: "" },
    stack: { type: String, default: "" },
    startDate: { type: String, default: "" },
    endDate: { type: String, default: "" },
    isCurrent: { type: Boolean, default: false },
    responsibilities: { type: [responsibilitySchema], default: [] },
    selected: { type: Boolean, default: true },
  },
  { _id: false }
);

const achievementEntrySchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    competition: { type: String, default: "" },
    position: { type: String, default: "" },
    location: { type: String, default: "" },
    date: { type: String, default: "" },
    responsibilities: { type: [responsibilitySchema], default: [] },
    selected: { type: Boolean, default: true },
  },
  { _id: false }
);

const skillItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, default: "" },
    selected: { type: Boolean, default: true },
  },
  { _id: false }
);

const skillCategorySchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, default: "" },
    skills: { type: [skillItemSchema], default: [] },
    selected: { type: Boolean, default: true },
  },
  { _id: false }
);

const profileSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    email: { type: String, default: "" },
    socials: { type: [socialSchema], default: [] },
  },
  { _id: false }
);

const atsResumeSchema = new mongoose.Schema(
  {
    atsResumeId: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, default: "Untitled ATS Resume" },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    jobTitle: { type: String, default: "" },
    themeColor: { type: String, default: themeColors?.[0] || "#26428b" },
    profile: { type: profileSchema, default: () => ({}) },
    education: { type: [educationEntrySchema], default: [] },
    experience: { type: [experienceEntrySchema], default: [] },
    project: { type: [projectEntrySchema], default: [] },
    achievement: { type: [achievementEntrySchema], default: [] },
    skill: { type: [skillCategorySchema], default: [] },
  },
  { timestamps: true }
);

const ATSPdfResume =
  mongoose.models.ATSPdfResume ||
  mongoose.model("ATSPdfResume", atsResumeSchema);

export default ATSPdfResume;
