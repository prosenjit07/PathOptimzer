"use client";

import { useUser } from "@clerk/nextjs";
import { ArrowBigUp, AtomIcon, Edit, Share2, FileText, Mail, HelpCircle, Briefcase, Menu } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

// Navigation items
const navItems = [
  {
    name: "Resume Templates",
    href: "/resume-templates",
    icon: FileText,
    description: "Professional resume designs",
  },
  {
    name: "Cover Letter",
    href: "/cover-letter",
    icon: Briefcase,
    description: "Craft perfect cover letters",
  },
  {
    name: "Email Automation",
    href: "/email-automation",
    icon: Mail,
    description: "Automate job applications",
  },
  {
    name: "FAQ",
    href: "/faq",
    icon: HelpCircle,
    description: "Get help and support",
  },
];

// Navigation Component
function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { isSignedIn } = useUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 shadow-lg">
            <span className="text-lg font-bold text-white">P</span>
          </div>
          <span className="hidden text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent sm:inline-block">
            PathOptimizer
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex lg:items-center lg:gap-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="group relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 hover:text-primary-600"
            >
              <item.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
              {item.name}
              <span className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 bg-primary-600 transition-all group-hover:w-4/5" />
            </Link>
          ))}
        </nav>

        {/* CTA Buttons - Desktop */}
        <div className="hidden items-center gap-3 lg:flex">
          {isSignedIn ? (
            <Button asChild size="sm" className="rounded-full px-6">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full bg-gradient-to-r from-primary-600 to-primary-700 px-6 hover:from-primary-700 hover:to-primary-800">
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-[400px] p-0">
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-800">
                    <span className="text-lg font-bold text-white">P</span>
                  </div>
                  <span className="font-bold text-xl text-gray-900">
                    PathOptimizer
                  </span>
                </Link>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 overflow-y-auto p-6">
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.name}>
                      <Link
                        href={item.href}
                        className="flex items-start gap-4 rounded-xl p-4 transition-colors hover:bg-gray-50 group"
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600 group-hover:bg-primary-100 group-hover:scale-110 transition-all">
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    </SheetClose>
                  ))}
                </div>
              </nav>

              {/* Mobile CTA */}
              <div className="p-6 border-t bg-gray-50">
                {isSignedIn ? (
                  <SheetClose asChild>
                    <Button asChild className="w-full rounded-xl h-12 bg-gradient-to-r from-primary-600 to-primary-700">
                      <Link href="/dashboard" onClick={() => setIsOpen(false)}>Go to Dashboard</Link>
                    </Button>
                  </SheetClose>
                ) : (
                  <div className="space-y-3">
                    <SheetClose asChild>
                      <Button asChild variant="outline" className="w-full rounded-xl h-12">
                        <Link href="/sign-in" onClick={() => setIsOpen(false)}>Sign In</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild className="w-full rounded-xl h-12 bg-gradient-to-r from-primary-600 to-primary-700">
                        <Link href="/sign-up" onClick={() => setIsOpen(false)}>Get Started for Free</Link>
                      </Button>
                    </SheetClose>
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

// Main Page Component
export default function LandingPage() {
  const user = useUser();

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="py-8 px-6 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-12 md:px-10">
          <h1 className="mt-4 lg:mt-8 mb-4 text-4xl font-extrabold tracking-tight leading-none text-black md:text-5xl lg:text-6xl">
            Unlock Your Career Potential <span className="text-primary-700 max-sm:block">With AI</span>
          </h1>
          <p className="mb-8 text-lg font-normal text-gray-700 lg:text-xl sm:px-16 xl:px-48">
            Discover your dream job with PathOptimizer, customized resumes, and skill gap assessments to reach you toward your career goals.
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
            <Link
              href={`${!user?.isSignedIn ? "/sign-up" : "/dashboard"}`}
              className="relative flex h-11 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:bg-primary-700 before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max"
            >
              <span className="relative text-base font-semibold text-white">
                Get Started
              </span>
            </Link>
            <Link
              href="#learn-more"
              className="relative flex h-11 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:border before:border-transparent before:bg-slate-200 before:bg-gradient-to-b before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max"
            >
              <span className="relative text-base font-semibold text-primary">
                Learn more
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-8 px-6 mx-auto max-w-screen-xl text-center lg:py-8 lg:px-12 md:px-10">
        <h2 className="font-bold text-3xl" id="learn-more">
          How it Works?
        </h2>
        <h2 className="text-md text-gray-500">
          Generate resume in just 3 steps
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 md:px-24">
          <div className="cursor-pointer p-8 border border-gray-100 rounded-3xl bg-white shadow-xl max-md:shadow-md shadow-gray-600/10 hover:shadow-gray-600/15 transition-shadow duration-300">
            <AtomIcon className="h-8 w-8" />

            <h2 className="mt-4 text-xl font-bold text-black">
              Create Your Template
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Start by selecting the color scheme for your resume template. Our
              single, professionally designed template ensures a clean and
              consistent look for all users.
            </p>
          </div>

          <div className="cursor-pointer p-8 border border-gray-100 rounded-3xl bg-white shadow-xl max-md:shadow-md shadow-gray-600/10 hover:shadow-gray-600/15 transition-shadow duration-300">
            <Edit className="h-8 w-8" />

            <h2 className="mt-4 text-xl font-bold text-black">
              Update Your Information
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Enter your personal details, work experience, education, and
              skills into the provided form. Our AI assists you in filling out
              each section accurately and effectively.
            </p>
          </div>

          <div className="cursor-pointer p-8 border border-gray-100 rounded-3xl bg-white shadow-xl max-md:shadow-md shadow-gray-600/10 hover:shadow-gray-600/15 transition-shadow duration-300">
            <Share2 className="h-8 w-8" />

            <h2 className="mt-4 text-xl font-bold text-black">
              Share Your Resume
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              After completing your resume, save it securely and generate a
              shareable link. Easily update your information anytime and share
              the link with potential employers or download it in a preferred
              format.
            </p>
          </div>
        </div>

        <div className="mt-20 text-center">
          <Link
            href="#get-started"
            className="inline-block rounded-full bg-primary-700 px-12 py-3 text-sm font-medium text-white transition hover:bg-primary-800 focus:outline-none focus:ring focus:ring-primary-400"
          >
            <div className="flex items-center justify-center">
              <ArrowBigUp className="h-6 w-6 mr-2" />
              Get Started Today
            </div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="backdrop-blur-md w-full border-t bg-white/50">
        <div className="w-full mx-auto text-center max-w-screen-xl p-4 flex max-md:flex-col md:items-center md:justify-between">
          <span className="text-sm text-gray-500 sm:text-center">
            © 2026{" "}
            <span className="hover:text-primary-500 hover:cursor-pointer">
              PathOptimizer™
            </span>
            . All Rights Reserved.
          </span>
          <Link href="https://github.com/prosenjit07" className="me-4 md:me-6">
            <span className="hover:text-primary-500 mt-3 text-sm font-medium text-gray-500 sm:mt-0">
              Made by Prosenjit Biswas
            </span>
          </Link>
        </div>
      </footer>
    </div>
  );
}