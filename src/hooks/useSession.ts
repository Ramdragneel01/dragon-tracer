import { useState, useCallback, useEffect, useRef } from 'react';
import type { InterviewSession, ProcessAlert, WindowEvent, SessionStatus } from '../types';
import { DemoSimulator } from '../services/demo-simulator';

const isElectron = typeof window !== 'undefined' && !!window.tracerAPI;

export function useSession() {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [status, setStatus] = useState<SessionStatus>('idle');
  const alertCleanup = useRef<(() => void) | null>(null);
  const windowCleanup = useRef<(() => void) | null>(null);
  const demoRef = useRef<DemoSimulator | null>(null);

  const addAlert = useCallback((alert: ProcessAlert) => {
    setSession((prev) => prev ? { ...prev, alerts: [...prev.alerts, alert] } : prev);
  }, []);

  const addWindowEvent = useCallback((event: WindowEvent) => {
    setSession((prev) => prev ? { ...prev, windowEvents: [...prev.windowEvents, event] } : prev);
  }, []);

  const startSession = useCallback(async (candidateName: string, role: string) => {
    const sessionId = crypto.randomUUID();

    const newSession: InterviewSession = {
      id: sessionId,
      candidateName,
      role,
      startedAt: Date.now(),
      status: 'monitoring',
      threatScore: 100,
      alerts: [],
      windowEvents: [],
    };

    setSession(newSession);
    setStatus('monitoring');

    if (isElectron) {
      // Production: use real Electron process monitoring
      await window.tracerAPI!.startSession(sessionId);

      alertCleanup.current = window.tracerAPI!.onProcessAlert(addAlert);
      windowCleanup.current = window.tracerAPI!.onWindowEvent(addWindowEvent);
    } else {
      // Demo mode: simulate threats and window activity
      const sim = new DemoSimulator();
      demoRef.current = sim;
      sim.start(addAlert, addWindowEvent);
    }

    return newSession;
  }, [addAlert, addWindowEvent]);

  const stopSession = useCallback(async () => {
    alertCleanup.current?.();
    windowCleanup.current?.();
    alertCleanup.current = null;
    windowCleanup.current = null;
    demoRef.current?.stop();
    demoRef.current = null;

    if (isElectron) {
      const report = await window.tracerAPI!.stopSession();
      setSession((prev) => prev ? {
        ...prev,
        status: 'completed',
        endedAt: Date.now(),
        alerts: report?.processReport ?? prev.alerts,
        windowEvents: report?.windowReport ?? prev.windowEvents,
      } : prev);
    } else {
      setSession((prev) => prev ? { ...prev, status: 'completed', endedAt: Date.now() } : prev);
    }

    setStatus('completed');
  }, []);

  const resetSession = useCallback(() => {
    setSession(null);
    setStatus('idle');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      alertCleanup.current?.();
      windowCleanup.current?.();
      demoRef.current?.stop();
    };
  }, []);

  return { session, status, startSession, stopSession, resetSession };
}
