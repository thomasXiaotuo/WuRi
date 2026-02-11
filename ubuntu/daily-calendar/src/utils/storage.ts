import { DayData, createEmptyDayData, migrateDayData, RecurringConfig, CalendarTask, generateId } from '../types';
import { getDateInZone, getLocalTimezone, formatTimeInZone } from './timezone';

// 扩展 Window 接口，声明全局 electronAPI 对象
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

const STORAGE_PREFIX = 'daily-calendar-';
const RECURRING_KEY = 'daily-calendar-recurring';

function isElectron(): boolean {
  return !!window.electronAPI;
}

export async function loadRecurringConfigs(): Promise<RecurringConfig[]> {
  if (isElectron()) {
    return await window.electronAPI!.loadRecurringConfigs();
  }
  const stored = localStorage.getItem(RECURRING_KEY);
  return stored ? JSON.parse(stored) : [];
}

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
  const d1 = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  const d2 = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  return Math.round((d1.getTime() - d2.getTime()) / oneDay);
}

// 辅助：解析 YYYY-MM-DD 为本地日期对象 (避免 UTC 偏移)
function parseLocalDate(dateStr: string): Date {
  const parts = dateStr.split('-').map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

// 将 Date 对象格式化为 YYYY-MM-DD 字符串 (本地时间)
export function formatDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 根据规则判断某天是否有该任务 (日期均视为任务所在时区的本地日期)
// 注意：此函数仅检查 "在任务定义的时区，某一天是否符合规则"。
// 它不处理跨时区转换。
function isRecurringOnDate(config: RecurringConfig, date: Date, dateStr: string): boolean {
  // 1. 检查是否在开始日期之前
  const start = parseLocalDate(config.startDate);
  // 只比较日期部分 (Local Date in Task Zone)
  const current = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());

  if (current < startDay) return false;

  // 2. 检查是否在结束日期之后
  if (config.endDate) {
    const end = parseLocalDate(config.endDate);
    if (end < current) return false;
  }

  // 3. 检查是否被排除
  if (config.excludeDates?.includes(dateStr)) return false;

  const type = config.type;

  if (type === 'daily') return true;

  if (type === 'weekly') {
    // getDay(): 0-6 (周日-周六)
    return config.weekDays?.includes(date.getDay()) ?? false;
  }

  if (type === 'monthly') {
    return date.getDate() === start.getDate();
  }

  if (type === 'yearly') {
    return date.getMonth() === start.getMonth() && date.getDate() === start.getDate();
  }

  if (type === 'custom') {
    if (!config.interval || config.interval <= 0) return false;
    const diff = diffDays(date, start);
    return diff % config.interval === 0;
  }

  return false;
}

// 加载指定日期的数据（合并重复任务）
// viewTimezone: 当前 UI 查看的时区
export async function loadDayData(dateStr: string, viewTimezone?: string): Promise<DayData> {
  const targetZone = viewTimezone || getLocalTimezone();

  // 1. 加载当天的普通数据 (普通任务存储时没有时区概念，默认视为"当地时间" -> 即当前视图时区)
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
  const generatedTasks: CalendarTask[] = [];

  // 计算目标日期的基准时间 (Local Date at 00:00:00)
  const viewDateParts = dateStr.split('-').map(Number);
  const baseViewDate = new Date(viewDateParts[0], viewDateParts[1] - 1, viewDateParts[2]);

  for (const config of recurringConfigs) {
    const taskZone = config.timezone || targetZone;

    // 检查范围：前后 1 天 (覆盖所有可能的时区偏移)
    for (let offset = -1; offset <= 1; offset++) {
      // 构造 "Candidate Date" (假设它是 TaskZone 的本地日期)
      const candidateDate = new Date(baseViewDate);
      candidateDate.setDate(candidateDate.getDate() + offset);
      const candidateDateStr = formatDateStr(candidateDate);

      // 检查在 taskZone 下，这一天是否有任务
      if (isRecurringOnDate(config, candidateDate, candidateDateStr)) {

        // 如果有，我们需要计算这个任务时刻在 TargetZone 是哪一天几点。

        // 1. 构造任务在这个 Candidate Day 的绝对时间 (UTC Timestamp)
        // 我们利用 getDateInZone 的逆操作。
        // 由于 JS Date API 缺陷，必须试探逼近。

        const year = candidateDate.getFullYear();
        const month = candidateDate.getMonth() + 1;
        const day = candidateDate.getDate();
        const hour = config.template.startHour;
        const minute = config.template.startMinute;

        // 初始猜测：假设它是 UTC
        // 实际上这不准确，但作为一个起点
        let guessTime = Date.UTC(year, month - 1, day, hour, minute);

        // 迭代修正：调整 UTC 时间，使得它在 taskZone 下显示为 target YMDHM
        // Wait, the diff logic is correct. date-fns-tz does this internally.
        // Let's implement diff correctly.
        function getPartsValue(ts: number, tz: string) {
          const p = getDateInZone(new Date(ts), tz);
          return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
        }

        const targetValue = Date.UTC(year, month - 1, day, hour, minute);
        // Reset guess (TaskZone time approx Local Time approx UTC - Offset)
        // Just start with UTC = targetValue.
        guessTime = targetValue;

        // Iteration
        for (let k = 0; k < 3; k++) {
          const currentVal = getPartsValue(guessTime, taskZone);
          const diff = currentVal - targetValue;
          if (Math.abs(diff) < 1000) break;
          guessTime -= diff;
        }

        const absoluteTaskTime = new Date(guessTime);

        // 2. 将这个绝对时间转换到 TargetZone
        const targetParts = getDateInZone(absoluteTaskTime, targetZone);

        // 3. 检查转换后的日期是否匹配当前视图日期 (dateStr)
        const targetDateStr = `${targetParts.year}-${String(targetParts.month).padStart(2, '0')}-${String(targetParts.day).padStart(2, '0')}`;

        if (targetDateStr === dateStr) {
          // 匹配！添加到列表，并更新时间
          generatedTasks.push({
            ...config.template,
            id: `recurring_${config.id}_${dateStr}_${offset}`,
            recurringId: config.id,
            recurringConfig: config,
            startHour: targetParts.hour,
            startMinute: targetParts.minute
          });
        }
      }
    }
  }

  // 3. 合并任务
  // 注意去重：如果同一个 config 在一天产生两个实例 (极其罕见，比如 offset -1 和 0 都映射到了同一天?)
  // 一般不会，除非任务间隔很短。
  dayData.tasks = [...dayData.tasks, ...generatedTasks];

  return dayData;
}

export async function saveDayData(dateStr: string, data: DayData): Promise<void> {
  // 过滤掉动态生成的重复任务
  const dataToSave = {
    ...data,
    tasks: data.tasks.filter(t => !t.recurringId)
  };

  if (isElectron()) {
    await window.electronAPI!.saveDayData(dateStr, dataToSave);
    return;
  }

  const key = STORAGE_PREFIX + dateStr;
  localStorage.setItem(key, JSON.stringify(dataToSave));
}
