import fs from 'fs';
import path from 'path';
import { Incident } from '../types';

// Resolve data directory relative to backend
const dataDir = path.join(__dirname, '../../data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'incidents.json');

// Simple JSON file-based storage — no native deps needed
interface DbData {
  incidents: Incident[];
}

function readDb(): DbData {
  if (!fs.existsSync(dbPath)) {
    return { incidents: [] };
  }
  try {
    const raw = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(raw) as DbData;
  } catch {
    return { incidents: [] };
  }
}

function writeDb(data: DbData): void {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

export function createIncident(incident: Incident): void {
  const data = readDb();
  data.incidents.push(incident);
  writeDb(data);
  console.log(`[DB] Created incident: ${incident.id} — ${incident.title}`);
}

export function getIncident(id: string): Incident | undefined {
  const data = readDb();
  return data.incidents.find(i => i.id === id);
}

export function getAllIncidents(): Incident[] {
  const data = readDb();
  return data.incidents.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function updateIncident(id: string, updates: Partial<Incident>): void {
  const data = readDb();
  const index = data.incidents.findIndex(i => i.id === id);
  if (index === -1) return;

  data.incidents[index] = {
    ...data.incidents[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  writeDb(data);
  console.log(`[DB] Updated incident: ${id}`);
}

export function getIncidentsByService(service: string): Incident[] {
  const data = readDb();
  return data.incidents
    .filter(i => i.service === service)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getIncidentsBySeverity(severity: string): Incident[] {
  const data = readDb();
  return data.incidents
    .filter(i => i.severity === severity)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
