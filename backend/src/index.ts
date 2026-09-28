import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from the project root (incident-mind/)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import incidentsRouter from './routes/incidents';
import agentRouter from './routes/agent';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/incidents', incidentsRouter);
app.use('/api/agent', agentRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', memory: process.env.HINDSIGHT_API_KEY ? 'hindsight' : 'in-memory' });
});

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`\n🧠 IncidentMind backend listening on http://localhost:${port}`);
    console.log(`   Memory: ${process.env.HINDSIGHT_API_KEY ? 'Hindsight Cloud' : 'In-memory fallback'}`);
    console.log(`   LLM: ${process.env.GROQ_API_KEY ? 'Groq' : '⚠️  No GROQ_API_KEY set'}`);
    console.log(`   Model: ${process.env.LLM_MODEL || 'qwen/qwen3-32b'}\n`);
  });
}

export default app;
export { app };
