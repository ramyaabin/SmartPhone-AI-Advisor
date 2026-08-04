import OpenAI from "openai";
import dotenv from "dotenv";
import { similaritySearch } from "./chromaService.js";
import { similaritySearchLocal } from "./faissService.js";
import { getMemory } from "./memoryService.js";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini";
const TOP_K = Number(process.env.TOP_K || 8);

const SYSTEM_PROMPT = `
You are the shopping assistant for "Mobile AI Store", an e-commerce website that sells smartphones.

Rules:
1. Answer only using the product information provided in CONTEXT.
2. Never use outside phone knowledge.
3. If the requested phone or specification is not in CONTEXT, say it is not available in the store catalog.
4. For recommendation questions, analyze the available phones in CONTEXT and recommend the best match based on:
   - budget
   - camera
   - battery
   - performance
   - storage
   - user needs
5. For comparison questions, compare only phones available in CONTEXT.
6. Mention citations like:
   (Based on Brand Model specifications.)
7. Prices are always in EUR (€).
`;

function formatContext(chunks) {
  if (!chunks || chunks.length === 0) {
    return "";
  }

  return chunks.map((c, i) => `[${i + 1}] ${c.text}`).join("\n\n");
}

export async function answerQuestion({
  question,
  sessionId,
  backend = "chroma",
}) {
  console.log("USER QUESTION:", question);

  const memory = getMemory(sessionId);

  const priorTurns = await memory.loadMemoryVariables({});

  const retrieved =
    backend === "faiss"
      ? await similaritySearchLocal(question, TOP_K)
      : await similaritySearch(question, TOP_K);

  console.log(
    "RETRIEVED PRODUCTS:",
    retrieved.map((r) => r.metadata?.name),
  );

  const context = formatContext(retrieved);

  const chatHistory = (priorTurns.chat_history || []).map((m) => ({
    role: m._getType && m._getType() === "human" ? "user" : "assistant",
    content: m.content,
  }));

  const messages = [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },

    ...chatHistory,

    {
      role: "user",
      content: `
CONTEXT:

${context || "No matching products found."}


QUESTION:

${question}
`,
    },
  ];

  const completion = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages,
    temperature: 0.2,
    max_tokens: 700,
  });

  const answer = completion.choices[0].message.content;

  await memory.saveContext(
    {
      input: question,
    },
    {
      output: answer,
    },
  );

  return {
    answer,
    sources: retrieved.map((r) => ({
      product: r.metadata?.name,
      brand: r.metadata?.brand,
      score: r.score,
    })),
    retrievalBackend: backend,
  };
}
