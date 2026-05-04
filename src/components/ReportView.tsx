import { ShieldCheck, ShieldAlert, Download, RotateCcw, FileText } from 'lucide-react';
import type { InterviewSession, IntegrityScore } from '../types';
import ThreatGauge from './ThreatGauge';
import AlertFeed from './AlertFeed';

interface ReportViewProps {
  session: InterviewSession;
  score: IntegrityScore;
  onExport: () => void;
  onReset: () => void;
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m} min ${s} sec`;
}

export default function ReportView({ session, score, onExport, onReset }: ReportViewProps) {
  const duration = (session.endedAt ?? Date.now()) - session.startedAt;
  const criticals = session.alerts.filter((a) => a.threat === 'critical');
  const highs = session.alerts.filter((a) => a.threat === 'high');
  const mediums = session.alerts.filter((a) => a.threat === 'medium');
  const rapidSwitches = session.windowEvents.filter((e) => e.duration > 0 && e.duration < 3000);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            {score.verdict === 'clean' ? (
              <ShieldCheck size={24} className="text-green-400" />
            ) : (
              <ShieldAlert size={24} className={score.verdict === 'flagged' ? 'text-red-400' : 'text-amber-400'} />
            )}
            <h2 className="text-xl font-bold">Interview Integrity Report</h2>
          </div>
          <p className="text-sm text-gray-400">
            {session.candidateName} — {session.role}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-medium hover:bg-emerald-500/20 transition"
          >
            <Download size={14} />
            Export
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-400 border border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-700 transition"
          >
            <RotateCcw size={14} />
            New Session
          </button>
        </div>
      </div>

      {/* Verdict banner */}
      <div className={`p-5 rounded-xl border ${
        score.verdict === 'clean'
          ? 'bg-green-500/10 border-green-500/30'
          : score.verdict === 'suspicious'
            ? 'bg-amber-500/10 border-amber-500/30'
            : 'bg-red-500/10 border-red-500/30'
      }`}>
        <div className="flex items-center gap-3 mb-2">
          <span className={`text-lg font-black uppercase tracking-wider ${
            score.verdict === 'clean' ? 'text-green-400' : score.verdict === 'suspicious' ? 'text-amber-400' : 'text-red-400'
          }`}>
            {score.verdict === 'clean' && 'CLEAN — No integrity concerns'}
            {score.verdict === 'suspicious' && 'SUSPICIOUS — Manual review recommended'}
            {score.verdict === 'flagged' && 'FLAGGED — Interview integrity compromised'}
          </span>
        </div>
        <p className="text-sm text-gray-400">
          {score.verdict === 'clean' && 'No AI tools or suspicious processes were detected during this interview session. Window activity patterns were within normal parameters.'}
          {score.verdict === 'suspicious' && `${highs.length + mediums.length} potential integrity concern(s) found. These may warrant further review but are not definitive evidence of cheating.`}
          {score.verdict === 'flagged' && `${criticals.length} critical threat(s) detected. AI-assisted cheating tools were found running during the interview. This session should be invalidated.`}
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-5 gap-4">
        <SummaryCard label="Duration" value={formatDuration(duration)} />
        <SummaryCard label="Overall Score" value={`${score.overall}/100`} />
        <SummaryCard label="Total Threats" value={String(session.alerts.length)} highlight={session.alerts.length > 0} />
        <SummaryCard label="Window Switches" value={String(session.windowEvents.length)} />
        <SummaryCard label="Rapid Switches" value={String(rapidSwitches.length)} highlight={rapidSwitches.length > 5} />
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-2 gap-6">
        <ThreatGauge score={score} />
        <AlertFeed alerts={session.alerts} />
      </div>

      {/* Recommendation */}
      <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-2">
          <FileText size={12} />
          Recommendation
        </h3>
        <p className="text-sm text-gray-300 leading-relaxed">
          {criticals.length > 0
            ? `This interview should be reviewed and potentially invalidated. ${criticals.length} critical AI tool(s) were detected: ${criticals.map((a) => a.name).join(', ')}. Consider rescheduling with enhanced proctoring.`
            : highs.length > 0
              ? `Manual review recommended. ${highs.length} high-severity finding(s) were detected. Consider a follow-up in-person assessment.`
              : 'No action required. The interview session showed normal activity patterns with no evidence of AI-assisted cheating.'}
        </p>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`p-3 rounded-xl border ${
      highlight ? 'bg-red-500/5 border-red-500/20 text-red-400' : 'bg-gray-800/30 border-gray-800 text-gray-300'
    }`}>
      <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-bold tabular-nums">{value}</p>
    </div>
  );
}
