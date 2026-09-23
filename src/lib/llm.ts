import { GoogleGenerativeAI } from "@google/generative-ai";
import { QuizQuestion } from "./types";

const MODEL = "gemini-2.5-flash";

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable. Set it in .env.local");
  }
  return new GoogleGenerativeAI(apiKey);
}

// ─── Quiz Generation ───────────────────────────────────────────────────────────

const QUIZ_SYSTEM_PROMPT = `You are an expert educational quiz generator. Given excerpts from lecture notes, generate a quiz with multiple-choice questions that test understanding of the key concepts.

Rules:
- Generate between 5 and 10 questions
- Each question must have exactly 4 options
- Exactly one option must be correct
- Questions should cover different topics from the provided content
- Questions should test comprehension, not just memorization
- All questions and answers must be derived ONLY from the provided content

Respond with valid JSON in this exact format and nothing else:
{
  "questions": [
    {
      "question": "What is...?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_index": 0
    }
  ]
}

The correct_index is 0-based (0 for first option, 1 for second, etc).
Do NOT include any text outside the JSON. Do NOT wrap in markdown code blocks.`;

/**
 * Generate quiz questions from document chunks using Gemini
 * with structured JSON output.
 *
 * @param chunks - Representative text chunks from the document
 * @returns Array of quiz questions with options and correct answer index
 */
export async function generateQuiz(
  chunks: string[]
): Promise<QuizQuestion[]> {
  const genAI = getGenAI();

  const contentText = chunks
    .map((chunk, i) => `--- Section ${i + 1} ---\n${chunk}`)
    .join("\n\n");

  const userPrompt = `Here are excerpts from lecture notes. Generate a quiz based on this content:\n\n${contentText}`;

  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
      maxOutputTokens: 4000,
    },
  });

  // Try up to 2 times in case of JSON parsing failure
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await model.generateContent([
        { text: QUIZ_SYSTEM_PROMPT },
        { text: userPrompt },
      ]);

      const content = result.response.text();
      if (!content) {
        throw new Error("Empty response from LLM");
      }

      const parsed = JSON.parse(content);

      // Validate the structure
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error("Invalid quiz format: missing questions array");
      }

      const questions: QuizQuestion[] = parsed.questions.map(
        (q: Record<string, unknown>) => {
          if (
            !q.question ||
            !Array.isArray(q.options) ||
            q.options.length !== 4 ||
            typeof q.correct_index !== "number" ||
            q.correct_index < 0 ||
            q.correct_index > 3
          ) {
            throw new Error("Invalid question format");
          }
          return {
            question: q.question as string,
            options: q.options as [string, string, string, string],
            correct_index: q.correct_index as number,
          };
        }
      );

      return questions;
    } catch (error) {
      if (attempt === 1) {
        throw new Error(
          `Failed to generate quiz after 2 attempts: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
      // Retry on first attempt
      console.warn(`Quiz generation attempt ${attempt + 1} failed, retrying...`);
    }
  }

  // Should never reach here, but TypeScript needs it
  throw new Error("Failed to generate quiz");
}

// ─── RAG Answer Generation ─────────────────────────────────────────────────────

const RAG_SYSTEM_PROMPT = `You are a helpful study assistant. Answer the student's question using ONLY the provided context from their lecture notes.

Rules:
- Answer ONLY based on the provided context
- If the answer cannot be found in the context, say: "I couldn't find information about that in your notes. Try uploading notes that cover this topic, or rephrase your question."
- Be concise but thorough
- Use clear, student-friendly language
- If relevant, reference which part of the notes the answer comes from
- Do NOT make up information or use knowledge outside the provided context`;

/**
 * Generate a RAG-grounded answer to a user question using retrieved
 * document chunks as context.
 *
 * @param question - The user's question
 * @param chunks  - Retrieved relevant chunks from vector search
 * @returns The LLM-generated answer grounded in the provided context
 */
export async function generateAnswer(
  question: string,
  chunks: string[]
): Promise<string> {
  const genAI = getGenAI();

  const contextText = chunks
    .map((chunk, i) => `[Excerpt ${i + 1}]:\n${chunk}`)
    .join("\n\n");

  const userPrompt = `Context from lecture notes:\n\n${contextText}\n\n---\n\nStudent's question: ${question}`;

  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1500,
    },
  });

  const result = await model.generateContent([
    { text: RAG_SYSTEM_PROMPT },
    { text: userPrompt },
  ]);

  const answer = result.response.text();
  if (!answer) {
    throw new Error("Empty response from LLM");
  }

  return answer;
}
