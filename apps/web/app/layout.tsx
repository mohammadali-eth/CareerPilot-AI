import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { RootProvider } from "../components/providers/root-provider";
import "./globals.css";

const outfit = Outfit({
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
      <body className={`${outfit.variable} font-sans min-h-screen bg-background text-foreground antialiased`}>
        <div className="relative min-h-screen flex flex-col overflow-hidden bg-dot-pattern">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-subtle" />
          <div className="absolute top-0 -right-4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-subtle [animation-delay:1s]" />
          
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
            <RootProvider>
              {children}
            </RootProvider>
          </main>
        </div>
      </body>
    </html>
  );
}
