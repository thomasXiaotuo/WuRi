// 核心数据类型定义

// 重复类型：无、每天、每周、每月、每年、自定义
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

// 重复任务配置
export interface RecurringConfig {
  id: string;          // 规则的唯一标识符
  type: RepeatType;    // 重复类型
  interval?: number;   // 间隔 (用于 custom, 或 daily/weekly/monthly/yearly 的 "每 N ...")
  weekDays?: number[]; // 每周的哪些天 (0-6, 周日-周六)
  startDate: string;   // 开始日期 (YYYY-MM-DD), 用于计算间隔和确定月/日的基准
  endDate?: string;    // 结束日期 (YYYY-MM-DD, 可选)
  excludeDates?: string[]; // 排除的日期 (YYYY-MM-DD, 用于删除单次实例)
  timezone?: string; // 重复任务的时区 (e.g. 'Asia/Shanghai')
  template: Omit<CalendarTask, 'id' | 'recurringId' | 'recurringConfig'>; // 任务模板数据
}

// 日历任务接口
export interface CalendarTask {
  id: string;          // 任务唯一标识符
  title: string;       // 任务标题
  startHour: number;   // 开始小时 (0-23)
  startMinute: number; // 开始分钟 (0 或 30)
  duration: number;    // 持续时间（分钟），必须是 30 的倍数
  color: string;       // 任务颜色（十六进制代码）
  location?: string;   // 地点（可选）
  notes?: string;      // 备注/提醒（可选）
  recurringId?: string; // 如果是重复任务实例，指向 RecurringConfig.id
  recurringConfig?: RecurringConfig; // 原始配置 (通常只在创建/编辑规则时存在)
}

// “每日三件好事”接口
export interface ThreeGoodThings {
  thing1: string;
  thing2: string;
  thing3: string;
}

// “每日改进”接口
export interface ThreeImprovements {
  item1: string;
  item2: string;
  item3: string;
}

// 每日数据总结构
export interface DayData {
  date: string;       // 日期字符串，格式：YYYY-MM-DD
  tasks: CalendarTask[]; // 当天的任务列表
  goodThings: ThreeGoodThings; // 当天的三件好事
  improvements: ThreeImprovements; // 当天的改进事项
  // 遗留字段，用于旧数据迁移（如果有）
  improvement?: string;
}

// 创建空的每日数据对象
export function createEmptyDayData(dateStr: string): DayData {
  return {
    date: dateStr,
    tasks: [],
    goodThings: { thing1: '', thing2: '', thing3: '' },
    improvements: { item1: '', item2: '', item3: '' },
  };
}

/** 迁移旧数据格式（单个改进事项）到新格式（三个改进事项） */
export function migrateDayData(data: DayData): DayData {
  if (!data.improvements) {
    data.improvements = {
      item1: data.improvement || '',
      item2: '',
      item3: '',
    };
  }
  return data;
}

// 生成唯一 ID
export function generateId(): string {
  // 结合当前时间戳和随机数生成
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

// 时间处理辅助函数

// 格式化时间显示 (例如: 09:30)
export function formatTime(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

// 将分钟数吸附到最近的 30 分钟网格
export function snapToGrid(minutes: number): number {
  return Math.round(minutes / 30) * 30;
}

// 将具体时间转换为时间槽索引 (每小时 2 个槽，共 48 个槽)
export function minutesToSlot(hour: number, minute: number): number {
  return hour * 2 + (minute >= 30 ? 1 : 0);
}

// 将时间槽索引转换为具体时间
export function slotToTime(slot: number): { hour: number; minute: number } {
  return {
    hour: Math.floor(slot / 2),
    minute: (slot % 2) * 30,
  };
}

// 日期处理辅助函数

// 将 Date 对象格式化为 YYYY-MM-DD 字符串
export function formatDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 判断两个 Date 对象是否是同一天
export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

// 判断给定日期是否是今天
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/** 获取给定日期所在周的周一 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=周日, 1=周一, ...
  const diff = day === 0 ? -6 : 1 - day; // 调整到周一
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0); // 重置时间为 00:00
  return d;
}

/** 获取从周一开始的 7 天日期数组 */
export function getWeekDays(weekStart: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

// 常量定义
export const TOTAL_SLOTS = 48; // 总时间槽数 (24小时 * 2)
export const SLOT_HEIGHT = 56; // 每个 30 分钟槽的高度 (像素)

// 任务颜色选项
export const TASK_COLORS = [
  '#5E97F6', // 蓝色
  '#E67C73', // 红色
  '#F6BF26', // 黄色
  '#33B679', // 绿色
  '#8E24AA', // 紫色
  '#039BE5', // 浅蓝
  '#F4511E', // 橙色
  '#616161', // 灰色
  '#D81B60', // 粉色
  '#0B8043', // 深绿
];

// 星期名称
export const WEEKDAY_NAMES = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
export const WEEKDAY_NAMES_SHORT = ['一', '二', '三', '四', '五', '六', '日'];
