/**
 * Email Template Service
 * 
 * This service provides functions for generating personalized email content
 * for job applications using contact data from Google Sheets.
 */

import { ContactData } from "./read-excel-data";

export interface EmailTemplateData {
  recipientName: string;
  companyName: string;
  roleName: string;
  jobLink?: string;
  senderName: string;
  senderTitle: string;
  senderEmail: string;
  senderPhone: string;
  cvLink: string;
  linkedinLink: string;
}

/**
 * Extract first name from full name
 */
export function extractFirstName(fullName: string): string {
  if (!fullName || fullName.trim() === "") {
    return "Hiring Manager";
  }
  const parts = fullName.trim().split(" ");
  return parts[0];
}

/**
 * Generate email template data from contact and sender information
 */
export function generateTemplateData(
  contact: ContactData,
  senderConfig: SenderConfig
): EmailTemplateData {
  return {
    recipientName: extractFirstName(contact.Name),
    companyName: contact.Company,
    roleName: contact.Role,
    jobLink: contact.Link,
    senderName: senderConfig.name,
    senderTitle: senderConfig.title,
    senderEmail: senderConfig.email,
    senderPhone: senderConfig.phone,
    cvLink: senderConfig.cvLink,
    linkedinLink: senderConfig.linkedinLink,
  };
}

export interface SenderConfig {
  name: string;
  title: string;
  email: string;
  phone: string;
  cvLink: string;
  linkedinLink: string;
  experience: {
    years: string;
    currentCompany: string;
    currentRole: string;
    duration: string;
  };
  education: string;
  skills: string[];
  achievements: string[];
}

/**
 * Default sender configuration
 * This should be customized based on the actual sender's information
 */
export const defaultSenderConfig: SenderConfig = {
  name: "Your Name",
  title: "Software Developer",
  email: "your.email@example.com",
  phone: "+1 (123) 456-7890",
  cvLink: "https://drive.google.com/your-cv-link",
  linkedinLink: "https://linkedin.com/in/yourprofile",
  experience: {
    years: "3+ years",
    currentCompany: "Current Company",
    currentRole: "Software Developer",
    duration: "2+ years",
  },
  education: "Bachelor's in Computer Science",
  skills: [
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "REST APIs",
    "GraphQL",
  ],
  achievements: [
    "Worked with teams serving 25M+ monthly active users",
    "Led frontend development for multiple projects",
  ],
};

/**
 * Generate HTML email content with professional styling
 */
export function generateEmailHTML(data: EmailTemplateData): string {
  const jobLinkHtml = data.jobLink
    ? `& <b><a href="${data.jobLink}" style="color: #0066cc;">${data.roleName}</a></b> Opening`
    : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Job Application - ${data.roleName} at ${data.companyName}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .greeting {
            font-size: 16px;
            margin-bottom: 15px;
        }
        .content {
            margin-bottom: 15px;
            text-align: justify;
        }
        .highlight {
            background-color: #f0f8ff;
            padding: 2px 4px;
            border-radius: 3px;
        }
        .skills-list {
            margin: 10px 0;
            padding-left: 20px;
        }
        .skills-list li {
            margin-bottom: 5px;
        }
        .signature {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
        .signature-name {
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 5px;
        }
        .signature-detail {
            font-size: 14px;
            color: #666;
            margin: 2px 0;
        }
        a {
            color: #0066cc;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="greeting">
        <p>Greetings ${data.recipientName},</p>
    </div>
    
    <div class="content">
        <p>
            I'm ${data.senderName}, a ${data.senderTitle}. I learned that 
            <b>${data.companyName}</b> is looking for a <b>${data.roleName}</b>, 
            and I'm writing to express my interest in this opportunity. 
            I bring the following qualifications:
        </p>
    </div>
    
    <ul class="skills-list">
        <li><b>More than 3 Years</b> of hands-on experience in <b>Frontend Domain</b></li>
        <li>Extensive experience with <b>JavaScript, TypeScript, React & Next.js</b></li>
        <li>Familiar with <b>REST, GraphQL, monorepo codebases, Jest & React Testing library</b></li>
        <li>Bachelor's in Computer Science with strong academic credentials</li>
    </ul>
    
    <div class="content">
        <p>
            Currently, I am available to join immediately and am eager to bring my skills 
            and experience to the <b>${data.roleName}</b> role at <b>${data.companyName}</b>. 
            A little help from your side can significantly help my career.
        </p>
        <p>
            PS: I have attached my <b><a href="${data.cvLink}">Resume</a></b> 
            & <b><a href="${data.linkedinLink}">LinkedIn Profile</a></b> 
            ${jobLinkHtml} for you to take a look at. If you find me suitable, 
            please help me with an interview opportunity at ${data.companyName}.
        </p>
    </div>
    
    <div class="signature">
        <p>Thanking You</p>
        <p class="signature-name">${data.senderName}</p>
        <p class="signature-detail">${data.senderTitle}</p>
        <p class="signature-detail">${data.senderPhone}</p>
        <p class="signature-detail"><a href="mailto:${data.senderEmail}">${data.senderEmail}</a></p>
    </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text version of the email (for clients that don't support HTML)
 */
export function generateEmailText(data: EmailTemplateData): string {
  const jobLinkText = data.jobLink
    ? ` & ${data.roleName} Opening (${data.jobLink})`
    : "";

  return `
Greetings ${data.recipientName},

I'm ${data.senderName}, a ${data.senderTitle}. I learned that ${data.companyName} is looking for a ${data.roleName}, and I'm writing to express my interest in this opportunity. I bring the following qualifications:

- More than 3 Years of hands-on experience in Frontend Domain
- Extensive experience with JavaScript, TypeScript, React & Next.js
- Familiar with REST, GraphQL, monorepo codebases, Jest & React Testing library
- Bachelor's in Computer Science with strong academic credentials

Currently, I am available to join immediately and am eager to bring my skills and experience to the ${data.roleName} role at ${data.companyName}.

PS: I have attached my Resume (${data.cvLink}) & LinkedIn Profile (${data.linkedinLink})${jobLinkText} for you to take a look at. If you find me suitable, please help me with an interview opportunity at ${data.companyName}.

Thanking You

${data.senderName}
${data.senderTitle}
${data.senderPhone}
${data.senderEmail}
  `.trim();
}

/**
 * Generate email subject line
 */
export function generateEmailSubject(data: EmailTemplateData): string {
  return `Request for an Interview Opportunity - ${data.roleName} at ${data.companyName}`;
}

// Re-export types for convenience
export type { ContactData } from "./read-excel-data";