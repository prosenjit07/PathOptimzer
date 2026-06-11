import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import PageWrapper from "@/components/common/PageWrapper";
import Header from "@/components/layout/Header";
import { checkATSResumeOwnership, getATSResume } from "@/lib/actions/ats-resume.actions";
import ResumeEditor from "@/components/ats/ResumeEditor";

const EditATSResume = async ({ params }: { params: { id: string } }) => {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const atsResumeId = params.id;
  const owns = await checkATSResumeOwnership(user.id, atsResumeId);
  if (!owns) redirect("/dashboard/ats-resume");

  const { data } = await getATSResume({ atsResumeId, userId: user.id });

  return (
    <PageWrapper>
      <Header />
      <ResumeEditor
        atsResumeId={atsResumeId}
        userId={user.id}
        initialData={data}
        initialThemeColor={data?.themeColor}
      />
    </PageWrapper>
  );
};

export default EditATSResume;
