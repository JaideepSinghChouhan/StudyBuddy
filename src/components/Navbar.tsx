"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filename = searchParams.get("filename");
  const docId = searchParams.get("doc");

  const isHome = pathname === "/";

  return (
    <nav className="w-full border-b border-border sticky top-0 z-50 backdrop-blur-xl bg-background/60">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          id="nav-logo"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm transition-transform group-hover:scale-110">
            S
          </div>
          <span className="font-bold text-lg tracking-tight">
            Study<span className="gradient-text">Buddy</span>
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Active document indicator */}
          {filename && !isHome && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border text-sm animate-fade-in">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse-soft" />
              <span className="text-muted max-w-[200px] truncate">
                {filename}
              </span>
            </div>
          )}

          {/* Navigation links */}
          {docId && !isHome && (
            <div className="flex items-center gap-1">
              <Link
                href={`/dashboard?doc=${docId}&filename=${encodeURIComponent(filename || "")}`}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  pathname === "/dashboard"
                    ? "bg-surface text-foreground"
                    : "text-muted hover:text-foreground hover:bg-surface"
                }`}
                id="nav-dashboard"
              >
                Dashboard
              </Link>
              <Link
                href={`/quiz?doc=${docId}&filename=${encodeURIComponent(filename || "")}`}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  pathname === "/quiz"
                    ? "bg-surface text-foreground"
                    : "text-muted hover:text-foreground hover:bg-surface"
                }`}
                id="nav-quiz"
              >
                Quiz
              </Link>
              <Link
                href={`/chat?doc=${docId}&filename=${encodeURIComponent(filename || "")}`}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  pathname === "/chat"
                    ? "bg-surface text-foreground"
                    : "text-muted hover:text-foreground hover:bg-surface"
                }`}
                id="nav-chat"
              >
                Chat
              </Link>
            </div>
          )}

          {/* Upload new button (when not on home) */}
          {!isHome && (
            <Link
              href="/"
              className="btn-secondary text-xs px-3 py-1.5"
              id="nav-upload-new"
            >
              + New
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
