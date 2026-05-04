import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('tracerAPI', {
  // Session control
  startSession: (sessionId: string) => ipcRenderer.invoke('start-session', sessionId),
  stopSession: () => ipcRenderer.invoke('stop-session'),

  // Data queries
  getProcessSnapshot: () => ipcRenderer.invoke('get-process-snapshot'),
  getWindowLog: () => ipcRenderer.invoke('get-window-log'),

  // Real-time events from main process
  onProcessAlert: (callback: (alert: ProcessAlert) => void) => {
    ipcRenderer.on('process-alert', (_e, alert) => callback(alert));
    return () => { ipcRenderer.removeAllListeners('process-alert'); };
  },
  onWindowEvent: (callback: (event: WindowEvent) => void) => {
    ipcRenderer.on('window-event', (_e, event) => callback(event));
    return () => { ipcRenderer.removeAllListeners('window-event'); };
  },
});

interface ProcessAlert {
  pid: number;
  name: string;
  threat: string;
  reason: string;
  timestamp: number;
}

interface WindowEvent {
  windowTitle: string;
  timestamp: number;
  duration: number;
}
