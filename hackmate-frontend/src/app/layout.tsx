import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

import Navbar from "../components/Navbar";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "HackMate — Find your people. Ship your idea.",
  description:
    "HackMate is where hackers find teammates worth building with. Skill-aware matching, live team chat, and a home for every hackathon you join.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-[color-mix(in_oklch,var(--ember)_40%,transparent)]">
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 noise opacity-30 mix-blend-overlay"
        />
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <Toaster theme="dark" />
      </body>
    </html>
  );
}
