import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ProcessInfo {
  pid: number;
  name: string;
  windowTitle: string;
  memoryMB: number;
}

export interface ProcessAlert {
  pid: number;
  name: string;
  threat: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  category: string;
  timestamp: number;
}

// Known AI tool process signatures
const AI_TOOL_SIGNATURES: Record<string, { pattern: RegExp; threat: ProcessAlert['threat']; category: string }> = {
  'ChatGPT Desktop': { pattern: /chatgpt/i, threat: 'critical', category: 'AI Assistant' },
  'Cluely': { pattern: /cluely/i, threat: 'critical', category: 'Interview Cheating Tool' },
  'Claude Desktop': { pattern: /claude/i, threat: 'high', category: 'AI Assistant' },
  'Copilot': { pattern: /github.copilot|copilot/i, threat: 'medium', category: 'AI Code Assistant' },
  'Cursor': { pattern: /cursor/i, threat: 'high', category: 'AI Code Editor' },
  'Windsurf': { pattern: /windsurf/i, threat: 'high', category: 'AI Code Editor' },
  'Gemini': { pattern: /gemini/i, threat: 'high', category: 'AI Assistant' },
  'Perplexity': { pattern: /perplexity/i, threat: 'medium', category: 'AI Search' },
  'Notion AI': { pattern: /notion/i, threat: 'low', category: 'Productivity with AI' },
  'Grammarly': { pattern: /grammarly/i, threat: 'low', category: 'Writing Assistant' },
  'Screen Share Tools': { pattern: /obs|streamlabs|screenrec/i, threat: 'medium', category: 'Screen Recording' },
  'Remote Desktop': { pattern: /anydesk|teamviewer|remote\s*desktop/i, threat: 'critical', category: 'Remote Access' },
};

export class ProcessMonitor {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private alerts: ProcessAlert[] = [];
  private seenPids = new Set<number>();
  private onAlert: ((alert: ProcessAlert) => void) | null = null;

  start(callback: (alert: ProcessAlert) => void): void {
    this.onAlert = callback;
    this.scan(); // immediate first scan
    this.intervalId = setInterval(() => this.scan(), 5000);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async scan(): Promise<void> {
    try {
      const processes = await this.listProcesses();

      for (const proc of processes) {
        for (const [toolName, sig] of Object.entries(AI_TOOL_SIGNATURES)) {
          if (sig.pattern.test(proc.name) || sig.pattern.test(proc.windowTitle)) {
            const alertKey = `${proc.pid}-${toolName}`;
            if (!this.seenPids.has(proc.pid)) {
              this.seenPids.add(proc.pid);
              const alert: ProcessAlert = {
                pid: proc.pid,
                name: toolName,
                threat: sig.threat,
                reason: `Detected "${proc.name}" (PID ${proc.pid}) — matches known ${sig.category} signature`,
                category: sig.category,
                timestamp: Date.now(),
              };
              this.alerts.push(alert);
              this.onAlert?.(alert);
            }
          }
        }
      }
    } catch {
      // Silently handle scan errors
    }
  }

  private async listProcesses(): Promise<ProcessInfo[]> {
    // Windows: use tasklist
    if (process.platform === 'win32') {
      const { stdout } = await execAsync(
        'powershell -Command "Get-Process | Select-Object Id,ProcessName,MainWindowTitle,@{Name=\'MemMB\';Expression={[math]::Round($_.WorkingSet64/1MB,1)}} | ConvertTo-Json"',
        { maxBuffer: 10 * 1024 * 1024 },
      );
      const raw = JSON.parse(stdout);
      const list = Array.isArray(raw) ? raw : [raw];
      return list.map((p: Record<string, unknown>) => ({
        pid: Number(p.Id) || 0,
        name: String(p.ProcessName ?? ''),
        windowTitle: String(p.MainWindowTitle ?? ''),
        memoryMB: Number(p.MemMB) || 0,
      }));
    }

    // macOS/Linux: use ps
    const { stdout } = await execAsync('ps -eo pid,comm');
    return stdout
      .split('\n')
      .slice(1)
      .filter(Boolean)
      .map((line) => {
        const parts = line.trim().split(/\s+/);
        return {
          pid: parseInt(parts[0], 10),
          name: parts.slice(1).join(' '),
          windowTitle: '',
          memoryMB: 0,
        };
      });
  }

  getSnapshot(): ProcessInfo[] {
    // Return empty array synchronously — caller should use getProcessSnapshot IPC
    return [];
  }

  getReport(): ProcessAlert[] {
    return [...this.alerts];
  }
}
