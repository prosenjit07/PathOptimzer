import { Resend } from 'resend';
import fs from "fs";
import path from "path";

const resend = new Resend(process.env.RESEND_API_KEY);
const cvPath = path.join(process.cwd(), "files", "CV.pdf");
const transcriptPath = path.join(process.cwd(), "files", "Transcript.pdf");

// export async function POST() {
//   const { data, error } = await resend.emails.send({
//     from: 'onboarding@resend.dev',
//     to: 'delivered@resend.dev',
//     subject: 'Hello world',
//     react: EmailTemplate({ firstName: 'John' }),
//   });

//   if (error) {
//     return Response.json({ error });
//   }

//   return Response.json(data);
// }
export async function POST() {
  const { data, error } = await resend.emails.send({
  from: "yourdomain@example.com",
  to: "professor@university.edu",
  subject: "MS Research Opportunity",
  html: "<p>Please find my CV and transcript attached.</p>",
  attachments: [
    {
      filename: "CV.pdf",
      content: fs.readFileSync(cvPath).toString("base64"),  
    },
    {
      filename: "Transcript.pdf",
      content: fs.readFileSync(transcriptPath).toString("base64"),
    },
  ],
});

if (error) {
  return Response.json({ error });
}

return Response.json(data);
}