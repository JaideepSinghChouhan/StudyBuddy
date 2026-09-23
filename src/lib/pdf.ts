import { PDFParse } from "pdf-parse";

/**
 * Extract raw text from a PDF buffer.
 * Uses pdf-parse for text-based PDFs.
 * Throws if the PDF is empty or cannot be parsed.
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const parser = new PDFParse({ data: buffer });
    const textResult = await parser.getText();
    const text = textResult.text?.trim();

    if (!text || text.length === 0) {
      throw new Error(
        "The PDF appears to be empty or contains only images/scans. Please upload a text-based PDF."
      );
    }

    await parser.destroy();
    return text;
  } catch (error) {
    if (error instanceof Error && error.message.includes("empty")) {
      throw error;
    }
    throw new Error(
      `Failed to parse PDF: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
