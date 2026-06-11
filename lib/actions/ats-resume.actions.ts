"use server";

import { v4 as uuid } from "uuid";
import { revalidatePath } from "next/cache";
import ATSPdfResume from "../models/ats-resume.model";
import { connectToDB } from "../mongoose";

/**
 * Create a new blank ATS resume for the given Clerk user.
 * Returns { success, atsResumeId }.
 */
export async function createATSResume({ userId, title }: { userId: string; title?: string }) {
  try {
    await connectToDB();
    const atsResumeId = uuid();
    const doc = await ATSPdfResume.create({
      atsResumeId,
      userId,
      title: title || "Untitled ATS Resume",
    });
    return { success: true, atsResumeId: doc.atsResumeId };
  } catch (error: any) {
    console.error(`[createATSResume] ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * List the user's ATS resumes.
 */
export async function listATSResumes(userId: string) {
  try {
    await connectToDB();
    const docs = await ATSPdfResume.find({ userId })
      .sort({ updatedAt: -1 })
      .lean();
    return { success: true, data: JSON.parse(JSON.stringify(docs)) };
  } catch (error: any) {
    console.error(`[listATSResumes] ${error.message}`);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Load a single ATS resume (with ownership check).
 */
export async function getATSResume({ atsResumeId, userId }: { atsResumeId: string; userId: string }) {
  try {
    await connectToDB();
    const doc = await ATSPdfResume.findOne({ atsResumeId, userId }).lean();
    if (!doc) {
      return { success: false, error: "Resume not found" };
    }
    return { success: true, data: JSON.parse(JSON.stringify(doc)) };
  } catch (error: any) {
    console.error(`[getATSResume] ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Ownership check helper — used to gate the editor route.
 */
export async function checkATSResumeOwnership(userId: string, atsResumeId: string) {
  try {
    await connectToDB();
    const doc = await ATSPdfResume.findOne({ atsResumeId, userId }).select({ _id: 1 }).lean();
    return !!doc;
  } catch (error) {
    console.error(`[checkATSResumeOwnership]`, error);
    return false;
  }
}

/**
 * Update an ATS resume (full replace of nested arrays + profile).
 * Ownership is enforced by the userId clause in the filter.
 */
export async function updateATSResume({
  atsResumeId,
  userId,
  payload,
}: {
  atsResumeId: string;
  userId: string;
  payload: {
    title?: string;
    firstName?: string;
    lastName?: string;
    jobTitle?: string;
    themeColor?: string;
    profile?: any;
    education?: any[];
    experience?: any[];
    project?: any[];
    achievement?: any[];
    skill?: any[];
  };
}) {
  try {
    await connectToDB();
    const doc = await ATSPdfResume.findOneAndUpdate(
      { atsResumeId, userId },
      { $set: payload },
      { new: true }
    ).lean();
    if (!doc) {
      return { success: false, error: "Resume not found or not owned" };
    }
    revalidatePath(`/dashboard/ats-resume/${atsResumeId}/edit`);
    return { success: true, data: JSON.parse(JSON.stringify(doc)) };
  } catch (error: any) {
    console.error(`[updateATSResume] ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Delete an ATS resume.
 */
export async function deleteATSResume({
  atsResumeId,
  userId,
}: {
  atsResumeId: string;
  userId: string;
}) {
  try {
    await connectToDB();
    await ATSPdfResume.deleteOne({ atsResumeId, userId });
    revalidatePath("/dashboard/ats-resume");
    return { success: true };
  } catch (error: any) {
    console.error(`[deleteATSResume] ${error.message}`);
    return { success: false, error: error.message };
  }
}
