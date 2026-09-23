// Shared TypeScript types for StudyBuddy

// ─── Document ──────────────────────────────────────────────────────────────────
export interface Document {
  id: string;
  filename: string;
  created_at: string;
}

// ─── Chunk ─────────────────────────────────────────────────────────────────────
export interface Chunk {
  id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  embedding?: number[];
  created_at: string;
}

// ─── Quiz ──────────────────────────────────────────────────────────────────────
export interface QuizQuestion {
  question: string;
  options: [string, string, string, string];
  correct_index: number;
}

export interface QuizResponse {
  questions: QuizQuestion[];
}

// ─── Chat ──────────────────────────────────────────────────────────────────────
export interface ChatRequest {
  document_id: string;
  question: string;
}

export interface ChatResponse {
  answer: string;
  used_chunks?: string[];
}

// ─── Upload ────────────────────────────────────────────────────────────────────
export interface UploadResponse {
  document_id: string;
  filename: string;
}

// ─── Chat UI ───────────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ─── API Error ─────────────────────────────────────────────────────────────────
export interface ApiError {
  error: string;
  details?: string;
}
