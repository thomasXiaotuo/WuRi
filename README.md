# WuRi Calendar (吾日日历) — Daily Time Management & Self-Reflection

[English](README.md) | [中文](README.zh-CN.md)

“Every day I examine myself three times.” (The Analects of Confucius)

**WuRi (吾日)** takes its name from this classic saying, meaning "Every day I...". It is a modern Windows desktop calendar application focused on living in the moment, recording growth, and integrating ancient wisdom into daily life.
More than just a time management tool, it is a companion for daily reflection. Featuring a classic three-column layout, it helps you plan your day while recording life's moments and self-growth through "Three Good Things" and "Review & Improve".

## Features

### Three-Column Layout

| Area | Function | Description |
|------|----------|-------------|
| Left Panel | Three Good Things | Fixed three entries for recording positive moments, switches with date, supports collapse/expand |
| Center Panel | Daily Timeline | 00:00–23:30, 30-minute intervals, supports drag-and-drop creation, editing, deletion, and resizing |
| Right Panel | Review & Improve | A text area for daily reflection, switches with date, supports collapse/expand |

### Time Rules (Strict Adherence)

All tasks are fixed to **30-minute** units. Valid durations are 30, 60, 90, 120 minutes, etc. All tasks must start on the **hour** or **half-hour**.

### Core Interactions

- **Click Timeline Empty Space**: Create a new task in that time slot
- **Click Task Block**: Edit task (name, time, duration, color)
- **Drag Task Block**: Move vertically to change start time (snaps to 30-min grid)
- **Drag Bottom Handle**: Resize task duration (snaps to 30-min multiples)
- **Hover**: Show delete button for quick removal
- **Current Time Line**: Displayed only when viewing "Today"

### Data Storage

All data is keyed by "Date". Each date contains: daily calendar tasks, three good things (3 entries), and review text (1 entry). The three panels always stay in sync with the selected date.

- **Electron Environment**: Data is saved in `%APPDATA%/daily-calendar/calendar-data/`, one JSON file per day.
- **Browser Environment**: Data is saved in `localStorage` (Development Mode).

## Installation & Usage

### Method 1: Windows Installer (Recommended)

Download `WuRi Calendar (吾日日历) Setup 1.0.0.exe` and run the installer.

### Method 2: Windows Portable Version

Download `WuRi Calendar (吾日日历) 1.0.0.exe` and double-click to run directly without installation.

### Method 3: Run from Source

```bash
# Enter project directory
cd ubuntu/daily-calendar

# Install dependencies
pnpm install

# Development Mode (Browser)
pnpm run dev

# Development Mode (Electron)
pnpm run electron:dev

# Build Windows Installer
pnpm run electron:build
```

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Electron 40 | Desktop App Framework |
| React 19 | UI Framework |
| TypeScript | Type Safety |
| Vite 7 | Build Tool |
| electron-builder | Packaging Tool |

## Project Structure

```
daily-calendar/
├── electron/
│   ├── main.cjs          # Electron Main Process
│   └── preload.cjs       # Preload Script (IPC Bridge)
├── src/
│   ├── App.tsx            # Main App Component (Three-Column Layout)
│   ├── main.tsx           # React Entry
│   ├── types.ts           # Type Definitions
│   ├── components/
│   │   └── TaskModal.tsx  # Task Creation/Edit Modal
│   ├── utils/
│   │   └── storage.ts     # Data Storage Layer
│   └── styles/
│       └── global.css     # Global Styles (iCloud Style)
├── assets/
│   └── icon.png           # App Icon
└── package.json
```
