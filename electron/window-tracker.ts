import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface WindowEvent {
  windowTitle: string;
  appName: string;
  timestamp: number;
  duration: number;
}

export interface WindowSwitchAnomaly {
  type: 'rapid-switching' | 'suspicious-app' | 'hidden-window';
  description: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high';
}

export class WindowTracker {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private events: WindowEvent[] = [];
  private anomalies: WindowSwitchAnomaly[] = [];
  private lastWindow: string = '';
  private lastSwitchTime: number = 0;
  private switchCount = 0;
  private switchWindowStart = 0;
  private onEvent: ((event: WindowEvent) => void) | null = null;

  start(callback: (event: WindowEvent) => void): void {
    this.onEvent = callback;
    this.switchWindowStart = Date.now();
    this.track();
    this.intervalId = setInterval(() => this.track(), 2000);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async track(): Promise<void> {
    try {
      const current = await this.getActiveWindow();
      const now = Date.now();

      if (current !== this.lastWindow && current) {
        const duration = this.lastSwitchTime > 0 ? now - this.lastSwitchTime : 0;

        const event: WindowEvent = {
          windowTitle: current,
          appName: current.split(' - ').pop() ?? current,
          timestamp: now,
          duration,
        };

        this.events.push(event);
        this.onEvent?.(event);

        // Detect rapid window switching (possible cheating pattern)
        this.switchCount++;
        const windowElapsed = now - this.switchWindowStart;
        if (windowElapsed > 30000) {
          // Reset window every 30s
          if (this.switchCount > 10) {
            const anomaly: WindowSwitchAnomaly = {
              type: 'rapid-switching',
              description: `${this.switchCount} window switches in ${Math.round(windowElapsed / 1000)}s — possible answer lookup pattern`,
              timestamp: now,
              severity: this.switchCount > 20 ? 'high' : 'medium',
            };
            this.anomalies.push(anomaly);
          }
          this.switchCount = 0;
          this.switchWindowStart = now;
        }

        this.lastWindow = current;
        this.lastSwitchTime = now;
      }
    } catch {
      // Silently handle tracking errors
    }
  }

  private async getActiveWindow(): Promise<string> {
    if (process.platform === 'win32') {
      try {
        const { stdout } = await execAsync(
          'powershell -Command "(Get-Process | Where-Object {$_.MainWindowHandle -ne 0} | Where-Object {$_.MainWindowTitle} | Sort-Object -Property CPU -Descending | Select-Object -First 1).MainWindowTitle"',
        );
        return stdout.trim();
      } catch {
        return '';
      }
    }

    // macOS
    if (process.platform === 'darwin') {
      try {
        const { stdout } = await execAsync(
          `osascript -e 'tell application "System Events" to get name of first process whose frontmost is true'`,
        );
        return stdout.trim();
      } catch {
        return '';
      }
    }

    return '';
  }

  getReport(): WindowEvent[] {
    return [...this.events];
  }

  getAnomalies(): WindowSwitchAnomaly[] {
    return [...this.anomalies];
  }
}
