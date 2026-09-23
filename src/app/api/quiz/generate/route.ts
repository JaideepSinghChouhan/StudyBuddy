import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateQuiz } from "@/lib/llm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { document_id } = body;

    if (!document_id) {
      return NextResponse.json(
        { error: "Missing document_id" },
        { status: 400 }
      );
    }

    // ── Verify document exists ─────────────────────────────────────────────
    const { data: doc, error: docError } = await supabase
      .from("documents")
      .select("id, filename")
      .eq("id", document_id)
      .single();

    if (docError || !doc) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // ── Fetch representative chunks ────────────────────────────────────────
    // Get total chunk count, then select ~10 evenly spaced chunks
    const { data: allChunks, error: chunksError } = await supabase
      .from("chunks")
      .select("content, chunk_index")
      .eq("document_id", document_id)
      .order("chunk_index", { ascending: true });

    if (chunksError || !allChunks || allChunks.length === 0) {
      return NextResponse.json(
        { error: "No content found for this document" },
        { status: 404 }
      );
    }

    // Select ~10 evenly spaced chunks to cover the full document
    const targetCount = Math.min(10, allChunks.length);
    const step = allChunks.length / targetCount;
    const selectedChunks: string[] = [];

    for (let i = 0; i < targetCount; i++) {
      const index = Math.floor(i * step);
      selectedChunks.push(allChunks[index].content);
    }

    // ── Generate quiz ──────────────────────────────────────────────────────
    const questions = await generateQuiz(selectedChunks);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Quiz generation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate quiz. Please try again.",
      },
      { status: 500 }
    );
  }
}
