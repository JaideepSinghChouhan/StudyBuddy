import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudyBuddy — AI-Powered Study Assistant",
  description:
    "Upload your lecture notes and get AI-generated quizzes and instant answers powered by RAG technology.",
  keywords: ["study", "AI", "quiz", "notes", "RAG", "education"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-grid relative">
        {/* Background glow effects */}
        <div
          className="bg-glow"
          style={{
            top: "-200px",
            left: "-100px",
            background:
              "radial-gradient(circle, rgba(108,92,231,0.3), transparent 70%)",
          }}
        />
        <div
          className="bg-glow"
          style={{
            bottom: "-200px",
            right: "-100px",
            background:
              "radial-gradient(circle, rgba(0,206,201,0.2), transparent 70%)",
          }}
        />

        {/* Main content */}
        <div className="relative z-10 flex flex-col min-h-full flex-1">
          {children}
        </div>
      </body>
    </html>
  );
}
