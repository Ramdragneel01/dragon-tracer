import { useState } from 'react';
import { Shield, Users, Briefcase, Play, Calendar, Link2 } from 'lucide-react';

interface SessionSetupProps {
  onStart: (candidateName: string, role: string) => Promise<unknown>;
}

export default function SessionSetup({ onStart }: SessionSetupProps) {
  const [candidateName, setCandidateName] = useState('');
  const [role, setRole] = useState('');
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = async () => {
    if (!candidateName.trim() || !role.trim()) return;
    setIsStarting(true);
    await onStart(candidateName.trim(), role.trim());
    setIsStarting(false);
  };

  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="w-full max-w-lg">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl shadow-emerald-500/25 mb-6">
            <Shield size={36} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Start Interview Session</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Dragon Tracer monitors for AI-assisted cheating, suspicious process activity,
            and anomalous window-switching behavior in real time.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-xs text-gray-400 mb-2 uppercase tracking-wider">
              <Users size={12} />
              Candidate Name
            </label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="e.g. Jane Smith"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition placeholder:text-gray-600"
              autoFocus
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs text-gray-400 mb-2 uppercase tracking-wider">
              <Briefcase size={12} />
              Interview Role
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition placeholder:text-gray-600"
              onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            />
          </div>

          <button
            onClick={handleStart}
            disabled={!candidateName.trim() || !role.trim() || isStarting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-semibold hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
          >
            <Play size={16} />
            {isStarting ? 'Starting...' : 'Begin Monitoring'}
          </button>
        </div>

        {/* Features */}
        <div className="mt-10 grid grid-cols-3 gap-4">
          {[
            { icon: Shield, label: 'AI Fraud Detection', desc: 'Detects ChatGPT, Cluely, Cursor & more' },
            { icon: Calendar, label: 'Behavior Analysis', desc: 'Window-switch anomaly detection' },
            { icon: Link2, label: 'Integrity Reports', desc: 'Detailed exportable audit trail' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="p-3 rounded-xl bg-gray-800/30 border border-gray-800 text-center">
              <Icon size={18} className="text-emerald-400 mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-300">{label}</p>
              <p className="text-[10px] text-gray-500 mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
