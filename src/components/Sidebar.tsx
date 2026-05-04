import { Shield, Power, RotateCcw, Download } from 'lucide-react';
import type { SessionStatus, IntegrityScore } from '../types';

interface SidebarProps {
  status: SessionStatus;
  score: IntegrityScore | null;
  elapsed: number;
  alertCount: number;
  onStop: () => void;
  onReset: () => void;
  onExport: () => void;
}

function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-red-400';
}

export default function Sidebar({ status, score, elapsed, alertCount, onStop, onReset, onExport }: SidebarProps) {
  return (
    <aside className="w-64 bg-gray-900/80 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="titlebar-drag px-5 pt-4 pb-3">
        <div className="titlebar-no-drag flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">Dragon Tracer</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Interview Integrity</p>
          </div>
        </div>
      </div>

      {/* Score display */}
      {score && status !== 'idle' && (
        <div className="mx-4 mt-2 p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Integrity Score</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-black tabular-nums ${getScoreColor(score.overall)}`}>
              {score.overall}
            </span>
            <span className="text-sm text-gray-500">/100</span>
          </div>
          <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                score.overall >= 80 ? 'bg-green-500' : score.overall >= 60 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${score.overall}%` }}
            />
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Process</span>
              <span className={getScoreColor(score.processIntegrity)}>{score.processIntegrity}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Behavior</span>
              <span className={getScoreColor(score.behaviorIntegrity)}>{score.behaviorIntegrity}</span>
            </div>
          </div>
        </div>
      )}

      {/* Session info */}
      {status === 'monitoring' && (
        <div className="mx-4 mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-300 font-medium">MONITORING</span>
          </div>
          <p className="text-lg font-mono tabular-nums text-emerald-200">{formatElapsed(elapsed)}</p>
          {alertCount > 0 && (
            <p className="text-xs text-red-400 mt-1">{alertCount} threat{alertCount !== 1 ? 's' : ''} detected</p>
          )}
        </div>
      )}

      {status === 'completed' && (
        <div className="mx-4 mt-3 p-3 rounded-xl bg-gray-800/50 border border-gray-700/50">
          <p className="text-xs text-gray-400">Session Complete</p>
          <p className="text-sm font-medium mt-1">
            {score?.verdict === 'clean' && '✅ Clean'}
            {score?.verdict === 'suspicious' && '⚠️ Suspicious'}
            {score?.verdict === 'flagged' && '🚨 Flagged'}
          </p>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="p-4 space-y-2 border-t border-gray-800">
        {status === 'monitoring' && (
          <button
            onClick={onStop}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm font-medium hover:bg-red-500/20 transition"
          >
            <Power size={14} />
            End Session
          </button>
        )}
        {status === 'completed' && (
          <>
            <button
              onClick={onExport}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-sm font-medium hover:bg-emerald-500/20 transition"
            >
              <Download size={14} />
              Export Report
            </button>
            <button
              onClick={onReset}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 text-gray-400 border border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-700 transition"
            >
              <RotateCcw size={14} />
              New Session
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
