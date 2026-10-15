import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CivicPing — Ann Arbor City Council, in plain language",
  description:
    "Follow Ann Arbor City Council in plain language: see the agenda items relevant to you, read verified summaries with official sources, and take action.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-stone-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
          <SiteHeader />
          <main className="flex flex-1 flex-col px-4 pb-10 pt-4">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
