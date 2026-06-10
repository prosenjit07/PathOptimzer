import React from "react";
import PageWrapper from "@/components/common/PageWrapper";
import Header from "@/components/layout/Header";
import EmailAutomation from "@/components/dashboard/EmailAutomation";

const EmailAutomationPage = () => {
  return (
    <PageWrapper>
      <Header />
      <div className="my-10 mx-10 md:mx-20 lg:mx-36">
        <h2 className="text-center text-2xl font-bold">Email Automation</h2>
        <p className="text-center text-gray-600">
          Send personalized job applications to contacts stored in your Google
          Sheet using the Resend API.
        </p>
      </div>
      <div className="p-6 md:px-12 lg:px-24">
        <EmailAutomation />
      </div>
    </PageWrapper>
  );
};

export default EmailAutomationPage;
