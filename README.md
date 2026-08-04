# SmartPhone-AI-Advisor
SmartPhone AI Advisor is an AI-powered smartphone e-commerce platform featuring a RAG chatbot built with React, Node.js, OpenAI GPT, LangChain, ChromaDB, FAISS, and Hugging Face embeddings. It provides semantic search, intelligent product recommendations, and context-aware conversational shopping assistance.

Data Preparation

The mobile product information was stored as structured JSON data.

NLP

Text extraction was performed from the product catalog.

Vectorization

The extracted text was converted into embeddings using OpenAI Embeddings and stored inside ChromaDB.

Alternative Retrieval

The same product catalog was also embedded using HuggingFace Instructor Embeddings and stored in a FAISS vector database for comparison.

Question Answering

When a user asks a question, the query is converted into an embedding.

A similarity search retrieves the most relevant product chunks from the vector store.

These retrieved chunks are used to construct a prompt for the LLM.

The OpenAI GPT model generates a natural language answer based only on the retrieved context.

Conversation Memory

LangChain ConversationBufferMemory stores previous messages so the chatbot remembers the conversation and can answer follow-up questions naturally.
