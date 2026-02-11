import { DayData, createEmptyDayData, migrateDayData } from '../types';

// 扩展 Window 接口，声明全局 electronAPI 对象
// 这个对象由 electron/preload.cjs 注入
declare global {
  interface Window {
    electronAPI?: {
      loadDayData: (dateStr: string) => Promise<DayData | null>;
      saveDayData: (dateStr: string, data: DayData) => Promise<boolean>;
    };
  }
}

// 浏览器开发模式下使用的 localStorage 键前缀
const STORAGE_PREFIX = 'daily-calendar-';

// 检查是否在 Electron 环境中运行
function isElectron(): boolean {
  return !!window.electronAPI;
}

// 加载指定日期的数据
// dateStr: 日期字符串
// 返回: Promise<DayData>
export async function loadDayData(dateStr: string): Promise<DayData> {
  // 如果是 Electron 环境，调用主进程 API 加载文件
  if (isElectron()) {
    const data = await window.electronAPI!.loadDayData(dateStr);
    // 如果加载到数据，进行迁移（确保格式兼容）；否则创建空数据
    return data ? migrateDayData(data) : createEmptyDayData(dateStr);
  }

  // 浏览器环境回退方案：使用 localStorage
  const key = STORAGE_PREFIX + dateStr;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return migrateDayData(JSON.parse(stored));
    } catch {
      // 解析失败，返回空数据
      return createEmptyDayData(dateStr);
    }
  }
  // 没有存储数据，返回空数据
  return createEmptyDayData(dateStr);
}

// 保存指定日期的数据
// dateStr: 日期字符串
// data: 要保存的数据对象
export async function saveDayData(dateStr: string, data: DayData): Promise<void> {
  // 如果是 Electron 环境，调用主进程 API 保存文件
  if (isElectron()) {
    await window.electronAPI!.saveDayData(dateStr, data);
    return;
  }

  // 浏览器环境回退方案：保存到 localStorage
  const key = STORAGE_PREFIX + dateStr;
  localStorage.setItem(key, JSON.stringify(data));
}
