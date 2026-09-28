import { Router } from 'express';
import * as db from '../db/sqlite';
import * as incidentService from '../services/incidents';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const result = await incidentService.reportIncident(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', (req, res) => {
  try {
    const incidents = db.getAllIncidents();
    res.json(incidents);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const incident = db.getIncident(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    res.json(incident);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    db.updateIncident(req.params.id, req.body);
    res.json(db.getIncident(req.params.id));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/resolve', async (req, res) => {
  try {
    const { resolution, rootCause } = req.body;
    const incident = await incidentService.resolveIncident(req.params.id, resolution, rootCause);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    res.json(incident);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/analyze', async (req, res) => {
  try {
    const analysis = await incidentService.getAgentAnalysis(req.params.id);
    res.json({ analysis });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    const reply = await incidentService.chatWithAgent(req.params.id, message, history);
    res.json({ reply });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
