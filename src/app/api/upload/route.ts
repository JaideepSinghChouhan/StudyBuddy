import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { extractTextFromPDF } from "@/lib/pdf";
import { chunkText } from "@/lib/chunker";
import { generateEmbeddings } from "@/lib/embeddings";

export const maxDuration = 60; // Allow up to 60s for processing

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    // ── Validate file ──────────────────────────────────────────────────────
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a PDF file." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 20 MB." },
        { status: 400 }
      );
    }

    // ── Extract text ───────────────────────────────────────────────────────
    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractTextFromPDF(buffer);

    // ── Chunk text ─────────────────────────────────────────────────────────
    const chunks = chunkText(text, 500, 50);

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: "Could not extract any text from the PDF." },
        { status: 400 }
      );
    }

    // ── Generate embeddings ────────────────────────────────────────────────
    const embeddings = await generateEmbeddings(chunks);

    // ── Store document ─────────────────────────────────────────────────────
    const { data: doc, error: docError } = await supabase
      .from("documents")
      .insert({ filename: file.name })
      .select("id")
      .single();

    if (docError || !doc) {
      console.error("Document insert error:", docError);
      return NextResponse.json(
        { error: "Failed to save document to database." },
        { status: 500 }
      );
    }

    // ── Store chunks with embeddings ───────────────────────────────────────
    const chunkRows = chunks.map((content, index) => ({
      document_id: doc.id,
      chunk_index: index,
      content,
      embedding: JSON.stringify(embeddings[index]),
    }));

    // Insert in batches of 50 to avoid payload limits
    const BATCH_SIZE = 50;
    for (let i = 0; i < chunkRows.length; i += BATCH_SIZE) {
      const batch = chunkRows.slice(i, i + BATCH_SIZE);
      const { error: chunkError } = await supabase
        .from("chunks")
        .insert(batch);

      if (chunkError) {
        console.error("Chunk insert error:", chunkError);
        // Clean up the document on failure
        await supabase.from("documents").delete().eq("id", doc.id);
        return NextResponse.json(
          { error: "Failed to save document chunks to database." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      document_id: doc.id,
      filename: file.name,
      chunks_count: chunks.length,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred during upload.",
      },
      { status: 500 }
    );
  }
}
