import { useState, useCallback } from 'react';
import { Incident, AgentStats, ChatMessage } from '../types';

const API_BASE = '/api';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`);
      }
      const data = await res.json();
      return data;
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { request, loading, error };
}

export function useIncidents() {
  const { request, loading, error } = useApi();
  const [incidents, setIncidents] = useState<Incident[]>([]);

  const fetchIncidents = useCallback(async () => {
    try {
      const data = await request('/incidents');
      setIncidents(data);
    } catch (e) {
      console.error(e);
    }
  }, [request]);

  return { incidents, fetchIncidents, loading, error };
}

export function useIncident() {
  const { request } = useApi();
  
  const getIncident = async (id: string): Promise<Incident> => {
    return request(`/incidents/${id}`);
  };

  const createIncident = async (data: Partial<Incident>): Promise<Incident> => {
    return request('/incidents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };

  const resolveIncident = async (id: string, resolution: string, rootCause: string): Promise<Incident> => {
    return request(`/incidents/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolution, rootCause }),
    });
  };

  const analyzeIncident = async (id: string): Promise<{ analysis: string }> => {
    return request(`/incidents/${id}/analyze`, {
      method: 'POST',
    });
  };

  const chatWithAgent = async (incidentId: string, message: string, history: ChatMessage[]): Promise<{ reply: string }> => {
    return request(`/incidents/${incidentId}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    });
  };

  const getAgentStats = async (): Promise<AgentStats> => {
    return request(`/agent/stats`);
  };

  const getMemories = async (): Promise<any[]> => {
    return request(`/agent/memories`);
  };

  return { getIncident, createIncident, resolveIncident, analyzeIncident, chatWithAgent, getAgentStats, getMemories };
}
