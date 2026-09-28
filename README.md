# 🧠 IncidentMind — AI Incident Response Agent with Memory

**IncidentMind** is an AI-powered incident response agent that remembers past incidents, their root causes, and resolution steps. When a new incident occurs, it instantly recalls similar past incidents and suggests the fastest resolution path — getting smarter with every incident it handles.

Built with [Hindsight](https://github.com/vectorize-io/hindsight) for persistent [agent memory](https://vectorize.io/what-is-agent-memory), IncidentMind demonstrates how AI agents become dramatically more effective when they can learn from history.

## 🔑 Key Features

- **Intelligent Incident Analysis** — When a new incident is reported, IncidentMind analyzes it using both LLM reasoning and memories of similar past incidents
- **Persistent Memory via Hindsight** — Every incident, root cause, and resolution is stored in [Hindsight's memory layer](https://hindsight.vectorize.io/), enabling the agent to improve over time
- **Pattern Detection** — Identifies recurring issues across services and suggests systemic fixes
- **Interactive Chat** — Discuss specific incidents with the agent in real-time, with full memory context
- **Resolution Learning Loop** — When an incident is resolved, the resolution is stored so future similar incidents can be fixed faster

## 📸 How It Works

```
┌─────────────────────────────────────────────┐
│           React Frontend (Vite)              │
│  • Incident Dashboard  • Agent Chat          │
│  • Memory Insights     • Resolution Flow     │
└──────────────────┬──────────────────────────┘
                   │ REST API
┌──────────────────▼──────────────────────────┐
│          Express.js Backend (TS)             │
│  • Incident CRUD    • Agent Chat Engine      │
│  • Memory Manager   • Groq LLM Integration  │
├─────────────────────────────────────────────┤
│          Hindsight Memory Layer              │
│  • retain() → Store incident knowledge      │
│  • recall() → Retrieve similar incidents    │
│  • Pattern learning over time               │
└─────────────────────────────────────────────┘
```

### Before & After: The Memory Difference

| Without Memory | With Hindsight Memory |
|---|---|
| Agent gives generic troubleshooting steps | Agent recalls the exact resolution from 2 weeks ago |
| Same incident type = same slow investigation | Past root cause is immediately suggested |
| No knowledge of recurring patterns | "This is the 3rd Redis OOM this month — consider architectural changes" |
| Every on-call engineer starts from scratch | Agent briefs you with full incident history in seconds |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- A [Groq API key](https://groq.com/) (free tier available)
- (Optional) [Hindsight Cloud](https://ui.hindsight.vectorize.io) account — works without it using in-memory fallback

### Setup

```bash
# Clone and install
cd incident-mind
npm install --workspaces

# Configure environment
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# Seed with realistic incident data
cd backend && npm run seed

# Start the backend
npm run dev

# In a new terminal, start the frontend
cd frontend && npm run dev
```

Open http://localhost:5173 to see the dashboard.

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes | Your Groq API key for LLM inference |
| `HINDSIGHT_API_URL` | No | Hindsight API endpoint (defaults to cloud) |
| `HINDSIGHT_API_KEY` | No | Hindsight API key (falls back to in-memory) |
| `LLM_MODEL` | No | Model to use (default: `qwen/qwen3-32b`) |
| `PORT` | No | Backend port (default: `3001`) |

## 🏗️ Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **LLM**: Groq (qwen/qwen3-32b)
- **Memory**: [Hindsight](https://github.com/vectorize-io/hindsight) by Vectorize
- **Storage**: JSON file-based (no native dependencies)

## 🧠 How Hindsight Memory Powers IncidentMind

### Retain — Storing Knowledge
Every time an incident is reported or resolved, IncidentMind stores the details in Hindsight:

```typescript
// When a new incident is reported
await hindsight.retain('incident_mind_memory', 
  `Incident: PostgreSQL connection pool exhaustion. 
   Service: Database. Root Cause: Unoptimized queries...`,
  { type: 'incident_resolved', service: 'Database' }
);
```

### Recall — Leveraging History  
When analyzing a new incident, IncidentMind recalls relevant past incidents:

```typescript
// When analyzing a new database incident
const memories = await hindsight.recall('incident_mind_memory',
  'database connection timeout slow queries'
);
// Returns: past DB incidents, their root causes, and resolutions
```

This creates a **learning loop**: the more incidents IncidentMind handles, the better its suggestions become.

## 📁 Project Structure

```
incident-mind/
├── .env.example          # Environment template
├── backend/
│   └── src/
│       ├── index.ts          # Express server
│       ├── seed.ts           # Realistic seed data
│       ├── types.ts          # TypeScript types
│       ├── db/sqlite.ts      # JSON file storage
│       ├── routes/
│       │   ├── incidents.ts  # Incident CRUD + analysis
│       │   └── agent.ts      # Agent chat + stats
│       └── services/
│           ├── hindsight.ts  # Hindsight memory integration
│           ├── llm.ts        # Groq LLM service
│           └── incidents.ts  # Business logic
└── frontend/
    └── src/
        ├── App.tsx
        ├── components/
        │   ├── Dashboard.tsx      # Main layout
        │   ├── IncidentList.tsx    # Incident sidebar
        │   ├── IncidentDetail.tsx  # Incident details + analysis
        │   ├── IncidentChat.tsx    # Agent chat interface
        │   ├── IncidentForm.tsx    # Report new incident
        │   ├── MemoryPanel.tsx     # Memory insights
        │   └── Header.tsx         # Navigation
        └── hooks/useApi.ts        # API client hooks
```

## 📝 License

MIT
