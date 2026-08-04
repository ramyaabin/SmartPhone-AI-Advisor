import { ChromaClient } from 'chromadb';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
const COLLECTION_NAME = process.env.CHROMA_COLLECTION || 'mobile_products';

let client;
let collection;

/**
 * Lazily connects to a local/embedded Chroma instance and caches the
 * collection handle. Uses `chromadb`'s embedded (path-based) client so no
 * separate Chroma server process is required for local development —
 * for production you can point CHROMA_URL at a hosted Chroma server instead.
 */
async function getCollection() {
  if (collection) return collection;

  client = new ChromaClient({
    path: process.env.CHROMA_URL || undefined
  });

  collection = await client.getOrCreateCollection({
    name: COLLECTION_NAME,
    metadata: { 'hnsw:space': 'cosine' }
  });

  return collection;
}

/**
 * Generates a small (1536-dim, but truncatable) OpenAI embedding for a
 * single piece of text. text-embedding-3-small is used by default to stay
 * cheap and within OpenAI's free/low-cost tier.
 */
export async function embedText(text) {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text
  });
  return response.data[0].embedding;
}

export async function embedBatch(texts) {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts
  });
  return response.data.map((d) => d.embedding);
}

/**
 * Inserts (or upserts) a batch of pre-chunked product documents into Chroma.
 * Called by scripts/ingestChroma.js during the offline ingestion step.
 */
export async function upsertChunks(chunks) {
  const col = await getCollection();
  const embeddings = await embedBatch(chunks.map((c) => c.text));

  await col.upsert({
    ids: chunks.map((c) => c.id),
    embeddings,
    documents: chunks.map((c) => c.text),
    metadatas: chunks.map((c) => c.metadata)
  });
}

/**
 * Embeds the user's query and runs a similarity search against Chroma,
 * returning the top-K most relevant product chunks with their metadata.
 */
export async function similaritySearch(query, topK = 4) {
  const col = await getCollection();
  const queryEmbedding = await embedText(query);

  const results = await col.query({
    queryEmbeddings: [queryEmbedding],
    nResults: topK
  });

  const documents = results.documents?.[0] || [];
  const metadatas = results.metadatas?.[0] || [];
  const distances = results.distances?.[0] || [];

  return documents.map((text, i) => ({
    text,
    metadata: metadatas[i],
    score: distances[i]
  }));
}

export async function resetCollection() {
  client = client || new ChromaClient({ path: process.env.CHROMA_URL || undefined });
  try {
    await client.deleteCollection({ name: COLLECTION_NAME });
  } catch {
    // collection may not exist yet — safe to ignore
  }
  collection = null;
  return getCollection();
}
