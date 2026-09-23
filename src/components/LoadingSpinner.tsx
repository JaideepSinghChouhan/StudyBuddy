"use client";

export default function LoadingSpinner({
  size = "md",
  text,
}: {
  size?: "sm" | "md" | "lg";
  text?: string;
}) {
  const sizeClasses = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-[3px]",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${sizeClasses[size]} rounded-full border-surface border-t-primary animate-spin`}
        style={{ animationDuration: "0.8s" }}
      />
      {text && (
        <p className="text-muted text-sm animate-pulse-soft">{text}</p>
      )}
    </div>
  );
}
