/**
 * Converts a single product object into a compact, information-dense text
 * chunk that will be embedded and stored in the vector store. Keeping this
 * in one place means both the OpenAI/Chroma pipeline and the HuggingFace/FAISS
 * pipeline chunk products identically, so results stay comparable.
 */
export function productToText(product) {
  return [
    `Product: ${product.name}`,
    `Brand: ${product.brand}`,
    `Price: €${product.price}`,
    `RAM: ${product.ram}`,
    `Storage: ${product.storage}`,
    `Display: ${product.display}`,
    `Processor: ${product.processor}`,
    `Battery: ${product.battery}`,
    `Camera: ${product.camera}`,
    `Operating System: ${product.os}`,
    `Color: ${product.color}`,
    `Description: ${product.description}`
  ].join('\n');
}

/**
 * Splits a product's text into overlapping chunks. Because each product
 * document is already short (~12 lines), most products will fit into a
 * single chunk, but this keeps the pipeline correct for longer descriptions
 * and mirrors a "real" RAG chunking step for the README/demo.
 */
export function chunkText(text, chunkSize = 350, chunkOverlap = 40) {
  const words = text.split(/\s+/);
  if (words.length <= chunkSize) return [text];

  const chunks = [];
  let start = 0;
  while (start < words.length) {
    const end = Math.min(start + chunkSize, words.length);
    chunks.push(words.slice(start, end).join(' '));
    if (end === words.length) break;
    start = end - chunkOverlap;
  }
  return chunks;
}

/**
 * Builds the full list of { id, text, metadata } chunks for every product,
 * ready to be embedded and inserted into either vector store.
 */
export function buildChunks(products, chunkSize, chunkOverlap) {
  const chunks = [];
  for (const product of products) {
    const text = productToText(product);
    const parts = chunkText(text, chunkSize, chunkOverlap);
    parts.forEach((part, idx) => {
      chunks.push({
        id: `${product.id}-chunk-${idx}`,
        text: part,
        metadata: {
          productId: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price
        }
      });
    });
  }
  return chunks;
}
