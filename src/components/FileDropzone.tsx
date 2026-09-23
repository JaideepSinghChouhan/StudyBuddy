"use client";

import { useCallback, useState, useRef } from "react";

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  accept?: string;
  maxSizeMB?: number;
}

export default function FileDropzone({
  onFileSelect,
  isUploading,
  accept = ".pdf",
  maxSizeMB = 20,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        return "Please select a PDF file.";
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        return `File too large. Maximum size is ${maxSizeMB} MB.`;
      }
      return null;
    },
    [maxSizeMB]
  );

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setSelectedFile(null);
        return;
      }
      setError(null);
      setSelectedFile(file);
      onFileSelect(file);
    },
    [validateFile, onFileSelect]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!isUploading) setIsDragging(true);
    },
    [isUploading]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (isUploading) return;

      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [isUploading, handleFile]
  );

  const handleClick = useCallback(() => {
    if (!isUploading) fileInputRef.current?.click();
  }, [isUploading]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="w-full max-w-lg mx-auto">
      <div
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-300 ease-out
          ${
            isDragging
              ? "dropzone-active border-accent bg-accent/5 scale-[1.02]"
              : "border-border hover:border-muted hover:bg-surface"
          }
          ${isUploading ? "opacity-60 pointer-events-none" : ""}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        id="file-dropzone"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          id="file-input"
        />

        {/* Upload Icon */}
        <div className="mb-5 flex justify-center">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              isDragging
                ? "bg-accent/20 text-accent scale-110"
                : "bg-surface text-muted"
            }`}
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
        </div>

        {/* Text */}
        <h3 className="text-lg font-semibold mb-2 text-foreground">
          {isDragging ? "Drop your PDF here" : "Upload your lecture notes"}
        </h3>
        <p className="text-sm text-muted mb-1">
          Drag & drop a PDF file here, or click to browse
        </p>
        <p className="text-xs text-muted/60">
          PDF only • Max {maxSizeMB} MB
        </p>

        {/* Selected file indicator */}
        {selectedFile && !error && (
          <div className="mt-5 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 animate-fade-in">
            <svg
              className="w-4 h-4 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="text-sm text-primary font-medium truncate max-w-[250px]">
              {selectedFile.name}
            </span>
            <span className="text-xs text-muted">
              ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)
            </span>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-error/10 border border-error/20 animate-slide-down">
          <svg
            className="w-4 h-4 text-error flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm text-error">{error}</span>
        </div>
      )}
    </div>
  );
}
