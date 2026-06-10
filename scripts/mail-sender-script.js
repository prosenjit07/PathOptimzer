const fs = require('fs');
const xlsx = require('xlsx');
const nodemailer = require('nodemailer');
const { exit } = require('process');
// download the above packages


// Load your Excel file
const workbook = xlsx.readFile('./list.xlsx'); // Path for the sheet in your local folder
const sheetName = 'Bytedance'; // Change to the name of your sheet
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet);

// Email configuration
const newTransporter = ()=>{
  return nodemailer.createTransport({
    pool: true,
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {

      user: "vaibhavmishra.dev@gmail.com",
      pass: ""
    },
  });
}
const transporter = newTransporter();
const sendEmail = async (row) => {
  const { Name, Company, Email, Role, Link } = row; // Adjust column names accordingly
  const nameParts = Name.split(' ');
  const name = nameParts[0];
  const mailOptions = {
    from: 'Vaibhav Mishra <vaibhavmishra.dev@gmail.com>',
    to: Email,
    subject: `Request for an Interview Opportunity - ${Role} at ${Company}`,
    html: `
<p>Greetings ${name},</p>
<p>I'm Vaibhav Mishra, a Software Developer at Groww. I got to know through your linkedin post that  <b>${Company}</b> is looking for a <b>${Role}</b>, therefore, I have mailed you to tell you about myself. I have: 
<ul>
<li><b>More than 3 Years</b> of hands-on experience in <b>Frontend Domain</b></li>
<li><b>2.3 Years</b> Experience as a <b>Frontend Developer</b> at <a href="https://groww.in/">Groww</a></li>
<li>Worked extensively in <b>Javascript, Typescript, React & Next.js</b></li>
<li>Familiar with <b>REST, GraphQL, monorepo codebases, Jest & React Testing library</b></li>
<li>Worked in the <b>Indian Equity</b> and <b>F&O </b> team having more than <b>25M monthly active users.</b></li>
<li><b>9 months</b> Experience as <b>SDE Intern</b> in <a href="https://groww.in/">Groww</a></li>
<li><b>3 months</b> Experience as <b>Full Stack Developer Intern</b> in <a href="http://www.prographer.com/">Prographer</a></li>
<li>Bachelor's in Computer Science from  <b>IIIT Gwalior, 2022 Grad </b></li>
<li><b>Expert </b> at Codeforces(Rating: 1645).</li>
</ul>

<p>Currently, I am <b>serving a notice period</b> and can <b>join within 15 days</b> of receiving an offer. A little help from your side can significantly help my career.</p>
<p>PS: I have attached my <b><a href="https://drive.google.com/file/d/1dMjAWdXAXLQnQvuX8K6fLozMDIbZ1L5_/view">Resume</a></b> & <b><a href="https://www.linkedin.com/in/vaibhavmishra09/">Linkedin Profile</a></b> ${Link !== undefined ? `& <b><a href=${Link}>${Role}</a> </b> Opening`  : '' } for you to take a look at. If you find me suitable, please help me with an Interview Opportunity at ${Company}.</p>
<p> 
<p>
Thanking You<br>
Regards,<br>
<b>Vaibhav Mishra</b> <br>
<b>Contact No: +91 9876543210</b><br>
</p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent to', Email);
  } catch (error) {
    console.error('Error sending email:', Email, error);
  }
};

const sendEmailsSynchronously = async () => {
  for (const row of data) {
    await sendEmail(row);
    await new Promise((resolve) => setTimeout(resolve, Math.random()*90000)); // Pause for 1 minute (adjust the duration as needed)
  }
  console.log("Done Sending mails")
  exit()
};

// Call the function to send emails
sendEmailsSynchronously(); 