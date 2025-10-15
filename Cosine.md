# RAG Chatbot with Precomputed Embeddings

This project demonstrates how to build a **Retrieval-Augmented Generation (RAG)** chatbot using:

- A JSON file containing Q&A data (`tempQA.json`).
- Precomputed embeddings (`qa_with_vectors.json`) for efficient semantic search.
- Cosine similarity to find the most relevant answers.
- An external LLM (e.g., Ollama, GPT) to generate final responses using the retrieved context.

---

## 🚀 Workflow

### 1. Prepare Q&A Data
You start with a dataset (`tempQA.json`) like this:

```json
[
  { "question": "What is M220 error?", "answer": "Check the datamatrix symbology settings." },
  { "question": "How to restart M230?", "answer": "Send the restart command via API or CLI." }
]
```

### 2. Precompute Embeddings
- Each question is converted into a **vector** using an embedding model (e.g., `paraphrase-multilingual-MiniLM-L12-v2`).
- These vectors are stored in `qa_with_vectors.json`:

```json
{
  "question": "What is M220 error?",
  "answer": "Check the datamatrix symbology settings.",
  "vector": [0.12, -0.05, 0.88, ...]
}
```

This preprocessing step is done **offline** (Python or Node.js script).

### 3. Runtime Query
When a user asks a new question:

1. The query is embedded into a vector.
2. The cosine similarity between the query vector and all cached vectors is computed.
3. The top-k most relevant Q&A items are returned as **context**.
4. The context is appended to the user query and passed to the LLM (Ollama or GPT) to generate the final response.

---

## 🔢 Cosine Similarity

Cosine similarity measures how similar two vectors are by comparing their angle:

\[
\text{cosine}(A, B) = \frac{A \cdot B}{||A|| \times ||B||}
\]

- 1 → vectors are identical (very similar meaning)  
- 0 → vectors are orthogonal (unrelated)  
- -1 → vectors are opposite (contradictory meaning)  

---

## ⚙️ Setup

### Backend (Node.js + Express)
- Precompute embeddings with `@xenova/transformers` or Python `sentence-transformers`.
- Expose endpoints:
  - `POST /prepare` → compute and cache embeddings from `tempQA.json`.
  - `GET /context?q=...&k=3` → return top-k most relevant Q&A pairs.

### Frontend (React / Vite)
- On submit:
  1. Call `/context` to fetch relevant Q&A.
  2. Merge retrieved context into the user prompt.
  3. Call Ollama (`/api/chat`) or OpenAI (`/v1/chat/completions`) to generate the final answer.

---

## ✅ Example Prompt for LLM

```text
Context:
Q: What is M220 error?
A: Check the datamatrix symbology settings.

User: My M220 scanner cannot read datamatrix codes.
```

**System instruction:**
```
You must answer only using the provided context. 
If no relevant context exists, reply "I don’t know."
```

---

## 📦 Advantages of Precomputed Embeddings
- Faster runtime (only the user query is embedded).
- Consistent results (no need to embed entire dataset each request).
- Works offline with Ollama or fully local embedding models.
- Reduces cost if using paid embedding APIs (e.g., OpenAI).

---

## 🔮 Next Steps
- Improve retrieval with FAISS or other vector databases.
- Add multilingual support for both questions and answers.
- Extend context to support larger JSON datasets.

---

## 📝 License
This project is for learning and internal testing purposes.
