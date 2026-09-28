import { v4 as uuidv4 } from 'uuid';
import { Incident } from '../types';
import * as db from '../db/sqlite';
import * as hindsight from './hindsight';
import * as llm from './llm';

const NAMESPACE = 'incident_mind_memory';

export async function reportIncident(data: Omit<Incident, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<{ incident: Incident, analysis: string }> {
  const incident: Incident = {
    ...data,
    id: uuidv4(),
    status: 'open',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.createIncident(incident);
  
  const memoryContent = `New incident reported: ${incident.title} on service ${incident.service}. Description: ${incident.description}`;
  await hindsight.retain(NAMESPACE, memoryContent, { type: 'incident_reported', incidentId: incident.id });

  const analysis = await getAgentAnalysis(incident.id);
  
  return { incident, analysis };
}

export async function resolveIncident(id: string, resolution: string, rootCause: string): Promise<Incident | undefined> {
  db.updateIncident(id, { 
    status: 'resolved', 
    resolution, 
    rootCause, 
    resolvedAt: new Date().toISOString() 
  });
  
  const incident = db.getIncident(id);
  if (!incident) return undefined;
  
  const memoryContent = `Incident resolved: ${incident.title}. Root Cause: ${rootCause}. Resolution: ${resolution}.`;
  await hindsight.retain(NAMESPACE, memoryContent, { type: 'incident_resolved', incidentId: incident.id });
  
  return incident;
}

export async function getAgentAnalysis(incidentId: string): Promise<string> {
  const incident = db.getIncident(incidentId);
  if (!incident) throw new Error('Incident not found');
  
  const query = `${incident.service} ${incident.title} ${incident.description}`;
  const memories = await hindsight.recall(NAMESPACE, query);
  
  const analysis = await llm.analyzeIncident(incident, memories);
  return analysis;
}

export async function chatWithAgent(incidentId: string, message: string, history: any[] = []): Promise<string> {
  const incident = db.getIncident(incidentId);
  if (!incident) throw new Error('Incident not found');
  
  const query = `${incident.service} ${message}`;
  const memories = await hindsight.recall(NAMESPACE, query);
  
  const systemContext = `
You are discussing an ongoing incident.
Incident Context:
Title: ${incident.title}
Service: ${incident.service}
Status: ${incident.status}
Description: ${incident.description}

Relevant past memories:
${memories.map((m: any) => m.content).join('\n')}
  `;
  
  return llm.chat([...history, { role: 'user', content: message }], systemContext);
}
