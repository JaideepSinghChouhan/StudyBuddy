import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateQueryEmbedding } from "@/lib/embeddings";
import { generateAnswer } from "@/lib/llm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { document_id, question } = body;

    if (!document_id || !question) {
      return NextResponse.json(
        { error: "Missing document_id or question" },
        { status: 400 }
      );
    }

    if (question.trim().length === 0) {
      return NextResponse.json(
        { error: "Question cannot be empty" },
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

    // ── Embed the query ────────────────────────────────────────────────────
    const queryEmbedding = await generateQueryEmbedding(question);

    // ── Retrieve similar chunks via RPC ─────────────────────────────────────
    const { data: matches, error: matchError } = await supabase.rpc(
      "match_chunks",
      {
        query_embedding: JSON.stringify(queryEmbedding),
        match_document_id: document_id,
        match_count: 5,
      }
    );

    if (matchError) {
      console.error("Vector search error:", matchError);
      return NextResponse.json(
        { error: "Failed to search document. Please try again." },
        { status: 500 }
      );
    }

    if (!matches || matches.length === 0) {
      return NextResponse.json({
        answer:
          "I couldn't find any relevant information in your notes for this question. Try rephrasing your question.",
        used_chunks: [],
      });
    }

    // ── Generate grounded answer ───────────────────────────────────────────
    const chunkTexts = matches.map(
      (m: { content: string }) => m.content
    );
    const answer = await generateAnswer(question, chunkTexts);

    return NextResponse.json({
      answer,
      used_chunks: chunkTexts,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate answer. Please try again.",
      },
      { status: 500 }
    );
  }
}
