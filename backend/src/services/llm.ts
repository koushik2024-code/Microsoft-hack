import Groq from 'groq-sdk';
import { ChatMessage, Incident } from '../types';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'dummy_key',
});

const MODEL = process.env.LLM_MODEL || 'qwen/qwen3-32b';

const SYSTEM_PROMPT = `
You are IncidentMind, an AI incident response agent with persistent memory.
You remember past incidents, their root causes, and how they were resolved.
When a new incident occurs, you recall similar past incidents and suggest the fastest resolution path.

Your capabilities:
- Analyze incidents and identify potential root causes
- Recall similar past incidents and their resolutions
- Suggest resolution steps based on historical patterns
- Identify recurring issues and systemic problems
- Recommend runbooks and procedures that worked before

Always be specific, technical, and actionable. Reference specific past incidents when relevant.
Format your responses clearly with sections for: Analysis, Similar Past Incidents, Suggested Resolution Steps, and Preventive Measures.
`;

export async function chat(messages: ChatMessage[], systemPrompt?: string): Promise<string> {
  console.log('[LLM] Calling chat API');
  try {
    const formattedMessages: any[] = [];
    if (systemPrompt) {
      formattedMessages.push({ role: 'system', content: systemPrompt });
    }
    
    formattedMessages.push(...messages);
    
    const response = await groq.chat.completions.create({
      messages: formattedMessages,
      model: MODEL,
      temperature: 0.5,
      max_tokens: 2000
    });
    
    return response.choices[0]?.message?.content || 'No response generated.';
  } catch (error) {
    console.error('[LLM] Error in chat:', error);
    throw error;
  }
}

export async function analyzeIncident(incident: Incident, memories: any[]): Promise<string> {
  console.log(`[LLM] Analyzing incident: ${incident.id}`);
  
  const memoriesContext = memories.length > 0 
    ? `\nRelevant Past Memories/Incidents:\n${memories.map((m, i) => `${i+1}. ${m.content}`).join('\n')}`
    : '\nNo specific past memories found for this type of incident.';

  const userPrompt = `
Please analyze the following new incident:
Title: ${incident.title}
Service: ${incident.service}
Severity: ${incident.severity}
Description: ${incident.description}
Error Log: ${incident.errorLog || 'None provided'}
${memoriesContext}
`;

  return chat([{ role: 'user', content: userPrompt }], SYSTEM_PROMPT);
}
