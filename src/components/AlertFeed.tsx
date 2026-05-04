import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import type { ProcessAlert } from '../types';

interface AlertFeedProps {
  alerts: ProcessAlert[];
}

function threatIcon(threat: ProcessAlert['threat']) {
  switch (threat) {
    case 'critical': return <AlertTriangle size={14} className="text-red-400" />;
    case 'high': return <AlertTriangle size={14} className="text-orange-400" />;
    case 'medium': return <AlertCircle size={14} className="text-amber-400" />;
    case 'low': return <Info size={14} className="text-blue-400" />;
  }
}

function threatBg(threat: ProcessAlert['threat']): string {
  switch (threat) {
    case 'critical': return 'border-l-red-500 bg-red-500/5';
    case 'high': return 'border-l-orange-500 bg-orange-500/5';
    case 'medium': return 'border-l-amber-500 bg-amber-500/5';
    case 'low': return 'border-l-blue-500 bg-blue-500/5';
  }
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function AlertFeed({ alerts }: AlertFeedProps) {
  const sorted = [...alerts].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="rounded-xl bg-gray-800/30 border border-gray-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Threat Feed</h3>
        {alerts.length > 0 && (
          <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500/20 text-red-400 rounded-full">
            {alerts.length}
          </span>
        )}
      </div>

      <div className="max-h-72 overflow-y-auto">
        {sorted.length === 0 ? (
          <div className="p-6 text-center text-gray-600 text-xs">
            No threats detected — monitoring...
          </div>
        ) : (
          <div className="divide-y divide-gray-800/50">
            {sorted.map((alert, i) => (
              <div
                key={`${alert.pid}-${alert.timestamp}-${i}`}
                className={`px-4 py-3 border-l-2 ${threatBg(alert.threat)} transition hover:bg-white/[0.02]`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {threatIcon(alert.threat)}
                  <span className="text-xs font-semibold">{alert.name}</span>
                  <span className="ml-auto text-[10px] text-gray-500 tabular-nums">{formatTime(alert.timestamp)}</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">{alert.reason}</p>
                <span className="inline-block mt-1.5 text-[9px] px-1.5 py-0.5 bg-gray-700/50 text-gray-400 rounded">
                  {alert.category}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
