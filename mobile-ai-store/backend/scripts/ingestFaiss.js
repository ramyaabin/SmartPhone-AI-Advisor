/**
 * Offline ingestion script (HuggingFace embeddings + FAISS path):
 * Fully local alternative to ingestChroma.js — no OpenAI calls at all.
 *
 * Run with: npm run ingest:faiss  (from backend/)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { buildChunks } from '../src/utils/productToText.js';
import { buildFaissIndex } from '../src/services/faissService.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRODUCTS_PATH = path.resolve(__dirname, '../../data/products.json');

async function main() {
  console.log('Loading product catalog...');
  const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf-8'));
  console.log(`Loaded ${products.length} products.`);

  const chunkSize = Number(process.env.CHUNK_SIZE || 350);
  const chunkOverlap = Number(process.env.CHUNK_OVERLAP || 40);
  const chunks = buildChunks(products, chunkSize, chunkOverlap);
  console.log(`Built ${chunks.length} text chunks.`);

  console.log('Embedding locally and building FAISS index (this runs an ONNX model on CPU)...');
  const count = await buildFaissIndex(chunks);

  console.log(`Done. Indexed ${count} chunks at embeddings/faiss/index.faiss`);
}

main().catch((err) => {
  console.error('Ingestion failed:', err);
  process.exit(1);
});
