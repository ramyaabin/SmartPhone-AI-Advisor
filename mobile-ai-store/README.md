# 📱 Mobile AI Store

A production-quality, AI-powered e-commerce website that sells smartphones — built with **React + Express**, and featuring a **Retrieval-Augmented Generation (RAG) shopping assistant** that answers questions using *only* real product data, with citations, and zero hallucination.

> Portfolio project demonstrating full-stack engineering + applied AI (RAG, embeddings, vector search, LLM orchestration).

---

## ✨ Features

- 🏠 **Homepage** — hero banner, featured phones, brand filter, live search
- 📄 **Product Details** — full spec sheet per phone
- 🛒 **Shopping Cart** & ❤️ **Wishlist** (persisted in `localStorage`)
- 🌗 **Dark Mode**
- 📱 **Fully Responsive** (mobile-first Tailwind layout)
- 🤖 **AI Chat Assistant** — RAG-grounded, cites its sources, remembers conversation history
- 🔁 **Swappable retrieval backends** — OpenAI Embeddings + ChromaDB *or* HuggingFace Instructor Embeddings + FAISS (fully local, no API cost)

---

## 🧠 How the AI Assistant Works (RAG Pipeline)

```
 data/products.json
        │
        ▼
 1. Extract text per product  (productToText.js)
        │
        ▼
 2. Split into chunks          (chunkText — size/overlap configurable)
        │
        ▼
 3. Generate embeddings
      ├── OpenAI text-embedding-3-small   → ChromaDB
      └── HF Instructor-style (local ONNX) → FAISS
        │
        ▼
 4. User asks a question in the chat widget
        │
        ▼
 5. Embed the question → similarity search → top-K chunks retrieved
        │
        ▼
 6. Build a grounded prompt:
      SYSTEM: "answer ONLY from context, cite sources, never guess"
      + chat history (LangChain ConversationBufferMemory)
      + retrieved product chunks
      + user question
        │
        ▼
 7. GPT (gpt-4o-mini) generates the final answer
        │
        ▼
 8. Answer + source citations returned to the UI
```

**Where OpenAI is used — and where it isn't:**

| Step | Uses OpenAI? |
|---|---|
| Chunking product data | ❌ Local (pure JS) |
| Embeddings (default path) | ✅ `text-embedding-3-small` |
| Embeddings (alternative path) | ❌ Local ONNX model via `@xenova/transformers` (Instructor-style) |
| Vector similarity search | ❌ Local (Chroma / FAISS) |
| Conversation memory | ❌ Local (LangChain `ConversationBufferMemory`, in-process) |
| Final answer generation | ✅ `gpt-4o-mini` |

This keeps OpenAI usage limited to embeddings + final generation only, and keeps embedding dimensionality small (`text-embedding-3-small`, 1536-dim, chunk sizes ~350 tokens) to stay within the free/low-cost tier.

**Anti-hallucination guardrails:**
- Strict system prompt: *"Answer ONLY using the CONTEXT provided. If the answer isn't there, say so."*
- Every claim is required to carry a citation like `(Based on Apple iPhone 16 specifications.)`
- Retrieval always happens before generation — the model never answers from parametric memory alone.

---

## 🏗️ Architecture

```
┌─────────────┐      REST (Axios)      ┌──────────────┐
│   React SPA │ ──────────────────────▶│  Express API │
│  (Netlify)  │◀──────────────────────  │   (Render)   │
└─────────────┘                         └──────┬───────┘
                                                │
                              ┌─────────────────┼─────────────────┐
                              ▼                                   ▼
                     ┌─────────────────┐               ┌────────────────────┐
                     │ OpenAI API      │               │ Local ML (no cost) │
                     │ • Embeddings    │               │ • HF Instructor    │
                     │ • Chat (GPT)    │               │   (Xenova/ONNX)    │
                     └────────┬────────┘               │ • FAISS index      │
                              ▼                         └────────────────────┘
                       ┌─────────────┐
                       │  ChromaDB   │
                       └─────────────┘
```

---

## 🛠️ Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, React Router, Axios
**Backend:** Node.js, Express.js
**AI / RAG:** OpenAI GPT (`gpt-4o-mini`) & Embeddings (`text-embedding-3-small`), LangChain (`ConversationBufferMemory`), ChromaDB
**Alternative retrieval:** HuggingFace Instructor-style embeddings (via `@xenova/transformers`, ONNX runtime), FAISS (`faiss-node`)
**Deployment:** Frontend → Netlify · Backend → Render

---

## 📂 Folder Structure

```
mobile-ai-store/
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios clients (products, chat)
│   │   ├── components/     # Navbar, ProductCard, ChatWidget, etc.
│   │   ├── context/        # Cart, Wishlist, Theme (React Context)
│   │   ├── pages/          # Home, ProductDetails, Cart, Wishlist
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── routes/         # /api/products, /api/chat
│   │   ├── controllers/
│   │   ├── services/       # chromaService, faissService, ragService, memoryService
│   │   ├── middleware/     # error handling
│   │   └── utils/          # productToText / chunking
│   ├── scripts/
│   │   ├── ingestChroma.js # OpenAI embeddings → ChromaDB
│   │   └── ingestFaiss.js  # Local HF embeddings → FAISS
│   └── server.js
│
├── data/
│   └── products.json       # 25 phones × 5 brands, full specs
│
├── embeddings/
│   ├── chroma/              # persisted Chroma vector store
│   └── faiss/                # persisted FAISS index + metadata
│
└── README.md
```

