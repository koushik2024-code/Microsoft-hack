export interface Incident {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  service: string;
  status: 'open' | 'investigating' | 'resolved';
  description: string;
  errorLog?: string;
  rootCause?: string;
  resolution?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface MemoryEntry {
  type: 'incident_resolved' | 'pattern_detected' | 'runbook_effective';
  content: string;
  metadata: Record<string, any>;
}
