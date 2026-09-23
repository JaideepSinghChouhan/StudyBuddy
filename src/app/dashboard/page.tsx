"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

function DashboardContent() {
  const searchParams = useSearchParams();
  const docId = searchParams.get("doc");
  const filename = searchParams.get("filename") || "Unknown document";

  if (!docId) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center px-6">
        <div className="glass-card p-10 text-center max-w-md">
          <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center text-error mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold mb-2">No Document Found</h2>
          <p className="text-sm text-muted mb-4">Please upload a PDF first to get started.</p>
          <Link href="/" className="btn-primary inline-block">
            Upload Notes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-6 py-16">
      {/* Header */}
      <div className="text-center mb-12 animate-fade-in max-w-2xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 mb-6">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse-soft" />
          <span className="text-sm text-success font-medium">Document Ready</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          What would you like to do?
        </h1>
        <p className="text-muted max-w-md mx-auto">
          Your notes from <span className="text-foreground font-medium">{filename}</span> have
          been processed and are ready for study.
        </p>
      </div>

      {/* Action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl w-full">
        {/* Quiz Card */}
        <Link
          href={`/quiz?doc=${docId}&filename=${encodeURIComponent(filename)}`}
          className="group"
          id="action-quiz"
        >
          <div className="glass-card p-8 h-full text-center group-hover:border-primary/30 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
              Generate Quiz
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              AI will create 5–10 multiple-choice questions from your notes to test your understanding.
            </p>
            <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              Start Quiz
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>

        {/* Chat Card */}
        <Link
          href={`/chat?doc=${docId}&filename=${encodeURIComponent(filename)}`}
          className="group"
          id="action-chat"
        >
          <div className="glass-card p-8 h-full text-center group-hover:border-accent/30 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">
              Ask Questions
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              Chat with your notes using AI. Get answers grounded directly in your lecture material.
            </p>
            <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
              Start Chat
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      {/* Tech badges */}
      <div className="mt-12 flex flex-wrap items-center justify-center gap-3 animate-slide-up" style={{ animationDelay: "200ms" }}>
        {["RAG", "Vector Search", "Gemini AI", "Embeddings"].map((tech) => (
          <span
            key={tech}
            className="px-3 py-1 rounded-full text-xs font-medium text-muted border border-border bg-surface"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <>
      <Suspense>
        <Navbar />
      </Suspense>
      <Suspense fallback={<div className="flex flex-1 items-center justify-center"><div className="loading-shimmer w-64 h-8 rounded-lg" /></div>}>
        <DashboardContent />
      </Suspense>
    </>
  );
}
