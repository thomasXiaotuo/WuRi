const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// 定义数据存储目录
// app.getPath('userData') 获取系统的用户数据目录
// Windows: %APPDATA%/daily-calendar/calendar-data
const DATA_DIR = path.join(app.getPath('userData'), 'calendar-data');

// 如果数据目录不存在，则创建它
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 获取指定日期的数据文件路径
// dateStr: 日期字符串，如 "2023-10-27"
function getDataFilePath(dateStr) {
  return path.join(DATA_DIR, `${dateStr}.json`);
}

// 加载指定日期的数据
// 如果文件存在，读取并解析 JSON；否则返回 null
function loadDayData(dateStr) {
  const filePath = getDataFilePath(dateStr);
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
      return null;
    }
  }
  return null;
}

// 保存指定日期的数据
// 将数据对象转换为 JSON 字符串并写入文件
function saveDayData(dateStr, data) {
  const filePath = getDataFilePath(dateStr);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

let mainWindow;

// 创建应用主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400, // 窗口宽度
    height: 900, // 窗口高度
    minWidth: 1000, // 最小宽度
    minHeight: 700, // 最小高度
    title: 'Daily Calendar', // 窗口标题
    webPreferences: {
      nodeIntegration: false, // 禁用 Node.js 集成（安全性）
      contextIsolation: true, // 启用上下文隔离（安全性）
      preload: path.join(__dirname, 'preload.cjs'), // 加载预加载脚本
    },
    icon: path.join(__dirname, '..', 'assets', 'icon.png'), // 设置图标
  });

  // 根据环境加载不同的 URL
  // VITE_DEV_SERVER_URL 环境变量由 Vite 在开发模式下设置
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    // 生产模式加载打包后的文件
    mainWindow.loadFile(path.join(__dirname, '..', 'dist-renderer', 'index.html'));
  }
}

// IPC 处理程序：处理来自渲染进程的消息

// 处理加载数据的请求
ipcMain.handle('load-day-data', (event, dateStr) => {
  return loadDayData(dateStr);
});

// 处理保存数据的请求
ipcMain.handle('save-day-data', (event, dateStr, data) => {
  saveDayData(dateStr, data);
  return true;
});

// 重复任务文件路径
const RECURRING_FILE = path.join(DATA_DIR, 'recurring.json');

// 加载重复任务配置
function loadRecurringConfigs() {
  if (fs.existsSync(RECURRING_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(RECURRING_FILE, 'utf-8'));
    } catch {
      return [];
    }
  }
  return [];
}

// 保存重复任务配置
function saveRecurringConfigs(configs) {
  fs.writeFileSync(RECURRING_FILE, JSON.stringify(configs, null, 2), 'utf-8');
}

// IPC: 加载重复任务
ipcMain.handle('load-recurring-configs', () => {
  return loadRecurringConfigs();
});

// IPC: 保存重复任务
ipcMain.handle('save-recurring-configs', (event, configs) => {
  saveRecurringConfigs(configs);
  return true;
});

// 当 Electron 初始化完成时创建窗口
app.whenReady().then(createWindow);

// 当所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  // 如果没有窗口打开，则新建一个（macOS 常见行为）
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
