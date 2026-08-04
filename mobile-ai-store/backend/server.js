import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import productRoutes from './src/routes/products.js';
import chatRoutes from './src/routes/chat.js';
import { errorHandler, notFound } from './src/middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || '*'
  })
);

// Basic abuse protection for the AI chat endpoint (it's the costly one)
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many chat requests. Please slow down.' }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/products', productRoutes);
app.use('/api/chat', chatLimiter, chatRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Mobile AI Store API running on port ${PORT}`);
});
