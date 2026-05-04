import { useState, useEffect, useMemo } from 'react';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useSession } from './hooks/useSession';
import { calculateIntegrityScore, generateIntegrityReport } from './services/integrity-engine';
import SessionSetup from './components/SessionSetup';
import LiveDashboard from './components/LiveDashboard';
import ReportView from './components/ReportView';
import Sidebar from './components/Sidebar';
import type { IntegrityScore } from './types';

export default function App() {
  const { session, status, startSession, stopSession, resetSession } = useSession();
  const [elapsed, setElapsed] = useState(0);

  // Elapsed timer
  useEffect(() => {
    if (status !== 'monitoring' || !session) return;
    const start = session.startedAt;
    const timer = setInterval(() => setElapsed(Date.now() - start), 1000);
    return () => clearInterval(timer);
  }, [status, session]);

  const score: IntegrityScore | null = useMemo(() => {
    if (!session) return null;
    return calculateIntegrityScore(session.alerts, session.windowEvents);
  }, [session?.alerts.length, session?.windowEvents.length]);

  const handleExportReport = () => {
    if (!session || !score) return;
    const md = generateIntegrityReport(
      session.candidateName,
      session.role,
      session.alerts,
      session.windowEvents,
      score,
    );
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `integrity-report-${session.candidateName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex bg-gray-950 text-gray-100">
      {/* Sidebar */}
      <Sidebar
        status={status}
        score={score}
        elapsed={elapsed}
        alertCount={session?.alerts.length ?? 0}
        onStop={stopSession}
        onReset={resetSession}
        onExport={handleExportReport}
      />

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {/* Title bar drag region */}
        <div className="titlebar-drag h-9 flex items-center px-4">
          <div className="titlebar-no-drag flex items-center gap-2">
            {score && score.verdict === 'clean' && <ShieldCheck size={16} className="text-green-400" />}
            {score && score.verdict === 'suspicious' && <ShieldAlert size={16} className="text-amber-400" />}
            {score && score.verdict === 'flagged' && <ShieldAlert size={16} className="text-red-400 threat-blink" />}
            {!score && <Shield size={16} className="text-gray-500" />}
            <span className="text-xs text-gray-500">Dragon Tracer</span>
          </div>
        </div>

        <div className="h-[calc(100%-2.25rem)] overflow-auto">
          {status === 'idle' && (
            <SessionSetup onStart={startSession} />
          )}
          {status === 'monitoring' && session && score && (
            <LiveDashboard
              session={session}
              score={score}
              elapsed={elapsed}
            />
          )}
          {status === 'completed' && session && score && (
            <ReportView
              session={session}
              score={score}
              onExport={handleExportReport}
              onReset={resetSession}
            />
          )}
        </div>
      </main>
    </div>
  );
}
