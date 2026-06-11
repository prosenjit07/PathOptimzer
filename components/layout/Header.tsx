"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, FileText, Sparkles } from "lucide-react";
import React from "react";

const Header = () => {
  const user = useUser();
  const pathname = usePathname();
  const isSignedIn = !!user?.isSignedIn;

  const navItems = [
    { href: "/dashboard", label: "Resumes", icon: FileText },
    { href: "/dashboard/ats-resume", label: "ATS Resume", icon: Sparkles },
    { href: "/dashboard/email-automation", label: "Email Automation", icon: Mail },
  ];

  return (
    <header className="sticky top-0 z-50">
      <nav className="backdrop-blur-md px-6 py-2.5 border-b border-slate-200/60">
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
          <Link href="/" className="flex items-center">
            <img src="/icons/logo.svg" className="mr-3 h-7 sm:h-9" alt="logo" />
            <span className="self-center text-xl font-bold whitespace-nowrap">
              PathOptimzer
            </span>
          </Link>

          {isSignedIn && (
            <ul className="hidden md:flex items-center gap-1 order-1 md:order-none">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                        active
                          ? "bg-primary-700/10 text-primary-800"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex items-center lg:order-2">
            {user?.isLoaded && !isSignedIn ? (
              <Link
                href="/sign-in"
                className="text-gray-800 hover:bg-primary-700/10 duration-300 focus:ring-4 focus:ring-primary-700/30 font-medium rounded-full text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 focus:outline-none"
              >
                Log in
              </Link>
            ) : (
              <>
                <div className="mr-4 h-full items-center align-middle flex max-md:hidden justify-center">
                  <UserButton showName={true} />
                </div>
                <div className="mr-4 h-full items-center align-middle hidden max-md:flex justify-center">
                  <UserButton showName={false} />
                </div>
              </>
            )}
            <Link
              href={`${!isSignedIn ? "/sign-up" : "/dashboard"}`}
              className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-full text-sm px-4 lg:px-5 py-2 lg:py-2.5 focus:outline-none"
            >
              {!isSignedIn ? "Get started" : "Dashboard"}
            </Link>
          </div>
        </div>

        {isSignedIn && (
          <ul className="mt-2 flex md:hidden items-center gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
                      active
                        ? "bg-primary-700/10 text-primary-800"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </nav>
    </header>
  );
};

export default Header;
