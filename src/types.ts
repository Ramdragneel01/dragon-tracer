export interface TracerAPI {
  startSession: (sessionId: string) => Promise<{ sessionId: string; startedAt: number }>;
  stopSession: () => Promise<SessionReport>;
  getProcessSnapshot: () => Promise<ProcessInfo[]>;
  getWindowLog: () => Promise<WindowEvent[]>;
  onProcessAlert: (cb: (alert: ProcessAlert) => void) => () => void;
  onWindowEvent: (cb: (event: WindowEvent) => void) => () => void;
}

declare global {
  interface Window {
    tracerAPI?: TracerAPI;
  }
}

export type ThreatLevel = 'low' | 'medium' | 'high' | 'critical';
export type SessionStatus = 'idle' | 'monitoring' | 'completed';

export interface ProcessInfo {
  pid: number;
  name: string;
  windowTitle: string;
  memoryMB: number;
}

export interface ProcessAlert {
  pid: number;
  name: string;
  threat: ThreatLevel;
  reason: string;
  category: string;
  timestamp: number;
}

export interface WindowEvent {
  windowTitle: string;
  appName: string;
  timestamp: number;
  duration: number;
}

export interface InterviewSession {
  id: string;
  candidateName: string;
  role: string;
  startedAt: number;
  endedAt?: number;
  status: SessionStatus;
  threatScore: number;
  alerts: ProcessAlert[];
  windowEvents: WindowEvent[];
}

export interface SessionReport {
  processReport: ProcessAlert[];
  windowReport: WindowEvent[];
}

export interface IntegrityScore {
  overall: number; // 0-100
  processIntegrity: number;
  behaviorIntegrity: number;
  verdict: 'clean' | 'suspicious' | 'flagged';
}
