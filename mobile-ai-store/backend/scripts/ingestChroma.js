/**
 * Offline ingestion script (OpenAI + ChromaDB path):
 *  1. Load data/products.json
 *  2. Convert each product into text
 *  3. Split into chunks
 *  4. Generate OpenAI embeddings
 *  5. Store embeddings + metadata in ChromaDB
 *
 * Run with: npm run ingest:chroma  (from backend/)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { buildChunks } from '../src/utils/productToText.js';
import { upsertChunks, resetCollection } from '../src/services/chromaService.js';

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

  console.log('Resetting Chroma collection...');
  await resetCollection();

  console.log('Generating OpenAI embeddings and upserting into Chroma (batches of 20)...');
  const BATCH = 20;
  for (let i = 0; i < chunks.length; i += BATCH) {
    const batch = chunks.slice(i, i + BATCH);
    await upsertChunks(batch);
    console.log(`  Upserted ${Math.min(i + BATCH, chunks.length)}/${chunks.length}`);
  }

  console.log('Done. Vector store ready at embeddings/chroma (or CHROMA_URL server).');
}

main().catch((err) => {
  console.error('Ingestion failed:', err);
  process.exit(1);
});
