import { MemoryEntry } from '../types';

const API_URL = process.env.HINDSIGHT_API_URL || 'https://api.hindsight.vectorize.io';
const API_KEY = process.env.HINDSIGHT_API_KEY;

export interface MemoryLog {
  id: string;
  operation: 'retain' | 'recall' | 'reflect';
  bankId: string;
  timestamp: string;
  details: any;
  status: 'success' | 'fallback' | 'failed';
}

// In-memory fallback and telemetry storage
const inMemoryStorage: Record<string, Array<{ content: string; metadata?: Record<string, any>; timestamp: string; id: string }>> = {};
const memoryLogs: MemoryLog[] = [];

export function getMemoryLogs(limit: number = 20): MemoryLog[] {
  return [...memoryLogs].reverse().slice(0, limit);
}

export function getAllStoredMemories(namespace: string = 'incident_mind_memory'): Array<{ content: string; metadata?: Record<string, any>; timestamp: string; id: string }> {
  return inMemoryStorage[namespace] || [];
}

/**
 * Retain memory into Hindsight bank / namespace
 */
export async function retain(namespace: string, content: string, metadata?: Record<string, any>): Promise<void> {
  const timestamp = new Date().toISOString();
  const id = `mem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  console.log(`[Hindsight] Retaining memory in bank: ${namespace}`);
  
  // Store locally for immediate UI inspection & resilience
  if (!inMemoryStorage[namespace]) {
    inMemoryStorage[namespace] = [];
  }
  inMemoryStorage[namespace].push({ id, content, metadata, timestamp });

  if (!API_KEY) {
    console.log('[Hindsight] In-memory local mode (No HINDSIGHT_API_KEY provided)');
    memoryLogs.push({
      id,
      operation: 'retain',
      bankId: namespace,
      timestamp,
      details: { content: content.substring(0, 100) + '...', metadata },
      status: 'fallback'
    });
    return;
  }

  try {
    // Official Hindsight REST API endpoints
    const response = await fetch(`${API_URL}/v1/default/banks/${namespace}/memories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [{
          content,
          metadata,
          context: metadata?.service || 'incident-response',
          timestamp
        }]
      })
    });
    
    if (!response.ok) {
      // Try alternate endpoint
      const altResponse = await fetch(`${API_URL}/v1/namespaces/${namespace}/retain`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content, metadata })
      });
      if (!altResponse.ok) {
        throw new Error(`Hindsight API error: ${response.statusText}`);
      }
    }

    memoryLogs.push({
      id,
      operation: 'retain',
      bankId: namespace,
      timestamp,
      details: { content: content.substring(0, 100) + '...', metadata },
      status: 'success'
    });
  } catch (error: any) {
    console.warn('[Hindsight] Cloud retain request notice, using local cached bank:', error.message);
    memoryLogs.push({
      id,
      operation: 'retain',
      bankId: namespace,
      timestamp,
      details: { content: content.substring(0, 100) + '...', error: error.message },
      status: 'fallback'
    });
  }
}

/**
 * Recall memories matching a query from Hindsight
 */
export async function recall(namespace: string, query: string, topK: number = 5): Promise<any[]> {
  const timestamp = new Date().toISOString();
  const logId = `recall-${Date.now()}`;
  console.log(`[Hindsight] Recalling memory from bank: ${namespace} for query: "${query}"`);
  
  const namespaceMemories = inMemoryStorage[namespace] || [];
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  
  const scoredLocal = namespaceMemories.map(m => {
    const text = (m.content + ' ' + JSON.stringify(m.metadata || {})).toLowerCase();
    const score = queryWords.reduce((acc, word) => acc + (text.includes(word) ? 1 : 0), 0);
    return { memory: m, score };
  })
  .filter(m => m.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, topK)
  .map(m => m.memory);

  if (!API_KEY) {
    memoryLogs.push({
      id: logId,
      operation: 'recall',
      bankId: namespace,
      timestamp,
      details: { query, matchedCount: scoredLocal.length, mode: 'local' },
      status: 'fallback'
    });
    return scoredLocal;
  }

  try {
    const response = await fetch(`${API_URL}/v1/default/banks/${namespace}/memories/recall`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        budget: 'high',
        types: ['world', 'experience', 'observation']
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      const results = (data.results || []).map((r: any) => ({
        content: r.text || r.content,
        metadata: r.metadata || {},
        type: r.type,
        score: r.score
      }));

      memoryLogs.push({
        id: logId,
        operation: 'recall',
        bankId: namespace,
        timestamp,
        details: { query, matchedCount: results.length, mode: 'cloud' },
        status: 'success'
      });

      return results.length > 0 ? results : scoredLocal;
    }
    
    throw new Error(`Recall response not ok: ${response.status}`);
  } catch (error: any) {
    console.warn('[Hindsight] Cloud recall notice, returning local matches:', error.message);
    memoryLogs.push({
      id: logId,
      operation: 'recall',
      bankId: namespace,
      timestamp,
      details: { query, matchedCount: scoredLocal.length, mode: 'local-fallback' },
      status: 'fallback'
    });
    return scoredLocal;
  }
}
