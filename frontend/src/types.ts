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
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AgentStats {
  totalIncidents: number;
  resolvedIncidents: number;
  avgResolutionTime: string;
  memoriesStored: number;
}
