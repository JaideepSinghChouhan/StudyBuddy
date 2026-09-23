"use client";

import { QuizQuestion } from "@/lib/types";

interface QuizCardProps {
  question: QuizQuestion;
  questionIndex: number;
  selectedAnswer: number | null;
  onSelectAnswer: (index: number) => void;
  isSubmitted: boolean;
}

export default function QuizCard({
  question,
  questionIndex,
  selectedAnswer,
  onSelectAnswer,
  isSubmitted,
}: QuizCardProps) {
  const isCorrect = selectedAnswer === question.correct_index;

  return (
    <div
      className="glass-card p-6 animate-slide-up"
      style={{ animationDelay: `${questionIndex * 80}ms` }}
      id={`quiz-card-${questionIndex}`}
    >
      {/* Question header */}
      <div className="flex items-start gap-3 mb-5">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center text-primary font-bold text-sm">
          {questionIndex + 1}
        </div>
        <h3 className="text-base font-medium leading-relaxed pt-1">
          {question.question}
        </h3>
      </div>

      {/* Options */}
      <div className="space-y-2.5 ml-11">
        {question.options.map((option, optIndex) => {
          const isSelected = selectedAnswer === optIndex;
          const isCorrectOption = optIndex === question.correct_index;

          let stateClass = "";
          if (isSubmitted) {
            if (isCorrectOption) stateClass = "correct";
            else if (isSelected && !isCorrectOption) stateClass = "incorrect";
          } else if (isSelected) {
            stateClass = "selected";
          }

          return (
            <button
              key={optIndex}
              onClick={() => !isSubmitted && onSelectAnswer(optIndex)}
              disabled={isSubmitted}
              className={`quiz-option w-full text-left px-4 py-3 rounded-xl border border-border flex items-center gap-3 ${stateClass}`}
              id={`quiz-option-${questionIndex}-${optIndex}`}
            >
              {/* Radio indicator */}
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isSubmitted
                    ? isCorrectOption
                      ? "border-success bg-success"
                      : isSelected
                      ? "border-error bg-error"
                      : "border-border"
                    : isSelected
                    ? "border-primary bg-primary"
                    : "border-border"
                }`}
              >
                {((isSubmitted && isCorrectOption) || (!isSubmitted && isSelected)) && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
                {isSubmitted && isSelected && !isCorrectOption && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>

              {/* Option label */}
              <span className="text-sm leading-relaxed">
                <span className="text-muted mr-2 font-medium">
                  {String.fromCharCode(65 + optIndex)}.
                </span>
                {option}
              </span>
            </button>
          );
        })}
      </div>

      {/* Result indicator */}
      {isSubmitted && (
        <div
          className={`mt-4 ml-11 flex items-center gap-2 text-sm font-medium animate-fade-in ${
            isCorrect ? "text-success" : "text-error"
          }`}
        >
          {isCorrect ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Correct!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Incorrect — the correct answer is {String.fromCharCode(65 + question.correct_index)}.{" "}
              {question.options[question.correct_index]}
            </>
          )}
        </div>
      )}
    </div>
  );
}
