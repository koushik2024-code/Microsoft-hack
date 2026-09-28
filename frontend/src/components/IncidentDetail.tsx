import { useState } from 'react';
import { AlertTriangle, Server, Clock, CheckCircle, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Incident } from '../types';

interface IncidentDetailProps {
  incident: Incident;
  onAnalyze: (id: string) => Promise<{ analysis: string }>;
  onResolve: (id: string, resolution: string, rootCause: string) => Promise<void>;
}

const IncidentDetail: React.FC<IncidentDetailProps> = ({ incident, onAnalyze, onResolve }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [resolveData, setResolveData] = useState({ resolution: '', rootCause: '' });
  const [isResolving, setIsResolving] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const res = await onAnalyze(incident.id);
      setAnalysis(res.analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResolving(true);
    try {
      await onResolve(incident.id, resolveData.resolution, resolveData.rootCause);
      setShowResolveForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-950 p-6 flex flex-col gap-6">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">{incident.title}</h2>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
            <span className="flex items-center gap-1.5 bg-gray-900 px-2 py-1 rounded border border-gray-800">
              <Server className="w-4 h-4" />
              {incident.service}
            </span>
            <span className="flex items-center gap-1.5 bg-gray-900 px-2 py-1 rounded border border-gray-800">
              <Clock className="w-4 h-4" />
              {new Date(incident.createdAt).toLocaleString()}
            </span>
            <span className="uppercase text-xs font-bold tracking-wider px-2 py-1 rounded bg-gray-900 border border-gray-800">
              {incident.severity}
            </span>
            <span className={`uppercase text-xs font-bold tracking-wider px-2 py-1 rounded border ${
              incident.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
              incident.status === 'investigating' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
              'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              {incident.status}
            </span>
          </div>
        </div>

        {incident.status !== 'resolved' && (
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
            </button>
            <button
              onClick={() => setShowResolveForm(!showResolveForm)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Resolve
            </button>
          </div>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Description</h3>
        <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{incident.description}</p>
      </div>

      {incident.errorLog && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            Error Logs
          </h3>
          <pre className="bg-gray-950 p-4 rounded-lg overflow-x-auto text-sm text-red-300 font-mono border border-gray-800/80">
            {incident.errorLog}
          </pre>
        </div>
      )}

      {showResolveForm && incident.status !== 'resolved' && (
        <form onSubmit={handleResolve} className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5 animate-in slide-in-from-top-2">
          <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Resolve Incident
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Root Cause</label>
              <textarea
                required
                value={resolveData.rootCause}
                onChange={e => setResolveData({ ...resolveData, rootCause: e.target.value })}
                rows={2}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                placeholder="What caused this issue?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Resolution Steps</label>
              <textarea
                required
                value={resolveData.resolution}
                onChange={e => setResolveData({ ...resolveData, resolution: e.target.value })}
                rows={2}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                placeholder="How was it fixed?"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowResolveForm(false)}
                className="px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isResolving}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg disabled:opacity-50"
              >
                {isResolving ? 'Resolving...' : 'Confirm Resolution'}
              </button>
            </div>
          </div>
        </form>
      )}

      {incident.status === 'resolved' && (
        <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Resolution Details
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-medium text-gray-500 mb-1">Root Cause</h4>
              <p className="text-gray-200">{incident.rootCause}</p>
            </div>
            <div>
              <h4 className="text-xs font-medium text-gray-500 mb-1">Resolution</h4>
              <p className="text-gray-200">{incident.resolution}</p>
            </div>
          </div>
        </div>
      )}

      {analysis && (
        <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Analysis
          </h3>
          <div className="markdown-body">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentDetail;
