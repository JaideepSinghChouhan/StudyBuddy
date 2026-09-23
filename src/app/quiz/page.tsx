"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import QuizCard from "@/components/QuizCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { QuizQuestion } from "@/lib/types";

function QuizContent() {
  const searchParams = useSearchParams();
  const docId = searchParams.get("doc");
  const filename = searchParams.get("filename") || "Unknown document";

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const score = isSubmitted
    ? questions.reduce(
        (acc, q, i) => acc + (answers[i] === q.correct_index ? 1 : 0),
        0
      )
    : 0;

  const allAnswered = questions.length > 0 && Object.keys(answers).length === questions.length;

  const handleGenerateQuiz = async () => {
    if (!docId) return;

    setIsGenerating(true);
    setError(null);
    setQuestions([]);
    setAnswers({});
    setIsSubmitted(false);

    try {
      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_id: docId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate quiz");
      }

      setQuestions(data.questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectAnswer = (questionIndex: number, optionIndex: number) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleSubmit = () => {
    if (!allAnswered) return;
    setIsSubmitted(true);
  };

  const handleRetry = () => {
    setQuestions([]);
    setAnswers({});
    setIsSubmitted(false);
    setError(null);
  };

  return (
    <div className="flex flex-col flex-1 max-w-3xl mx-auto w-full px-6 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          <span className="gradient-text">Quiz Mode</span>
        </h1>
        <p className="text-muted text-sm">
          Test your understanding of <span className="text-foreground font-medium">{filename}</span>
        </p>
      </div>

      {/* Generate button (if no quiz yet) */}
      {questions.length === 0 && !isGenerating && (
        <div className="flex flex-col items-center justify-center flex-1 animate-slide-up">
          <div className="glass-card p-10 text-center max-w-md w-full">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Ready to test yourself?</h2>
            <p className="text-sm text-muted mb-6">
              AI will generate 5–10 multiple-choice questions from your notes.
            </p>
            <button
              onClick={handleGenerateQuiz}
              className="btn-primary w-full"
              id="generate-quiz-btn"
            >
              Generate Quiz
            </button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isGenerating && (
        <div className="flex flex-col items-center justify-center flex-1 animate-fade-in">
          <div className="glass-card p-10 text-center max-w-md w-full">
            <LoadingSpinner size="lg" />
            <h3 className="text-lg font-semibold mt-6 mb-2">
              Crafting your quiz...
            </h3>
            <p className="text-sm text-muted">
              AI is analyzing your notes and creating questions. This may take 5–10 seconds.
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="glass-card p-6 border-error/20 mb-6 animate-slide-down">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-error/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-error">{error}</p>
            </div>
            <button onClick={handleGenerateQuiz} className="btn-secondary text-xs px-3 py-1.5">
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Quiz questions */}
      {questions.length > 0 && (
        <div className="space-y-5">
          {questions.map((question, index) => (
            <QuizCard
              key={index}
              question={question}
              questionIndex={index}
              selectedAnswer={answers[index] ?? null}
              onSelectAnswer={(optIndex) => handleSelectAnswer(index, optIndex)}
              isSubmitted={isSubmitted}
            />
          ))}

          {/* Score card */}
          {isSubmitted && (
            <div className="glass-card p-8 text-center animate-bounce-in">
              <div
                className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold ${
                  score === questions.length
                    ? "bg-success/20 text-success"
                    : score >= questions.length * 0.7
                    ? "bg-primary/20 text-primary"
                    : "bg-error/20 text-error"
                }`}
              >
                {score}/{questions.length}
              </div>
              <h2 className="text-xl font-bold mb-1">
                {score === questions.length
                  ? "Perfect Score! 🎉"
                  : score >= questions.length * 0.7
                  ? "Great Job! 👏"
                  : "Keep Studying! 📚"}
              </h2>
              <p className="text-sm text-muted mb-6">
                You got {score} out of {questions.length} questions correct.
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={handleRetry} className="btn-secondary">
                  Try Again
                </button>
                <button onClick={handleGenerateQuiz} className="btn-primary">
                  New Quiz
                </button>
              </div>
            </div>
          )}

          {/* Submit button */}
          {!isSubmitted && (
            <div className="flex justify-center pt-4 pb-8">
              <button
                onClick={handleSubmit}
                disabled={!allAnswered}
                className="btn-primary px-10"
                id="submit-quiz-btn"
              >
                {allAnswered
                  ? "Submit Answers"
                  : `Answer all questions (${Object.keys(answers).length}/${questions.length})`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function QuizPage() {
  return (
    <>
      <Suspense>
        <Navbar />
      </Suspense>
      <Suspense fallback={<div className="flex flex-1 items-center justify-center"><LoadingSpinner text="Loading quiz..." /></div>}>
        <QuizContent />
      </Suspense>
    </>
  );
}
