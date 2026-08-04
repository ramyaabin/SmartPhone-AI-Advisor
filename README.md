# SmartPhone AI Advisor

SmartPhone AI Advisor is an AI-powered smartphone e-commerce platform featuring a Retrieval-Augmented Generation (RAG) chatbot built with React, Node.js, OpenAI GPT, LangChain, ChromaDB, FAISS, and Hugging Face embeddings. The application provides semantic search, intelligent product recommendations, and context-aware conversational shopping assistance.

---

## Overview

SmartPhone AI Advisor combines a modern e-commerce platform with an AI-powered conversational assistant capable of answering product-related questions using Retrieval-Augmented Generation (RAG). The chatbot retrieves relevant information from a vector database and generates accurate responses based solely on the available product catalog.

---

## Key Highlights

- AI-powered shopping assistant using OpenAI GPT
- Retrieval-Augmented Generation (RAG) architecture
- Semantic search using vector embeddings
- Dual vector store implementation with ChromaDB and FAISS
- OpenAI Embeddings and Hugging Face Instructor Embeddings
- Context-aware conversational AI with chat history
- Modern full-stack architecture using React and Node.js
- Intelligent product comparison and recommendations
- Responsive and user-friendly interface
- Production-ready project structure suitable for deployment

---

## Technology Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend

- Node.js
- Express.js

### Artificial Intelligence

- OpenAI GPT
- OpenAI Embeddings
- LangChain
- ChromaDB
- Hugging Face Instructor Embeddings
- FAISS (Facebook AI Similarity Search)

---

## System Architecture

### Data Preparation

Smartphone product information is stored as structured JSON data.

### Natural Language Processing

Text is extracted from the product catalog and prepared for vectorization.

### Vectorization

The extracted product information is converted into vector embeddings using OpenAI Embeddings and stored in a ChromaDB vector database.

### Alternative Retrieval Pipeline

The same product catalog is also embedded using Hugging Face Instructor Embeddings and stored in a FAISS vector database, allowing comparison between different embedding and retrieval strategies.

### Question Answering Workflow

When a user submits a question:

1. The user query is converted into an embedding.
2. A similarity search retrieves the most relevant product information.
3. Retrieved text chunks are used to construct the prompt.
4. The prompt is sent to the OpenAI GPT model.
5. The model generates a context-aware response based only on the retrieved information.

### Conversation Memory

LangChain ConversationBufferMemory stores previous interactions, enabling the chatbot to maintain context and answer follow-up questions naturally.

---

## Features

- AI-powered product search
- Conversational shopping assistant
- Smartphone catalog management
- Product comparison
- Brand-based filtering
- Semantic search
- Intelligent recommendations
- Retrieval-Augmented Generation (RAG)
- Context-aware conversations
- Conversation history
- Shopping cart
- Wishlist
- Responsive web design
- Dark mode support

---

## Example Queries

- Which iPhone has the best camera?
- Compare iPhone 16 Pro and Samsung Galaxy S24 Ultra.
- Recommend a smartphone under €900.
- Which phone has the largest battery?
- Which smartphones support 512 GB storage?
- Which phone offers the best value for money?

---

## Project Structure

```
SmartPhone-AI-Advisor/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── vectorstore/
│   └── package.json
│
├── data/
│   └── smartphones.json
│
├── embeddings/
│
├── screenshots/
│
└── README.md
```

---

## Future Enhancements

- Voice-based AI assistant
- Image-based product search
- Multi-language support
- Personalized recommendations
- User authentication and profiles
- Order management
- Admin dashboard
- Real-time inventory integration

---

## License

This project is intended for educational and portfolio purposes.
