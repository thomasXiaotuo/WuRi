
// 获取用户当前系统的时区
export function getLocalTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

// 格式化时间显示 (例如 09:00)
export function formatTimeInZone(date: Date, timezone: string): string {
    return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: timezone,
    }).format(date);
}

// 获取指定时区的日期组件 (年, 月, 日, 时, 分)
export function getDateInZone(date: Date, timezone: string): { year: number, month: number, day: number, hour: number, minute: number } {
    const parts = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
        timeZone: timezone,
    }).formatToParts(date);

    const partMap: any = {};
    parts.forEach(p => partMap[p.type] = p.value);

    return {
        year: parseInt(partMap.year),
        month: parseInt(partMap.month), // 1-12
        day: parseInt(partMap.day),
        hour: parseInt(partMap.hour), // 0-23
        minute: parseInt(partMap.minute),
    };
}

// 常用时区列表
// 常用时区列表
export const AVAILABLE_TIMEZONES = [
    { value: 'Asia/Shanghai' },
    { value: 'Asia/Tokyo' },
    { value: 'America/New_York' },
    { value: 'America/Los_Angeles' },
    { value: 'Europe/London' },
    { value: 'Europe/Paris' },
    { value: 'Australia/Sydney' },
    { value: 'UTC' },
];
