# 📚 StudyBuddy — AI-Powered Study Assistant

> **Turn your lecture notes into interactive quizzes and context-grounded AI chat in seconds.**

StudyBuddy is a modern, full-stack web application designed for students to upload lecture notes (PDFs) and instantly get an **AI-generated Quiz (MCQs)** and an **Interactive Chat interface** powered by **Retrieval-Augmented Generation (RAG)**.

---

## ✨ Features

- 📄 **Smart PDF Parsing & Chunking**: Extracts text from PDFs and splits content into overlapping semantic chunks for optimal AI processing.
- ⚡ **Vector Search with Supabase pgvector**: Uses `gemini-embedding-001` to generate 768-dimensional vector embeddings stored in a Supabase PostgreSQL database indexed with HNSW cosine similarity.
- 🎯 **Auto-Generated AI Quizzes**: Creates multiple-choice questions (MCQs) directly from lecture content with real-time scoring and detailed answer explanations.
- 💬 **Grounded RAG Q&A Chat**: Ask natural language questions about your notes with responses strictly grounded in your uploaded PDF content.
- 🛡️ **Built-in API Throttling & Retries**: Includes batch throttling and automatic exponential backoff retries to handle rate limits gracefully.

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router, Server Actions, API Routes) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + Lucide Icons |
| **AI LLM Engine** | Google Gemini 2.5 Flash (`gemini-2.5-flash`) |
| **Embeddings** | Google Gemini Embeddings (`gemini-embedding-001`) |
| **Database** | Supabase (PostgreSQL with `pgvector` extension) |
| **PDF Parser** | `pdf-parse` |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **Supabase Account**: [Create a free Supabase project](https://supabase.com)
- **Google Gemini API Key**: [Get an API key from Google AI Studio](https://aistudio.google.com/)

---

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/JaideepSinghChouhan/StudyBuddy.git
   cd StudyBuddy
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Supabase Database**:
   - Go to your Supabase Project Dashboard $\rightarrow$ **SQL Editor**.
   - Copy the contents of [`supabase-migration.sql`](./supabase-migration.sql) and run the script. This enables `pgvector`, creates the `documents` and `chunks` tables, and configures the HNSW similarity search function.

4. **Set up Environment Variables**:
   Create a `.env.local` file in the project root:
   ```env
   # Supabase
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

   # Google Gemini
   GEMINI_API_KEY=your-gemini-api-key
   ```

5. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deployment Guide (Vercel)

1. **Push your repository to GitHub**:
   ```bash
   git add .
   git commit -m "Update README and final setup"
   git push origin main
   ```
   *(Note: If pushing to a newly created GitHub repo with an existing README, use `git pull origin main --rebase` first).*

2. **Deploy to Vercel**:
   - Log in to [Vercel](https://vercel.com).
   - Click **Add New** $\rightarrow$ **Project**.
   - Select your `StudyBuddy` repository from GitHub.
   - Expand **Environment Variables** and add:
     - `SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `GEMINI_API_KEY`
   - Click **Deploy**.

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
