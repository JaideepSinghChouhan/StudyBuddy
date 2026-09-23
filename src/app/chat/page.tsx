"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import ChatMessageComponent, { TypingIndicator } from "@/components/ChatMessage";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ChatMessage } from "@/lib/types";

function ChatContent() {
  const searchParams = useSearchParams();
  const docId = searchParams.get("doc");
  const filename = searchParams.get("filename") || "Unknown document";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !docId || isLoading) return;

    const question = input.trim();
    setInput("");
    setError(null);

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: question,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_id: docId, question }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get answer");
      }

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col flex-1 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <h1 className="text-lg font-bold tracking-tight">
          <span className="gradient-text">Ask Your Notes</span>
        </h1>
        <p className="text-xs text-muted mt-0.5">
          Answers are grounded in <span className="text-foreground">{filename}</span> using RAG
        </p>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {/* Welcome message if no messages */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-5">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2">Start a conversation</h2>
            <p className="text-sm text-muted text-center max-w-sm mb-6">
              Ask any question about your notes and I&apos;ll find the answer using semantic search.
            </p>

            {/* Suggestion chips */}
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {[
                "Summarize the key concepts",
                "What are the main topics covered?",
                "Explain the most important point",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                    inputRef.current?.focus();
                  }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium text-muted border border-border bg-surface hover:bg-surface-hover hover:text-foreground transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message list */}
        {messages.map((message) => (
          <ChatMessageComponent key={message.id} message={message} />
        ))}

        {/* Typing indicator */}
        {isLoading && <TypingIndicator />}

        {/* Error */}
        {error && (
          <div className="flex justify-center animate-slide-down">
            <div className="glass-card px-4 py-3 border-error/20 max-w-md">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-error flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-error">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="px-6 py-4 border-t border-border bg-background/80 backdrop-blur-lg">
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your notes..."
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-sm text-foreground placeholder-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all disabled:opacity-50"
              id="chat-input"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="btn-primary px-4 py-3 rounded-xl flex items-center justify-center disabled:opacity-30"
            id="chat-send-btn"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-muted/50 mt-2 text-center">
          Answers are generated from your uploaded notes only — not from general knowledge.
        </p>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <>
      <Suspense>
        <Navbar />
      </Suspense>
      <Suspense fallback={<div className="flex flex-1 items-center justify-center"><LoadingSpinner text="Loading chat..." /></div>}>
        <ChatContent />
      </Suspense>
    </>
  );
}
