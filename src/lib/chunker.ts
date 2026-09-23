/**
 * Split text into overlapping chunks using a word-count heuristic.
 *
 * @param text      - The full document text
 * @param chunkSize - Target words per chunk (default 500)
 * @param overlap   - Number of overlapping words between chunks (default 50)
 * @returns Array of text chunks
 */
export function chunkText(
  text: string,
  chunkSize: number = 500,
  overlap: number = 50
): string[] {
  // Normalize whitespace and split into words
  const words = text.split(/\s+/).filter((w) => w.length > 0);

  if (words.length === 0) {
    return [];
  }

  // If the text is shorter than a single chunk, return it as-is
  if (words.length <= chunkSize) {
    return [words.join(" ")];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + chunkSize, words.length);
    const chunk = words.slice(start, end).join(" ");
    chunks.push(chunk);

    // Move the window forward by (chunkSize - overlap)
    // so the next chunk overlaps with the end of the current one
    start += chunkSize - overlap;

    // If the remaining words would form a tiny chunk, merge with previous
    if (start < words.length && words.length - start < overlap) {
      break;
    }
  }

  return chunks;
}
