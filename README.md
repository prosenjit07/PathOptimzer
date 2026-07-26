<div align="center">
 
  <br />

  <div>
    <img src="https://img.shields.io/badge/-Next_JS_14-black?style=for-the-badge&logoColor=white&logo=nextdotjs&color=393D72" alt="Next.js 14" />
    <img src="https://img.shields.io/badge/-MongoDB-black?style=for-the-badge&logoColor=white&logo=mongodb&color=1FAD58" alt="MongoDB" />
    <img src="https://img.shields.io/badge/-Tailwind_CSS-black?style=for-the-badge&logoColor=white&logo=tailwindcss&color=3FBFF8" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/-Clerk-black?style=for-the-badge&logoColor=white&logo=clerk&color=7C3AFF" alt="Clerk" />
    <img src="https://img.shields.io/badge/-TypeScript-black?style=for-the-badge&logoColor=white&logo=typescript&color=387CC8" alt="TypeScript" />
    <img src="https://img.shields.io/badge/-Gemini_AI-black?style=for-the-badge&logoColor=white&logo=google&color=4285F4" alt="Gemini AI" />
  </div>

  <h1 align="center">PathOptimzer — AI Resume Builder</h1>

  <p align="center">
    <b>PathOptimzer</b> is an AI-powered resume builder that helps you create, customize, and share professional resumes in minutes. Backed by Google's Gemini AI, it generates smart resume content tailored to your experience and target role.
  </p>

  <a href="https://pathoptimzer.netlify.app/"><strong>🌐 Visit Live App →</strong></a>

</div>

---

## 🖼️ Project Overview

<table>
  <tr>
    <td align="center" width="50%">
      <img src="./public/img/landing-page.png" alt="Landing Page" width="100%" />
      <br />
      <sub><b>Landing Page</b></sub>
    </td>
    <td align="center" width="50%">
      <img src="./public/img/ats-resume.png" alt="ATS Friendly Resume" width="100%" />
      <br />
      <sub><b>ATS Friendly Resume</b></sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <img src="./public/img/ai-response.jpeg" alt="AI Response" width="100%" />
      <br />
      <sub><b>AI Response</b></sub>
    </td>
    <td align="center" width="50%">
      <img src="./public/img/cv-create-output.jpeg" alt="CV Create Output" width="100%" />
      <br />
      <sub><b>CV Create Output</b></sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <img src="./public/img/download-cv.jpeg" alt="Download CV" width="100%" />
      <br />
      <sub><b>Download CV</b></sub>
    </td>
    <td align="center" width="50%">
      <img src="./public/img/EMAIL-Automation.png" alt="Email Automation" width="100%" />
      <br />
      <sub><b>Email Automation</b></sub>
    </td>
  </tr>
</table>

---

## 📋 Table of Contents

