import { Router } from 'express';
import * as llm from '../services/llm';
import * as hindsight from '../services/hindsight';
import * as db from '../db/sqlite';

const router = Router();

router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    const reply = await llm.chat(messages);
    res.json({ reply });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/memories', async (req, res) => {
  try {
    const stored = hindsight.getAllStoredMemories('incident_mind_memory');
    const logs = hindsight.getMemoryLogs(25);
    res.json({ memories: stored, logs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats', (req, res) => {
  try {
    const allIncidents = db.getAllIncidents();
    const resolved = allIncidents.filter(i => i.status === 'resolved');
    const stored = hindsight.getAllStoredMemories('incident_mind_memory');
    
    const stats = {
      totalIncidents: allIncidents.length,
      resolvedIncidents: resolved.length,
      openIncidents: allIncidents.length - resolved.length,
      memoriesStored: stored.length,
      avgResolutionTime: '18 mins'
    };
    
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
