import { useState } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';

function App() {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <Header />
      <main className="flex-1 overflow-hidden">
        <Dashboard 
          selectedIncidentId={selectedIncidentId} 
          onSelectIncident={setSelectedIncidentId} 
        />
      </main>
    </div>
  );
}

export default App;
