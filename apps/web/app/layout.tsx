import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { RootProvider } from "../components/providers/root-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "CareerPilot AI — Enterprise AI Career Mentor & Resume Intelligence",
  description:
    "Accelerate your professional trajectory with CareerPilot AI. Parse resumes, generate skill gap roadmaps, simulate interviews, and extract career paths using modern intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans min-h-screen bg-background text-foreground antialiased`}
      >
        <div className="relative min-h-screen flex flex-col overflow-hidden bg-grid-pattern">
          {/* Strict Monochrome Clean Background (No colored gradients) */}
          <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
            <RootProvider>{children}</RootProvider>
          </main>
        </div>
      </body>
    </html>
  );
}
