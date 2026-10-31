import { pipeline } from "@xenova/transformers";
import faiss from "faiss-node";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const { IndexFlatIP } = faiss;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FAISS_DIR = path.resolve(__dirname, "../../../embeddings/faiss");
const INDEX_FILE = path.join(FAISS_DIR, "index.faiss");
const META_FILE = path.join(FAISS_DIR, "meta.json");

// hkunlp/instructor-base is the "real" HuggingFace Instructor model, but it
// requires a Python sentence-transformers runtime. To keep this an
// alternative retrieval path that runs entirely inside the Node backend
// (no OpenAI, no Python service), we run a comparable local embedding model
// through @xenova/transformers (ONNX runtime in JS). Swap MODEL_NAME for
// 'hkunlp/instructor-base' + a Python microservice if you want the exact
// Instructor model — see README "Alternative Retrieval" section.
const MODEL_NAME = "Xenova/all-MiniLM-L6-v2";
const EMBEDDING_DIM = 384;

let extractorPromise;
let index;
let metadata = [];

// Cache the promise, not the result, so concurrent first requests share a
// single model load instead of each loading the model.
function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = pipeline("feature-extraction", MODEL_NAME).catch((err) => {
      extractorPromise = null;
      throw err;
    });
  }
  return extractorPromise;
}

function normalize(vec) {
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

/**
 * Embeds text locally (no network call, no API cost) using a small
 * sentence-transformer model, mean-pooled and L2-normalized so that inner
 * product search behaves like cosine similarity.
 */
export async function embedTextLocal(text) {
  const model = await getExtractor();
  const output = await model(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}

function ensureDir() {
  if (!fs.existsSync(FAISS_DIR)) fs.mkdirSync(FAISS_DIR, { recursive: true });
}

/**
 * Builds a fresh FAISS index from pre-chunked product documents. Called by
 * scripts/ingestFaiss.js. Persists both the raw index and a JSON sidecar
 * containing the chunk text/metadata (FAISS itself only stores vectors).
 */
export async function buildFaissIndex(chunks) {
  ensureDir();
  index = new IndexFlatIP(EMBEDDING_DIM);
  metadata = [];

  for (const chunk of chunks) {
    const vec = normalize(await embedTextLocal(chunk.text));
    index.add(vec);
    metadata.push({ text: chunk.text, metadata: chunk.metadata });
  }

  index.write(INDEX_FILE);
  fs.writeFileSync(META_FILE, JSON.stringify(metadata, null, 2));
  return metadata.length;
}

function loadIndex() {
  if (index) return;
  if (!fs.existsSync(INDEX_FILE) || !fs.existsSync(META_FILE)) {
    throw new Error(
      'FAISS index not found. Run "npm run ingest:faiss" in backend/ first.',
    );
  }
  index = IndexFlatIP.read(INDEX_FILE);
  metadata = JSON.parse(fs.readFileSync(META_FILE, "utf-8"));
}

/**
 * Embeds the query locally and performs a similarity search against the
 * persisted FAISS index — the fully local counterpart to
 * chromaService.similaritySearch().
 */
export async function similaritySearchLocal(query, topK = 4) {
  loadIndex();
  const queryVec = normalize(await embedTextLocal(query));
  const results = index.search(queryVec, topK);

  return results.labels
    .map((label, i) => ({
      text: metadata[label]?.text,
      metadata: metadata[label]?.metadata,
      score: results.distances[i],
    }))
    .filter((r) => r.text);
}
