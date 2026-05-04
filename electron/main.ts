import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { ProcessMonitor } from './process-monitor';
import { WindowTracker } from './window-tracker';

let mainWindow: BrowserWindow | null = null;
let processMonitor: ProcessMonitor | null = null;
let windowTracker: WindowTracker | null = null;

function createMainWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Dragon Tracer — Interview Integrity',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#030712',
      symbolColor: '#9ca3af',
      height: 36,
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const isDev = !app.isPackaged;
  if (isDev) {
    win.loadURL('http://localhost:5174');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  return win;
}

function setupIPC(): void {
  // Start monitoring session
  ipcMain.handle('start-session', async (_event, sessionId: string) => {
    processMonitor = new ProcessMonitor();
    windowTracker = new WindowTracker();

    processMonitor.start((alert) => {
      mainWindow?.webContents.send('process-alert', alert);
    });

    windowTracker.start((event) => {
      mainWindow?.webContents.send('window-event', event);
    });

    return { sessionId, startedAt: Date.now() };
  });

  // Stop monitoring session
  ipcMain.handle('stop-session', async () => {
    const processReport = processMonitor?.getReport() ?? [];
    const windowReport = windowTracker?.getReport() ?? [];

    processMonitor?.stop();
    windowTracker?.stop();
    processMonitor = null;
    windowTracker = null;

    return { processReport, windowReport };
  });

  // Get current process snapshot
  ipcMain.handle('get-process-snapshot', async () => {
    return processMonitor?.getSnapshot() ?? [];
  });

  // Get window activity log
  ipcMain.handle('get-window-log', async () => {
    return windowTracker?.getReport() ?? [];
  });
}

app.whenReady().then(() => {
  mainWindow = createMainWindow();
  setupIPC();
});

app.on('window-all-closed', () => {
  processMonitor?.stop();
  windowTracker?.stop();
  if (process.platform !== 'darwin') app.quit();
});
