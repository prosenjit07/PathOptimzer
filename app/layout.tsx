import type { Metadata } from "next";
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { ClerkProvider } from "@clerk/nextjs";
import Providers from "@/components/common/ProgressBarProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PathOptimizer — The career OS, in liquid form",
  description:
    "An AI career studio that sculpts résumés, cover letters, and outreach into the shape that gets you hired.",
  icons: {
    icon: "/icons/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      afterSignOutUrl="/"
      appearance={{
        layout: {
          socialButtonsPlacement: "bottom",
          logoImageUrl: "/icons/logo.svg",
        },
      }}
    >
      <html lang="en">
        <body
          className={`${inter.variable} ${instrumentSerif.variable} ${jetbrains.variable} font-sans antialiased bg-[#f4f7ff] text-slate-900`}
        >
          <Providers>{children}</Providers>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