- [Project Overview](#️-project-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started (Local Dev)](#-getting-started-local-dev)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Contributing](#-contributing)
- [Contact](#-contact)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Resume Generation** | Leverage Google Gemini AI to auto-generate professional resume content |
| 🔐 **Authentication** | Secure sign-in / sign-up powered by Clerk |
| 📝 **Rich Text Editing** | Edit resume sections with a WYSIWYG editor (React Quill) |
| 👁️ **Real-Time Preview** | See your resume update live as you type |
| 💾 **Save & Share** | Save resumes to the cloud and share a public link |
| 📧 **Email Integration** | Send resume links via Resend email API |
| 📊 **Google Sheets Sync** | Export resume data to Google Sheets via service account |
| 📱 **Fully Responsive** | Mobile-first design that works on all screen sizes |

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/) |
| **Auth** | [Clerk](https://clerk.com/) |
| **AI** | [Google Gemini API](https://ai.google.dev/) |
| **Database** | [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) |
| **Forms** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Email** | [Resend](https://resend.com/) |
| **Rich Text** | [React Quill](https://github.com/zenoamaro/react-quill) |

---

## 📁 Project Structure

```
PathOptimzer/
├── app/
│   ├── (auth)/               # Clerk sign-in / sign-up pages
│   ├── (root)/
│   │   ├── dashboard/        # Main dashboard page (protected)
│   │   └── my-resume/        # Resume editor & viewer routes
│   ├── globals.css
│   └── layout.tsx
│
├── components/               # Reusable UI components
│
├── lib/
│   ├── actions/              # Next.js Server Actions
│   │   ├── gemini.actions.ts   # AI generation logic
│   │   ├── resume.actions.ts   # CRUD for resumes
│   │   └── user.actions.ts
│   ├── models/               # Mongoose models
│   ├── validations/          # Zod schemas
│   ├── context/              # React context providers
│   ├── mongoose.ts           # DB connection helper
│   └── utils.ts
│
├── middleware.ts              # Clerk route protection
├── next.config.mjs
├── tailwind.config.ts
└── .env                      # Local environment variables (never commit)
```

> **Protected routes** (require login): `/dashboard`, `/my-resume/:resumeId/edit`

---

## 🚀 Getting Started (Local Dev)

### Prerequisites

Make sure the following are installed on your machine:

- **Node.js** ≥ 18 → [Download](https://nodejs.org/)
- **npm** (comes with Node)
- **Git** → [Download](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/prosenjit07/PathOptimzer.git
cd PathOptimzer
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
cp .env.backup .env
```

Open `.env` and fill in all the required values. See the [Environment Variables](#-environment-variables) section below.

### 4. Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Hot reload is enabled by default.

---

## 🔑 Environment Variables

Create a `.env` file in the project root. **Never commit this file — it's in `.gitignore`.**

```env
# ─── Clerk Auth ─────────────────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# ─── MongoDB ────────────────────────────────────────────────
MONGODB_URL=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/pathoptimizer?retryWrites=true

# ─── Gemini AI ──────────────────────────────────────────────
GEMINI_API_KEY=AIza...

# ─── App ────────────────────────────────────────────────────
BASE_URL=http://localhost:3000

# ─── Email (Resend) ──────────────────────────────────────────
RESEND_API_KEY=re_...

# ─── Google Sheets (optional) ────────────────────────────────
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your_google_sheet_id
```

### Where to Get Each Key

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | [clerk.com](https://clerk.com/) → Dashboard → API Keys |
| `MONGODB_URL` | [mongodb.com](https://www.mongodb.com/) → Atlas → Connect → Drivers |
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| `RESEND_API_KEY` | [resend.com](https://resend.com/) → API Keys |
| `GOOGLE_CLIENT_EMAIL` / `GOOGLE_PRIVATE_KEY` | Google Cloud Console → IAM → Service Accounts |
| `GOOGLE_SHEET_ID` | Your Google Sheet URL: `spreadsheets/d/<ID>/edit` |

---

## 📜 Available Scripts

```bash
npm run dev       # Start the local dev server at http://localhost:3000
npm run build     # Create an optimised production build
npm run start     # Start the production server (requires build first)
npm run lint      # Run ESLint across the entire project
```

---

## 🤝 Contributing

Contributions are what make open-source projects great. All types of contributions are welcome — bug fixes, new features, docs improvements, and more!

### Quick Workflow

```
Fork → Branch → Change → Test → PR
```

---

### Step 1 — Fork & Clone

```bash
# 1. Click "Fork" on GitHub, then:
git clone https://github.com/<your-username>/PathOptimzer.git
cd PathOptimzer

# 2. Add the upstream remote so you can stay up to date
git remote add upstream https://github.com/prosenjit07/PathOptimzer.git
```

---

### Step 2 — Create a Feature Branch

Always branch off `main`. Use a descriptive branch name:

```bash
git checkout main
git pull upstream main
git checkout -b feature/your-feature-name
```

**Branch naming conventions:**

| Prefix | Use case |
|---|---|
| `feature/` | New features |
| `fix/` | Bug fixes |
| `docs/` | Documentation only |
| `refactor/` | Code change with no behaviour change |
| `chore/` | Dependency updates, config changes |

---

### Step 3 — Make Your Changes

- Follow the existing code style (TypeScript, functional components, Tailwind classes).
- Keep commits **small and focused** — one logical change per commit.
- Write clear, descriptive commit messages following [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# ✅ Good
git commit -m "feat: add AI skill suggestion to resume editor"
git commit -m "fix: resolve hydration mismatch on resume preview page"
git commit -m "docs: update contributing guide with branch naming rules"

# ❌ Avoid
git commit -m "fix stuff"
git commit -m "WIP"
git commit -m "asdfgh"
```

**Commit prefix guide:**

| Prefix | When to use |
|---|---|
| `feat:` | New user-facing feature |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `refactor:` | Internal code change, no behaviour change |
| `chore:` | Maintenance (deps, config, CI) |
| `style:` | Formatting, no logic change |
| `test:` | Adding or updating tests |

---

### Step 4 — Test Locally Before Pushing

```bash
npm run lint      # Must pass — fix any ESLint errors first
npm run dev       # Verify the app runs without errors
npm run build     # Recommended for larger changes
```

---

### Step 5 — Push & Open a Pull Request

```bash
git push origin feature/your-feature-name
```

Then open a PR from your fork → `main` on GitHub. In the PR description, include:

- **What does this PR do?** — Brief summary of the change
- **How to test?** — Steps for the reviewer to verify the behaviour
- **Screenshots** — Required for any UI changes
- **Related issue** — Link using `Closes #123` if applicable

---

### Step 6 — Code Review Process

- A maintainer will review your PR within a few days.
- Address review comments by pushing additional commits to the **same branch**.
- Once approved, the PR will be squash-merged into `main`.

---

### ⚠️ Golden Rules

- **Never commit `.env`** or files containing secrets/API keys.
- **Don't commit `node_modules/`** or `.next/` build artifacts.
- Keep PRs **focused** — avoid mixing unrelated changes in one PR.
- For **large or architectural changes**, open an issue first to discuss the approach before writing code.

---

### 🐛 Reporting Bugs

Open a [GitHub Issue](https://github.com/prosenjit07/PathOptimzer/issues/new) and include:

- A clear, descriptive title
- Steps to reproduce the bug
- Expected behaviour vs. actual behaviour
- Your environment: OS, Node.js version, browser

---

### 💡 Requesting Features

Open a [GitHub Issue](https://github.com/prosenjit07/PathOptimzer/issues/new) with the `enhancement` label. Describe **the use case**, not just the feature — explain the problem you're trying to solve.

---

## 📬 Contact

Have a question, found a bug, or just want to say hi?

- 📧 **Email:** [prosenjitbiswas983@gmail.com](mailto:prosenjitbiswas983@gmail.com)
- 🐙 **GitHub:** [@prosenjit07](https://github.com/prosenjit07)

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/prosenjit07">Prosenjit Chandra Biswas</a></sub>
</div>
