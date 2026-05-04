import { Monitor, ArrowRightLeft } from 'lucide-react';
import type { WindowEvent } from '../types';

interface ActivityTimelineProps {
  events: WindowEvent[];
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatDuration(ms: number): string {
  if (ms <= 0) return '—';
  if (ms < 1000) return `${ms}ms`;
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

export default function ActivityTimeline({ events }: ActivityTimelineProps) {
  const recent = events.slice(-20).reverse();

  return (
    <div className="rounded-xl bg-gray-800/30 border border-gray-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Window Activity</h3>
        <span className="text-[10px] text-gray-500">{events.length} switches</span>
      </div>

      <div className="max-h-72 overflow-y-auto">
        {recent.length === 0 ? (
          <div className="p-6 text-center text-gray-600 text-xs">
            No window activity recorded yet
          </div>
        ) : (
          <div className="divide-y divide-gray-800/50">
            {recent.map((event, i) => {
              const isRapid = event.duration > 0 && event.duration < 3000;
              return (
                <div
                  key={`${event.timestamp}-${i}`}
                  className={`px-4 py-2.5 flex items-start gap-3 transition hover:bg-white/[0.02] ${
                    isRapid ? 'bg-amber-500/[0.03]' : ''
                  }`}
                >
                  <div className={`mt-1 ${isRapid ? 'text-amber-400' : 'text-gray-500'}`}>
                    {isRapid ? <ArrowRightLeft size={12} /> : <Monitor size={12} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate text-gray-300" title={event.windowTitle}>
                      {event.windowTitle || '(untitled window)'}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[10px] text-gray-500 tabular-nums">{formatTime(event.timestamp)}</span>
                      {event.duration > 0 && (
                        <span className={`text-[10px] tabular-nums ${isRapid ? 'text-amber-500' : 'text-gray-600'}`}>
                          {formatDuration(event.duration)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
