"use client";

import { ChatMessage as ChatMessageType } from "@/lib/types";

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex animate-slide-up ${isUser ? "justify-end" : "justify-start"}`}
      id={`chat-message-${message.id}`}
    >
      <div
        className={`max-w-[80%] ${
          isUser
            ? "order-2"
            : "order-1"
        }`}
      >
        {/* Avatar + Label */}
        <div
          className={`flex items-center gap-2 mb-1.5 ${
            isUser ? "justify-end" : "justify-start"
          }`}
        >
          {!isUser && (
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
          )}
          <span className="text-xs text-muted font-medium">
            {isUser ? "You" : "StudyBuddy"}
          </span>
          {!isUser && (
            <span className="text-xs text-muted/50">
              • Based on your notes
            </span>
          )}
        </div>

        {/* Message bubble */}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "bg-primary text-white rounded-br-md"
              : "glass-card rounded-bl-md hover:transform-none"
          }`}
          style={!isUser ? { transform: "none" } : undefined}
        >
          {/* Render message with basic markdown-like formatting */}
          <div className="whitespace-pre-wrap">
            {message.content}
          </div>
        </div>
      </div>
    </div>
  );
}

// Typing indicator component
export function TypingIndicator() {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="max-w-[80%]">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <span className="text-xs text-muted font-medium">StudyBuddy</span>
          <span className="text-xs text-accent">is thinking...</span>
        </div>
        <div className="glass-card px-5 py-4 rounded-2xl rounded-bl-md hover:transform-none" style={{ transform: "none" }}>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
