-- StudyBuddy: Supabase Migration Script
-- Run this in the Supabase SQL Editor to set up the database

-- Enable the pgvector extension for embedding storage and similarity search
create extension if not exists vector;

-- Table to track uploaded documents
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  created_at timestamp with time zone default now()
);

-- Table to store document chunks with their embeddings
-- Uses 768 dimensions to match Google Gemini text-embedding-004
create table if not exists chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  chunk_index int not null,
  content text not null,
  embedding vector(768),
  created_at timestamp with time zone default now()
);

-- Index for faster vector similarity search
create index if not exists chunks_embedding_idx
  on chunks using hnsw (embedding vector_cosine_ops);

-- Index for filtering chunks by document
create index if not exists chunks_document_id_idx
  on chunks (document_id);

-- RPC function for cosine similarity search within a specific document
create or replace function match_chunks (
  query_embedding vector(768),
  match_document_id uuid,
  match_count int default 5
)
returns table (id uuid, content text, similarity float)
language sql stable
as $$
  select
    chunks.id,
    chunks.content,
    1 - (chunks.embedding <=> query_embedding) as similarity
  from chunks
  where chunks.document_id = match_document_id
  order by chunks.embedding <=> query_embedding
  limit match_count;
$$;
