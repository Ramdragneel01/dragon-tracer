import type { ProcessAlert, WindowEvent } from '../types';

const AI_TOOL_NAMES = [
  { name: 'ChatGPT Desktop', threat: 'critical' as const, category: 'AI Assistant' },
  { name: 'Cluely', threat: 'critical' as const, category: 'Interview Cheating Tool' },
  { name: 'Claude Desktop', threat: 'high' as const, category: 'AI Assistant' },
  { name: 'Cursor Editor', threat: 'high' as const, category: 'AI Code Editor' },
  { name: 'GitHub Copilot', threat: 'medium' as const, category: 'AI Code Assistant' },
  { name: 'Perplexity Search', threat: 'medium' as const, category: 'AI Search' },
];

const WINDOW_TITLES = [
  'Visual Studio Code',
  'Google Chrome - LeetCode',
  'Terminal',
  'ChatGPT - Google Chrome',
  'Zoom Meeting',
  'Slack',
  'Notepad++',
  'Stack Overflow - Google Chrome',
  'Firefox - MDN Web Docs',
  'File Explorer',
];

/**
 * Simulates Tracer monitoring behavior for demo/browser mode.
 * In production Electron, real process-monitor.ts and window-tracker.ts are used.
 */
export class DemoSimulator {
  private alertInterval: ReturnType<typeof setInterval> | null = null;
  private windowInterval: ReturnType<typeof setInterval> | null = null;
  private onAlert: ((alert: ProcessAlert) => void) | null = null;
  private onWindow: ((event: WindowEvent) => void) | null = null;
  private alertsEmitted = 0;
  private lastWindowTime = Date.now();

  start(
    onAlert: (alert: ProcessAlert) => void,
    onWindow: (event: WindowEvent) => void,
  ): void {
    this.onAlert = onAlert;
    this.onWindow = onWindow;

    // Emit a random window-switch every 3-8 seconds
    this.windowInterval = setInterval(() => {
      const now = Date.now();
      const title = WINDOW_TITLES[Math.floor(Math.random() * WINDOW_TITLES.length)];
      const event: WindowEvent = {
        windowTitle: title,
        appName: title.split(' - ')[0],
        timestamp: now,
        duration: now - this.lastWindowTime,
      };
      this.lastWindowTime = now;
      this.onWindow?.(event);
    }, 3000 + Math.random() * 5000);

    // Emit first AI-tool alert after 8-15 seconds, then another after 20-40s
    setTimeout(() => {
      this.emitAlert();
      setTimeout(() => this.emitAlert(), 20000 + Math.random() * 20000);
    }, 8000 + Math.random() * 7000);
  }

  private emitAlert(): void {
    if (this.alertsEmitted >= AI_TOOL_NAMES.length) return;
    const tool = AI_TOOL_NAMES[this.alertsEmitted];
    const alert: ProcessAlert = {
      pid: 1000 + Math.floor(Math.random() * 9000),
      name: tool.name,
      threat: tool.threat,
      reason: `Detected "${tool.name.toLowerCase()}.exe" running — matches known ${tool.category} signature`,
      category: tool.category,
      timestamp: Date.now(),
    };
    this.alertsEmitted++;
    this.onAlert?.(alert);
  }

  stop(): void {
    if (this.alertInterval) clearInterval(this.alertInterval);
    if (this.windowInterval) clearInterval(this.windowInterval);
    this.alertInterval = null;
    this.windowInterval = null;
  }
}
