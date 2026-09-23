import { GoogleGenerativeAI } from "@google/generative-ai";

const EMBEDDING_MODEL = "gemini-embedding-001";
const BATCH_SIZE = 5;
const DELAY_BETWEEN_BATCHES_MS = 1000;

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable. Set it in .env.local");
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Embed single text chunk with automatic exponential backoff retry on 429 rate limit errors
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function embedWithRetry(model: any, text: string, retries = 3, delayMs = 3000): Promise<number[]> {
  try {
    const result = await model.embedContent({
      content: { role: "user", parts: [{ text }] },
      outputDimensionality: 768,
    } as any);
    return result.embedding.values;
  } catch (error: any) {
    const isRateLimit = error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED");
    if (isRateLimit && retries > 0) {
      console.warn(`[Gemini Embeddings] Rate limit (429) hit. Retrying in ${delayMs}ms... (${retries} left)`);
      await new Promise((res) => setTimeout(res, delayMs));
      return embedWithRetry(model, text, retries - 1, delayMs * 2);
    }
    throw error;
  }
}

/**
 * Generate embeddings for an array of text strings using Google Gemini's
 * gemini-embedding-001 model. Processes in batches with delays to stay within API limits.
 *
 * @param texts - Array of text strings to embed
 * @returns Array of 768-dimensional embedding vectors
 */
export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);

    const batchEmbeddings = await Promise.all(
      batch.map((text) => embedWithRetry(model, text))
    );
    allEmbeddings.push(...batchEmbeddings);

    // Pause between batches if more chunks remain to respect token rate limits
    if (i + BATCH_SIZE < texts.length) {
      await new Promise((res) => setTimeout(res, DELAY_BETWEEN_BATCHES_MS));
    }
  }

  return allEmbeddings;
}

/**
 * Generate a single embedding for a query string.
 * Used for the chat/Q&A similarity search.
 */
export async function generateQueryEmbedding(
  query: string
): Promise<number[]> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
  const result = await model.embedContent({
    content: { role: "user", parts: [{ text: query }] },
    outputDimensionality: 768,
  } as any);
  return result.embedding.values;
}
