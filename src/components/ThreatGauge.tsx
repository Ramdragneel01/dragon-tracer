import type { IntegrityScore } from '../types';

interface ThreatGaugeProps {
  score: IntegrityScore;
}

function getGaugeColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
}

function getVerdictLabel(verdict: IntegrityScore['verdict']): { text: string; color: string } {
  switch (verdict) {
    case 'clean': return { text: 'CLEAN', color: 'text-green-400' };
    case 'suspicious': return { text: 'SUSPICIOUS', color: 'text-amber-400' };
    case 'flagged': return { text: 'FLAGGED', color: 'text-red-400' };
  }
}

export default function ThreatGauge({ score }: ThreatGaugeProps) {
  const color = getGaugeColor(score.overall);
  const verdict = getVerdictLabel(score.verdict);

  // SVG arc calculations
  const radius = 70;
  const circumference = Math.PI * radius; // half circle
  const filled = (score.overall / 100) * circumference;
  const gap = circumference - filled;

  return (
    <div className="rounded-xl bg-gray-800/30 border border-gray-800 p-6">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Integrity Gauge</h3>

      <div className="flex flex-col items-center">
        <svg width="180" height="100" viewBox="0 0 180 100">
          {/* Background arc */}
          <path
            d="M 10 90 A 70 70 0 0 1 170 90"
            fill="none"
            stroke="#1f2937"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Filled arc */}
          <path
            d="M 10 90 A 70 70 0 0 1 170 90"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${gap}`}
            style={{ transition: 'stroke-dasharray 0.8s ease, stroke 0.5s ease' }}
          />
          {/* Score text */}
          <text x="90" y="75" textAnchor="middle" className="fill-current" style={{ fill: color }}>
            <tspan fontSize="28" fontWeight="900">{score.overall}</tspan>
          </text>
          <text x="90" y="92" textAnchor="middle" fill="#6b7280" fontSize="10">
            / 100
          </text>
        </svg>

        <div className={`mt-2 text-sm font-bold tracking-wider ${verdict.color}`}>
          {verdict.text}
        </div>

        {/* Breakdown */}
        <div className="w-full mt-4 space-y-2">
          <ScoreBar label="Process Integrity" value={score.processIntegrity} />
          <ScoreBar label="Behavior Integrity" value={score.behaviorIntegrity} />
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div>
      <div className="flex justify-between text-[11px] text-gray-400 mb-1">
        <span>{label}</span>
        <span className="tabular-nums">{value}%</span>
      </div>
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