---

## 📦 Product Catalog

5 brands × 5 models = **25 phones**, each with: name, brand, price, RAM, storage, display, processor, battery, camera, OS, color, and a short description.

| Brand | Models |
|---|---|
| Apple | iPhone 15, iPhone 15 Plus, iPhone 16, iPhone 16 Pro, iPhone 17 Pro |
| Samsung | Galaxy S24, Galaxy S24+, Galaxy S24 Ultra, Galaxy Z Fold 6, Galaxy Z Flip 6 |
| Google | Pixel 8, Pixel 8 Pro, Pixel 9, Pixel 9 Pro, Pixel Fold |
| OnePlus | OnePlus 12, OnePlus 12R, OnePlus 13, Nord 4, OnePlus Open |
| Xiaomi | Xiaomi 14, Xiaomi 14 Ultra, Redmi Note 14, Poco X7, Poco F7 |

---

## 🚀 Installation

### Prerequisites
- Node.js 18+
- An OpenAI API key (for the default retrieval path)

### 1. Clone & install

```bash
git clone https://github.com/<your-username>/mobile-ai-store.git
cd mobile-ai-store

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables

```bash
# backend/.env
cp backend/.env.example backend/.env
# then fill in OPENAI_API_KEY

# frontend/.env
cp frontend/.env.example frontend/.env
```

### 3. Ingest the product catalog into a vector store

Choose ONE (or both, to be able to switch live in the chat UI):

```bash
cd backend

# OpenAI + ChromaDB (default)
npm run ingest:chroma

# HuggingFace (local) + FAISS — no OpenAI cost at all
npm run ingest:faiss
```

### 4. Run the app

```bash
# Terminal 1
cd backend && npm run dev     # http://localhost:5000

# Terminal 2
cd frontend && npm run dev    # http://localhost:5173
```

---

## 🔑 API Keys

| Variable | Where | Required | Notes |
|---|---|---|---|
| `OPENAI_API_KEY` | `backend/.env` | ✅ (for Chroma path) | Only used for embeddings + chat completion |
| `OPENAI_CHAT_MODEL` | `backend/.env` | optional | Defaults to `gpt-4o-mini` |
| `OPENAI_EMBEDDING_MODEL` | `backend/.env` | optional | Defaults to `text-embedding-3-small` |
| `CHROMA_URL` | `backend/.env` | optional | Point at a hosted Chroma server in production |
| `VITE_API_BASE_URL` | `frontend/.env` | ✅ | e.g. `https://your-backend.onrender.com/api` |

The FAISS + HuggingFace Instructor path requires **no API key at all** — everything runs locally via `@xenova/transformers`.

---

## ☁️ Deployment

### Backend → Render
1. Push this repo to GitHub.
2. In Render, "New Web Service" → connect the repo → set root directory to `backend`.
3. Build command: `npm install` · Start command: `npm start`.
4. Add environment variables from the table above.
5. After the first deploy, run the ingestion script once (Render Shell or a one-off job): `npm run ingest:chroma`.

*(A ready-made `render.yaml` is included at the repo root for Render's Blueprint deploys.)*

### Frontend → Netlify
1. In Netlify, "Add new site" → import from GitHub.
2. Base directory: `frontend` · Build command: `npm run build` · Publish directory: `dist`.
3. Set `VITE_API_BASE_URL` to your deployed Render backend URL.

*(A ready-made `netlify.toml` is included in `frontend/`.)*

---

## 🖼️ Screenshots

> Add screenshots here after running the app locally, e.g.:
> `docs/screenshot-home.png`, `docs/screenshot-chat.png`, `docs/screenshot-product.png`, `docs/screenshot-dark-mode.png`

```md
![Homepage](docs/screenshot-home.png)
![AI Chat Assistant](docs/screenshot-chat.png)
![Product Details](docs/screenshot-product.png)
![Dark Mode](docs/screenshot-dark-mode.png)
```

---

## 🧭 Future Improvements

- [ ] Real checkout flow with Stripe (test mode)
- [ ] User accounts + order history (JWT auth)
- [ ] Streaming chat responses (SSE) instead of single-shot replies
- [ ] Persist LangChain memory in Redis instead of process memory
- [ ] Product reviews & ratings, incorporated into RAG context
- [ ] Admin dashboard for managing the product catalog
- [ ] Automated re-ingestion pipeline (CI job) whenever `products.json` changes
- [ ] Evaluation harness for RAG answer quality (RAGAS or similar)

---

## 📄 License

MIT License — free to use, modify, and learn from for personal or portfolio purposes.

---

## 🙋 Why this project

This project was built to demonstrate practical, production-style **AI engineering**: not just calling an LLM API, but designing a real retrieval pipeline, controlling hallucination with grounding + citations, offering an interchangeable local-vs-cloud embedding strategy, and shipping it as a deployable, resume-ready full-stack application.
