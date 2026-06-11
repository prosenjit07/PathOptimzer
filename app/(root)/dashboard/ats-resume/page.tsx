import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import PageWrapper from "@/components/common/PageWrapper";
import Header from "@/components/layout/Header";
import ATSResumeList from "@/components/ats/ATSResumeList";
import { listATSResumes } from "@/lib/actions/ats-resume.actions";

const ATSResumePage = async () => {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const { data } = await listATSResumes(user.id);

  return (
    <PageWrapper>
      <Header />
      <div className="my-10 mx-10 md:mx-20 lg:mx-36">
        <h2 className="text-center text-2xl font-bold">ATS Resumes</h2>
        <p className="text-center text-gray-600">
          Tailor resumes for each job posting and download a clean ATS-friendly PDF.
        </p>
      </div>
      <div className="px-6 md:px-24 lg:px-48">
        <ATSResumeList initialResumes={data || []} userId={user.id} />
      </div>
    </PageWrapper>
  );
};

export default ATSResumePage;
