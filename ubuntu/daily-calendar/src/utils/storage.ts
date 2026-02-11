import { DayData, createEmptyDayData, migrateDayData, RecurringConfig, CalendarTask, generateId } from '../types';

// 扩展 Window 接口，声明全局 electronAPI 对象
// 这个对象由 electron/preload.cjs 注入
declare global {
  interface Window {
    electronAPI?: {
      loadDayData: (dateStr: string) => Promise<DayData | null>;
      saveDayData: (dateStr: string, data: DayData) => Promise<boolean>;
      loadRecurringConfigs: () => Promise<RecurringConfig[]>;
      saveRecurringConfigs: (configs: RecurringConfig[]) => Promise<boolean>;
    };
  }
}

// 浏览器开发模式下使用的 localStorage 键前缀
const STORAGE_PREFIX = 'daily-calendar-';
const RECURRING_KEY = 'daily-calendar-recurring';

// 检查是否在 Electron 环境中运行
function isElectron(): boolean {
  return !!window.electronAPI;
}

// 加载重复任务配置
export async function loadRecurringConfigs(): Promise<RecurringConfig[]> {
  if (isElectron()) {
    return await window.electronAPI!.loadRecurringConfigs();
  }
  const stored = localStorage.getItem(RECURRING_KEY);
  return stored ? JSON.parse(stored) : [];
}

// 保存重复任务配置
export async function saveRecurringConfigs(configs: RecurringConfig[]): Promise<void> {
  if (isElectron()) {
    await window.electronAPI!.saveRecurringConfigs(configs);
    return;
  }
  localStorage.setItem(RECURRING_KEY, JSON.stringify(configs));
}

// 辅助：计算两个日期相差的天数 (dt - start)
function diffDays(dt: Date, start: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  // 忽略时分秒，仅比较日期
  const d1 = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  const d2 = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  return Math.round((d1.getTime() - d2.getTime()) / oneDay);
}

// 根据规则判断某天是否有该任务
function isRecurringOnDate(config: RecurringConfig, date: Date, dateStr: string): boolean {
  // 1. 检查是否在开始日期之前
  const start = new Date(config.startDate);
  // 只比较日期部分
  const current = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());

  if (current < startDay) return false;

  // 2. 检查是否在结束日期之后
  if (config.endDate && new Date(config.endDate) < current) return false;

  // 3. 检查是否被排除
  if (config.excludeDates?.includes(dateStr)) return false;

  const type = config.type;

  if (type === 'daily') return true;

  if (type === 'weekly') {
    // getDay(): 0-6 (周日-周六)
    // weekDays 应该也是 0-6
    return config.weekDays?.includes(date.getDay()) ?? false;
  }

  if (type === 'monthly') {
    // 按日期匹配 (例如每月 15 号)
    return date.getDate() === start.getDate();
  }

  if (type === 'yearly') {
    // 按月日匹配
    return date.getMonth() === start.getMonth() && date.getDate() === start.getDate();
  }

  if (type === 'custom') {
    // 每 N 天
    if (!config.interval || config.interval <= 0) return false;
    const diff = diffDays(date, start);
    return diff % config.interval === 0;
  }

  return false;
}

// 加载指定日期的数据（合并重复任务）
export async function loadDayData(dateStr: string): Promise<DayData> {
  // 1. 加载当天的普通数据
  let dayData: DayData;
  if (isElectron()) {
    const data = await window.electronAPI!.loadDayData(dateStr);
    dayData = data ? migrateDayData(data) : createEmptyDayData(dateStr);
  } else {
    const key = STORAGE_PREFIX + dateStr;
    const stored = localStorage.getItem(key);
    try {
      dayData = stored ? migrateDayData(JSON.parse(stored)) : createEmptyDayData(dateStr);
    } catch {
      dayData = createEmptyDayData(dateStr);
    }
  }

  // 2. 加载重复规则并生成实例
  const recurringConfigs = await loadRecurringConfigs();
  const dateParts = dateStr.split('-').map(Number);
  const currentDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

  const generatedTasks: CalendarTask[] = [];

  for (const config of recurringConfigs) {
    if (isRecurringOnDate(config, currentDate, dateStr)) {
      // 使用 config.template 生成任务
      const taskTemplate = config.template;

      generatedTasks.push({
        ...taskTemplate,
        id: `recurring_${config.id}_${dateStr}`, // 确定的 ID，格式：recurring_规则ID_日期
        recurringId: config.id,
        recurringConfig: config
      });
    }
  }

  // 3. 合并任务
  dayData.tasks = [...dayData.tasks, ...generatedTasks];

  return dayData;
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
