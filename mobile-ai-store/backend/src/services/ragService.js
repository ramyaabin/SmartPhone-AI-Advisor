import OpenAI from "openai";
import dotenv from "dotenv";
import { similaritySearch } from "./chromaService.js";
import { similaritySearchLocal } from "./faissService.js";
import { getMemory } from "./memoryService.js";

dotenv.config();

// The SDK default is a 10-minute timeout with 2 retries, which outlives the
// frontend's request timeout and leaves the chat spinner hanging. Fail fast.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000,
  maxRetries: 0,
});

const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini";
const TOP_K = Number(process.env.TOP_K || 8);
// Only the most recent turns are sent to the model so long chats don't keep
// getting slower and more expensive.
const MAX_HISTORY_MESSAGES = 10;

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
   For "latest" or "newest" questions, judge only from CONTEXT: a higher model
   number, newer OS version, or newer processor generation means a newer phone.
8. Each product in CONTEXT has a "Page" path. Whenever you name a product, link it
   in markdown using exactly that path, e.g. [Poco F7](/product/xiaomi-poco-f7).
   If the user asks for a link, give only the link for the phone(s) they mean,
   not every phone in CONTEXT. Never invent other URLs.
`;

function formatContext(chunks) {
  if (!chunks || chunks.length === 0) {
    return "";
  }

  return chunks
    .map((c, i) => {
      const page = c.metadata?.productId
        ? `Page: /product/${c.metadata.productId}\n`
        : "";
      return `[${i + 1}] ${page}${c.text}`;
    })
    .join("\n\n");
}

/**
 * Follow-ups like "compare it with the Pixel 9 Pro" don't name the phone
 * being discussed, so a vector search on them misses it. Rewrite the question
 * into a standalone one using the recent conversation before retrieving.
 * Falls back to the raw question if the rewrite fails.
 */
async function condenseQuestion(question, chatHistory) {
  if (chatHistory.length === 0) return question;

  const transcript = chatHistory
    .slice(-4)
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  try {
    const completion = await openai.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        {
          role: "system",
          content:
            "Rewrite the user's latest question as a standalone search query for a phone catalog. " +
            "Replace pronouns like 'it' or 'that one' with the phone names they refer to in the conversation. " +
            "Return only the rewritten question.",
        },
        {
          role: "user",
          content: `Conversation:\n${transcript}\n\nLatest question: ${question}`,
        },
      ],
      temperature: 0,
      max_tokens: 100,
    }, { timeout: 8000 });
    const rewritten = completion.choices[0].message.content?.trim();
    console.log("SEARCH QUERY:", rewritten);
    return rewritten || question;
  } catch (err) {
    console.warn("Question rewrite failed, using raw question:", err.message);
    return question;
  }
}

export async function answerQuestion({
  question,
  sessionId,
  backend = "chroma",
}) {
  console.log("USER QUESTION:", question);

  const memory = getMemory(sessionId);

  const priorTurns = await memory.loadMemoryVariables({});

  const chatHistory = (priorTurns.chat_history || [])
    .slice(-MAX_HISTORY_MESSAGES)
    .map((m) => ({
      role: m._getType && m._getType() === "human" ? "user" : "assistant",
      content: m.content,
    }));

  const searchQuery = await condenseQuestion(question, chatHistory);

  const retrieved =
    backend === "faiss"
      ? await similaritySearchLocal(searchQuery, TOP_K)
      : await similaritySearch(searchQuery, TOP_K);

  console.log(
    "RETRIEVED PRODUCTS:",
    retrieved.map((r) => r.metadata?.name),
  );

  const context = formatContext(retrieved);

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
${searchQuery !== question ? `\n(In context of the conversation, this means: ${searchQuery})\n` : ""}`,
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

  // Only cite the phones the answer actually links to, not every retrieved
  // chunk, so an Apple question doesn't list Samsung and Google as sources.
  const cited = retrieved.filter(
    (r) =>
      r.metadata?.productId &&
      answer.includes(`/product/${r.metadata.productId})`),
  );

  return {
    answer,
    sources: cited.map((r) => ({
      productId: r.metadata?.productId,
      product: r.metadata?.name,
      brand: r.metadata?.brand,
      score: r.score,
    })),
    retrievalBackend: backend,
  };
}
