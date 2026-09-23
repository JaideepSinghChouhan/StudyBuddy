"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FileDropzone from "@/components/FileDropzone";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function UploadPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setUploadProgress("Uploading PDF...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      setUploadProgress("Extracting text & generating embeddings...");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setUploadProgress("Done! Redirecting...");

      // Redirect to dashboard with document info
      router.push(
        `/dashboard?doc=${data.document_id}&filename=${encodeURIComponent(data.filename)}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
      setIsUploading(false);
      setUploadProgress("");
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-6 py-16">
      {/* Hero */}
      <div className="text-center mb-12 animate-fade-in max-w-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-2xl animate-float shadow-lg shadow-primary/20">
            S
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Your AI{" "}
          <span className="gradient-text">Study Assistant</span>
        </h1>
        <p className="text-lg text-muted max-w-lg mx-auto leading-relaxed">
          Upload your lecture notes and let AI generate quizzes and answer your
          questions — all grounded in your actual study material.
        </p>
      </div>

      {/* Upload area */}
      {!isUploading ? (
        <div className="w-full max-w-lg animate-slide-up" style={{ animationDelay: "150ms" }}>
          <FileDropzone onFileSelect={handleFileSelect} isUploading={isUploading} />
        </div>
      ) : (
        <div className="w-full max-w-lg animate-fade-in">
          {/* Processing state */}
          <div className="glass-card p-10 text-center">
            <LoadingSpinner size="lg" />
            <h3 className="text-lg font-semibold mt-6 mb-2">
              Processing your notes
            </h3>
            <p className="text-sm text-muted mb-4">{uploadProgress}</p>

            {/* Progress steps */}
            <div className="flex flex-col items-start gap-3 mt-6 text-sm text-left max-w-xs mx-auto">
              <ProgressStep label="Extracting text from PDF" done />
              <ProgressStep
                label="Splitting into smart chunks"
                done={uploadProgress.includes("embeddings") || uploadProgress.includes("Done")}
              />
              <ProgressStep
                label="Generating AI embeddings"
                done={uploadProgress.includes("Done")}
              />
              <ProgressStep label="Storing in vector database" done={uploadProgress.includes("Done")} />
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 max-w-lg w-full glass-card p-4 border-error/30 animate-slide-down">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-error/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-error">Upload Failed</p>
              <p className="text-xs text-muted mt-0.5">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Features preview */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full animate-slide-up" style={{ animationDelay: "300ms" }}>
        <FeatureCard
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          title="Upload Notes"
          description="Drop your PDF lecture notes and we handle the rest"
        />
        <FeatureCard
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          title="AI Quiz"
          description="Auto-generated MCQs to test your understanding"
        />
        <FeatureCard
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          }
          title="Ask Questions"
          description="Chat with your notes using RAG-powered AI"
        />
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function ProgressStep({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {done ? (
        <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center animate-bounce-in">
          <svg className="w-3 h-3 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      ) : (
        <div className="w-5 h-5 rounded-full border-2 border-muted/30 border-t-accent animate-spin" style={{ animationDuration: "1s" }} />
      )}
      <span className={done ? "text-foreground" : "text-muted"}>{label}</span>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="glass-card p-5 text-center hover:cursor-default">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-3">
        {icon}
      </div>
      <h3 className="text-sm font-semibold mb-1">{title}</h3>
      <p className="text-xs text-muted leading-relaxed">{description}</p>
    </div>
  );
}
