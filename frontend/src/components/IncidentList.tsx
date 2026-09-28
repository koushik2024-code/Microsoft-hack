import { useState } from 'react';
import { Clock, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Incident } from '../types';

interface IncidentListProps {
  incidents: Incident[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}

const SeverityBadge = ({ severity }: { severity: Incident['severity'] }) => {
  const styles = {
    critical: 'bg-red-500/10 text-red-400 border-red-500/20',
    high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${styles[severity]}`}>
      {severity}
    </span>
  );
};

const StatusBadge = ({ status }: { status: Incident['status'] }) => {
  const styles = {
    open: 'text-red-400',
    investigating: 'text-yellow-400',
    resolved: 'text-emerald-400',
  };

  const icons = {
    open: <AlertCircle className="w-3.5 h-3.5" />,
    investigating: <Clock className="w-3.5 h-3.5" />,
    resolved: <CheckCircle2 className="w-3.5 h-3.5" />,
  };

  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium ${styles[status]}`}>
      {icons[status]}
      <span className="capitalize">{status}</span>
    </div>
  );
};

const IncidentList = ({ incidents, selectedId, onSelect, onNew }: IncidentListProps) => {
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');

  const filteredIncidents = incidents
    .filter(i => {
      if (filter === 'open') return i.status !== 'resolved';
      if (filter === 'resolved') return i.status === 'resolved';
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="h-full flex flex-col bg-gray-900 border-r border-gray-800">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50 backdrop-blur sticky top-0 z-10">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-indigo-400" />
          Incidents
        </h2>
        <button
          onClick={onNew}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm shadow-indigo-900/20"
        >
          Report Incident
        </button>
      </div>

      <div className="flex px-4 pt-3 gap-4 border-b border-gray-800 text-sm">
        {(['all', 'open', 'resolved'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`pb-3 font-medium capitalize border-b-2 transition-colors ${
              filter === f 
                ? 'border-indigo-500 text-indigo-400' 
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredIncidents.length === 0 ? (
          <div className="p-8 text-center text-gray-500 flex flex-col items-center">
            <CheckCircle2 className="w-12 h-12 text-gray-700 mb-3" />
            <p>No incidents found.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800/50">
            {filteredIncidents.map(incident => {
              const isSelected = selectedId === incident.id;
              return (
                <button
                  key={incident.id}
                  onClick={() => onSelect(incident.id)}
                  className={`w-full text-left p-4 hover:bg-gray-800/50 transition-all flex flex-col gap-2 ${
                    isSelected ? 'bg-gray-800/80 ring-1 ring-inset ring-indigo-500/30 border-l-2 border-l-indigo-500' : 'border-l-2 border-l-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <h3 className={`font-medium line-clamp-1 flex-1 ${isSelected ? 'text-indigo-300' : 'text-gray-200'}`}>
                      {incident.title}
                    </h3>
                    <StatusBadge status={incident.status} />
                  </div>
                  
                  <div className="flex items-center gap-3 mt-1">
                    <SeverityBadge severity={incident.severity} />
                    <span className="text-xs text-gray-400 font-mono bg-gray-800 px-1.5 py-0.5 rounded">
                      {incident.service}
                    </span>
                    <span className="text-xs text-gray-500 ml-auto flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentList;
