import { useEffect, useState } from 'react';
import { useIncidents, useIncident } from '../hooks/useApi';
import IncidentList from './IncidentList';
import IncidentDetail from './IncidentDetail';
import IncidentChat from './IncidentChat';
import MemoryPanel from './MemoryPanel';
import IncidentForm from './IncidentForm';

interface DashboardProps {
  selectedIncidentId: string | null;
  onSelectIncident: (id: string | null) => void;
}

const Dashboard = ({ selectedIncidentId, onSelectIncident }: DashboardProps) => {
  const { incidents, fetchIncidents, loading } = useIncidents();
  const { createIncident, resolveIncident, analyzeIncident, chatWithAgent } = useIncident();
  
  const [showForm, setShowForm] = useState(false);
  const selectedIncident = incidents.find(i => i.id === selectedIncidentId);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const handleCreateIncident = async (data: any) => {
    await createIncident(data);
    fetchIncidents();
  };

  const handleResolve = async (id: string, resolution: string, rootCause: string) => {
    await resolveIncident(id, resolution, rootCause);
    fetchIncidents();
  };

  if (loading && incidents.length === 0) {
    return <div className="h-full flex items-center justify-center text-gray-400">Loading...</div>;
  }

  return (
    <div className="flex h-full w-full">
      {/* Left panel: Incident List */}
      <div className="w-1/3 min-w-[350px] max-w-[450px] h-full flex flex-col">
        <IncidentList 
          incidents={incidents} 
          selectedId={selectedIncidentId} 
          onSelect={onSelectIncident}
          onNew={() => setShowForm(true)}
        />
      </div>

      {/* Right panel: Detail & Chat/Memory */}
      <div className="flex-1 flex h-full bg-gray-950 overflow-hidden relative">
        {selectedIncident ? (
          <div className="flex w-full h-full">
            <div className="flex-1 border-r border-gray-800 overflow-hidden">
              <IncidentDetail 
                incident={selectedIncident} 
                onAnalyze={analyzeIncident}
                onResolve={handleResolve}
              />
            </div>
            <div className="w-[400px] flex flex-col gap-4 p-4 bg-gray-900/30 overflow-hidden shrink-0">
              <div className="h-1/2 min-h-[300px]">
                <IncidentChat 
                  incidentId={selectedIncident.id} 
                  onSendMessage={(msg, history) => chatWithAgent(selectedIncident.id, msg, history)} 
                />
              </div>
              <div className="flex-1 min-h-[200px]">
                <MemoryPanel />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 text-center">
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-300 mb-2">No Incident Selected</h3>
            <p className="max-w-md">Select an incident from the list to view details, analyze root causes, or interact with the IncidentMind agent.</p>
          </div>
        )}
      </div>

      {showForm && (
        <IncidentForm 
          onClose={() => setShowForm(false)} 
          onSubmit={handleCreateIncident} 
        />
      )}
    </div>
  );
};

export default Dashboard;
