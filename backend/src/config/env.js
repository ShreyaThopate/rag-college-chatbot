import dotenv from 'dotenv';
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.RENDER);

export const config = {
  isProduction,
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || (isProduction ? '' : 'mongodb://127.0.0.1:27017/collegegpt'),
  jwtSecret: process.env.JWT_SECRET || 'collegegpt_super_secret_jwt_key_2026',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  openRouterApiKey: process.env.OPENROUTER_API_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  embeddingModel: process.env.EMBEDDING_MODEL || 'Xenova/all-MiniLM-L6-v2',
  vectorDbUrl: process.env.VECTOR_DB_URL || '',
  topK: parseInt(process.env.TOP_K || '5', 10),
  similarityThreshold: parseFloat(process.env.SIMILARITY_THRESHOLD || '0.25'),
};
