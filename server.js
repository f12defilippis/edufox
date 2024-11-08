import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateQuestions } from './src/services/openaiService.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://edufox-app.netlify.app'] 
    : ['http://localhost:5173'],
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Questions generation route
app.post('/api/generate-questions', generateQuestions);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});