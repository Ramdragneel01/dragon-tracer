import { Shield, AlertTriangle, Monitor, Clock, Eye } from 'lucide-react';
import type { InterviewSession, IntegrityScore } from '../types';
import AlertFeed from './AlertFeed';
import ThreatGauge from './ThreatGauge';
import ActivityTimeline from './ActivityTimeline';

interface LiveDashboardProps {
  session: InterviewSession;
  score: IntegrityScore;
  elapsed: number;
}

function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function LiveDashboard({ session, score, elapsed }: LiveDashboardProps) {
  const criticalAlerts = session.alerts.filter((a) => a.threat === 'critical');
  const rapidSwitches = session.windowEvents.filter((e) => e.duration > 0 && e.duration < 3000);

  return (
    <div className="p-6 space-y-6">
      {/* Top bar: session info + threat summary */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold">{session.candidateName}</h2>
          <p className="text-sm text-gray-400">{session.role}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-emerald-300">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium">LIVE</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <Clock size={13} />
            <span className="text-sm font-mono tabular-nums">{formatElapsed(elapsed)}</span>
          </div>
        </div>
      </div>

      {/* Critical alert banner */}
      {criticalAlerts.length > 0 && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 threat-blink">
          <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-300">
              {criticalAlerts.length} Critical Threat{criticalAlerts.length !== 1 ? 's' : ''} Detected
            </p>
            <p className="text-xs text-red-400/70 mt-1">
              {criticalAlerts.map((a) => a.name).join(', ')} — Interview integrity compromised
            </p>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={<Shield size={16} />}
          label="Integrity"
          value={`${score.overall}%`}
          color={score.overall >= 80 ? 'emerald' : score.overall >= 60 ? 'amber' : 'red'}
        />
        <StatCard
          icon={<AlertTriangle size={16} />}
          label="Threats"
          value={String(session.alerts.length)}
          color={session.alerts.length === 0 ? 'emerald' : 'red'}
        />
        <StatCard
          icon={<Monitor size={16} />}
          label="Window Switches"
          value={String(session.windowEvents.length)}
          color={session.windowEvents.length > 30 ? 'amber' : 'emerald'}
        />
        <StatCard
          icon={<Eye size={16} />}
          label="Rapid Switches"
          value={String(rapidSwitches.length)}
          color={rapidSwitches.length > 10 ? 'red' : rapidSwitches.length > 5 ? 'amber' : 'emerald'}
        />
      </div>

      {/* Main content: gauge + alerts + timeline */}
      <div className="grid grid-cols-12 gap-6">
        {/* Threat gauge */}
        <div className="col-span-4">
          <ThreatGauge score={score} />
        </div>

        {/* Alert feed */}
        <div className="col-span-4">
          <AlertFeed alerts={session.alerts} />
        </div>

        {/* Activity timeline */}
        <div className="col-span-4">
          <ActivityTimeline events={session.windowEvents} />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'emerald' | 'amber' | 'red';
}) {
  const styles = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
  };

  return (
    <div className={`p-4 rounded-xl border ${styles[color]} card-glow transition`}>
      <div className="flex items-center gap-2 mb-2 opacity-70">{icon}<span className="text-[10px] uppercase tracking-wider">{label}</span></div>
      <p className="text-2xl font-black tabular-nums">{value}</p>
    </div>
  );
}
