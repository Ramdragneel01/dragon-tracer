# Dragon Tracer

> AI-powered interview integrity platform that detects AI-assisted cheating, monitors suspicious processes, analyzes behavioral anomalies, and generates integrity reports.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Electron](https://img.shields.io/badge/Electron-35-9feaf9?logo=electron)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://reactjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## What It Does

Dragon Tracer monitors a candidate's machine during remote technical interviews to detect AI-assisted cheating in real time. It scans running processes for known AI tools, tracks window-switching patterns for suspicious behavior, calculates an integrity score, and produces a detailed audit report.

| Feature | Description |
|---------|-------------|
| **Process Scanning** | Detects ChatGPT, Cluely, Claude, Cursor, Windsurf, Copilot, remote desktop tools, and more |
| **Window Tracking** | Monitors focus changes, detects rapid alt-tab patterns linked to answer lookup |
| **Integrity Scoring** | 0–100 composite score (60% process integrity + 40% behavior integrity) |
| **Real-Time Alerts** | Instant threat-level alerts (critical / high / medium / low) as detections occur |
| **Integrity Reports** | Exportable Markdown reports with verdict, threat breakdown, and recommendations |
| **Demo Mode** | Full simulation in browser — no Electron required for evaluation |

## How Detection Works

```
┌─────────────────────────────────────────────────┐
│             Candidate's Machine                 │
├────────────────────┬────────────────────────────┤
│  Process Monitor   │    Window Tracker          │
│  (5s scan cycle)   │    (2s poll cycle)         │
│                    │                            │
│  ┌──────────────┐  │  ┌───────────────────┐    │
│  │ Get-Process   │  │  │ Active window     │    │
│  │ → match known │  │  │ title + duration  │    │
│  │   AI tool     │  │  │ → rapid-switch    │    │
│  │   signatures  │  │  │   anomaly detect  │    │
│  └──────┬───────┘  │  └──────┬────────────┘    │
│         │          │         │                  │
│         ▼          │         ▼                  │
│   ProcessAlert     │   WindowEvent              │
└────────┬───────────┴─────────┬──────────────────┘
         │                     │
         ▼                     ▼
  ┌──────────────────────────────────┐
  │        Integrity Engine          │
  │  score = 0.6×process + 0.4×behav │
  │  verdict: clean|suspicious|flagged│
  └──────────────┬───────────────────┘
                 │
                 ▼
  ┌──────────────────────────────────┐
  │     Dashboard + Report Export    │
  └──────────────────────────────────┘
```

### Known AI Tool Signatures

| Tool | Threat Level | Category |
|------|:----------:|----------|
| ChatGPT Desktop | 🔴 Critical | AI Assistant |
| Cluely | 🔴 Critical | Interview Cheating Tool |
| AnyDesk / TeamViewer | 🔴 Critical | Remote Access |
| Claude Desktop | 🟠 High | AI Assistant |
| Cursor | 🟠 High | AI Code Editor |
| Windsurf | 🟠 High | AI Code Editor |
| GitHub Copilot | 🟡 Medium | AI Code Assistant |
| Perplexity | 🟡 Medium | AI Search |
| OBS / Screen Recorder | 🟡 Medium | Screen Recording |
| Grammarly | 🔵 Low | Writing Assistant |
| Notion | 🔵 Low | Productivity |

## Architecture

```
dragon-tracer/
├── electron/                   # Electron main process
│   ├── main.ts                 # App shell, IPC, window management
│   ├── preload.ts              # Context bridge (tracerAPI)
│   ├── process-monitor.ts      # OS process scanning + AI tool signature matching
│   └── window-tracker.ts       # Active window polling + rapid-switch detection
├── src/
│   ├── components/
│   │   ├── Sidebar.tsx          # Score display, session controls
│   │   ├── SessionSetup.tsx     # Candidate name + role input form
│   │   ├── LiveDashboard.tsx    # Real-time monitoring view with stats grid
│   │   ├── AlertFeed.tsx        # Chronological threat alert list
│   │   ├── ThreatGauge.tsx      # SVG half-circle integrity gauge
│   │   ├── ActivityTimeline.tsx # Window-switch event timeline
│   │   └── ReportView.tsx       # Post-session integrity report
│   ├── hooks/
│   │   └── useSession.ts        # Session lifecycle + Electron/demo mode switching
│   ├── services/
│   │   ├── integrity-engine.ts  # Score calculation + report generation
│   │   └── demo-simulator.ts    # Browser-mode threat simulation
│   ├── types.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

### Tech Stack

- **Electron 35** — native process access + window management
- **React 19** + **TypeScript 5.8** — UI framework
- **Vite 6** — bundler with HMR
- **Tailwind CSS 3** — utility-first styling
- **Recharts** — data visualization (extensible)
- **PowerShell / osascript** — OS-level process enumeration

## Getting Started

### Prerequisites

- Node.js ≥ 18

### Install & Run

```bash
git clone https://github.com/Ramdragneel01/dragon-tracer.git
cd dragon-tracer
npm install

# Browser demo mode (simulated threats)
npm run dev

# Full Electron app (real process monitoring)
npm run electron:dev
```

### Build for Distribution

```bash
npm run electron:build
```

Outputs to `release/`.

## Usage

1. **Start a session** — enter candidate name and role
2. **Monitor** — the dashboard shows live integrity score, process alerts, and window activity
3. **End session** — view the full report with verdict and recommendations
4. **Export** — download a Markdown integrity report for your records

### Scoring

| Score Range | Verdict | Action |
|:-----------:|---------|--------|
| 80–100 | **CLEAN** | No concerns |
| 60–79 | **SUSPICIOUS** | Manual review recommended |
| 0–59 | **FLAGGED** | Interview should be invalidated |

## Counterpart: Dragon TipOff

Dragon Tracer and [Dragon TipOff](https://github.com/Ramdragneel01/dragon-tipoff) are **adversarial counterparts**:

- **TipOff** = the sword — real-time AI assistant for interview candidates
- **Tracer** = the shield — detects tools like TipOff running during interviews

Together they demonstrate the full red-team / blue-team surface of AI-assisted interview fraud.

## License

MIT © Ram Prakash Dhulipudi
