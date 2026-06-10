"use client";

import React from "react";
import ResumeForm from "./ResumeForm";

/**
 * ResumeEditForm is now a thin wrapper around the unified single-page
 * ResumeForm. All sections (Personal, Summary, Experience, Education,
 * Skills) live on one scrollable page with auto-save — no next/prev clicks.
 */
const ResumeEditForm = ({
  params,
  userId,
}: {
  params: { id: string };
  userId: string | undefined;
}) => {
  if (!userId) {
    return null;
  }

  return <ResumeForm params={params} userId={userId} />;
};

export default ResumeEditForm;
