import { useState, FormEvent } from 'react';
import { X } from 'lucide-react';
import { Incident } from '../types';

interface IncidentFormProps {
  onClose: () => void;
  onSubmit: (data: Partial<Incident>) => Promise<void>;
}

const IncidentForm = ({ onClose, onSubmit }: IncidentFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    severity: 'high' as Incident['severity'],
    service: 'API',
    description: '',
    errorLog: '',
  });

  const services = ['API', 'Database', 'Auth', 'Payments', 'Frontend', 'CDN', 'Cache'];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Report New Incident</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Title</label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder-gray-600"
              placeholder="e.g. API latency spike in EU-west"
            />
          </div>

          <div className="flex gap-5">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Severity</label>
              <select
                value={formData.severity}
                onChange={e => setFormData({ ...formData, severity: e.target.value as any })}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
              >
                <option value="critical">Critical (SEV-1)</option>
                <option value="high">High (SEV-2)</option>
                <option value="medium">Medium (SEV-3)</option>
                <option value="low">Low (SEV-4)</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Affected Service</label>
              <select
                value={formData.service}
                onChange={e => setFormData({ ...formData, service: e.target.value })}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
              >
                {services.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none placeholder-gray-600"
              placeholder="What is happening? What is the impact?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Error Logs (Optional)</label>
            <textarea
              value={formData.errorLog}
              onChange={e => setFormData({ ...formData, errorLog: e.target.value })}
              rows={4}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-gray-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none placeholder-gray-700"
              placeholder="Paste stack trace or relevant logs here..."
            />
          </div>
        </form>

        <div className="p-5 border-t border-gray-800 bg-gray-900/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.title || !formData.description}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-indigo-900/20"
          >
            {loading ? 'Submitting...' : 'Report Incident'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncidentForm;
