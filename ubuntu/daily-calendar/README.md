# WuRi Calendar (吾日日历)

WuRi Calendar is a daily time management and self-reflection application designed to help you track your tasks and reflect on your day. "WuRi" (吾日) comes from the Confucian saying "吾日三省吾身" (I reflect on myself three times a day).

### Features / 功能特性

- **Daily Task Management**: Create, edit, and track daily tasks.
- **Self-Reflection**: "Three Good Things" (三件好事) and "Three Improvements" (三项改进) sections to encourage gratitude and growth.
- **Timezone Support**: 
  - Automatic detection of local timezone.
  - Switch viewing timezone to plan across borders.
  - Chinese and English timezone names.
- **Recurring Tasks**: Support for daily, weekly, and monthly recurring tasks that respect timezone shifts.
- **Input Limits**: constrained input for reflection sections to encourage concise thoughts (75 units for Chinese/English).
- **Cross-Platform**: Available as a web app and a desktop application (Windows Portable & Installer).

### Tech Stack / 技术栈

- **Frontend**: React 19, TypeScript, Vite
- **Desktop Wrapper**: Electron 40
- **Build Tools**: Electron Builder
- **Styling**: CSS Modules / Global CSS

### Getting Started / 快速开始

#### Prerequisites / 前置要求

- Node.js (Latest LTS recommended)
- pnpm

#### Installation / 安装

```bash
# Install dependencies
pnpm install
```

#### Development / 开发

```bash
# Run web client
pnpm dev

# Run Electron app in dev mode
pnpm electron:dev
```

#### Build / 构建

```bash
# Build for web
pnpm build

# Build for Windows (Installer + Portable)
pnpm electron:build
```

### License

ISC
