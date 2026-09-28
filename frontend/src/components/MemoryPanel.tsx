import { useEffect, useState } from 'react';
import { Brain, Activity, Database, Check } from 'lucide-react';
import { useIncident } from '../hooks/useApi';

const MemoryPanel = () => {
  const { getAgentStats, getMemories } = useIncident();
  const [stats, setStats] = useState<any>(null);
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, m] = await Promise.all([
          getAgentStats().catch(() => null),
          getMemories().catch(() => ({ memories: [] }))
        ]);
        if (s) setStats(s);
        if (m) {
          const list = Array.isArray(m) ? m : (m.memories || []);
          setMemories(list);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    // Poll every 10 seconds for memory updates
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col h-full shadow-sm">
      <div className="p-3 border-b border-gray-800 bg-gray-900/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-gray-200">Hindsight Memory</span>
        </div>
        {loading ? (
          <Activity className="w-3.5 h-3.5 text-gray-500 animate-pulse" />
        ) : (
          <span className="text-xs font-mono text-purple-400/80 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
            {stats?.memoriesStored || memories.length || 0} facts
          </span>
        )}
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Memory Insights</h4>
            {memories.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No memories stored yet. Resolve incidents to build knowledge.</p>
            ) : (
              <ul className="space-y-2">
                {memories.slice(0, 5).map((mem, i) => (
                  <li key={i} className="text-xs bg-gray-800/50 p-2.5 rounded border border-gray-800/80 text-gray-300 flex gap-2 items-start">
                    <Database className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{mem.content || mem}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {stats && (
            <div className="mt-4 pt-4 border-t border-gray-800/80">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Agent Statistics</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-950 p-2 rounded border border-gray-800">
                  <div className="text-[10px] text-gray-500 mb-1">Total Resolved</div>
                  <div className="text-sm font-medium text-gray-200 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    {stats.resolvedIncidents}
                  </div>
                </div>
                <div className="bg-gray-950 p-2 rounded border border-gray-800">
                  <div className="text-[10px] text-gray-500 mb-1">Avg Resolution</div>
                  <div className="text-sm font-medium text-gray-200">
                    {stats.avgResolutionTime || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoryPanel;
