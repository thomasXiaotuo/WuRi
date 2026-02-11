import { RepeatType } from '../types';

export interface Translation {
  app: {
    title: string;
    today: string;
    prevWeek: string;
    nextWeek: string;
    newTask: string;
    toggleLeftPanel: string;
    toggleRightPanel: string;
    goodThingsTitle: string;
    improvementsTitle: string;
    goodThingLabel: (index: number) => string;
    improvementLabel: (index: number) => string;
    goodThingPlaceholder: (index: number) => string;
    improvementPlaceholder: (index: number) => string;
    timezoneSelector: string;
    timezones: Record<string, string>;
  };
  modal: {
    editTask: string;
    newTask: string;
    taskName: string;
    date: string;
    startTime: string;
    duration: string;
    repeat: string;
    timezone: string;
    endDate: string;
    location: string;
    notes: string;
    color: string;
    save: string;
    create: string;
    cancel: string;
    delete: string;
    placeholderTitle: string;
    placeholderLocation: string;
    placeholderNotes: string;
    repeatTypes: Record<RepeatType, string>;
    customInterval: (n: number) => string;
    confirmRecurringTitle: (action: 'save' | 'delete') => string;
    confirmRecurringBody: string;
    actionSingle: (action: 'save' | 'delete') => string;
    actionFuture: (action: 'save' | 'delete') => string;
    durationLabel: (h: number, m: number) => string;
  };
  datePicker: {
    months: string[];
    weekdays: string[];
    weekdaysShort: string[];
  };
}

export const zh: Translation = {
  app: {
    title: 'WuRi Calendar',
    today: '今天',
    prevWeek: '上一周',
    nextWeek: '下一周',
    newTask: '新建任务',
    toggleLeftPanel: '展开/隐藏三件好事',
    toggleRightPanel: '展开/隐藏改进记录',
    goodThingsTitle: '✨ 今日三件好事',
    improvementsTitle: '📝 今日三项改进',
    goodThingLabel: (i) => `第${['一', '二', '三'][i]}件好事`,
    improvementLabel: (i) => `第${['一', '二', '三'][i]}项改进`,
    goodThingPlaceholder: (i) => `记录今天的第${i + 1}件好事...`,
    improvementPlaceholder: (i) => `记录今天的第${i + 1}项改进...`,
    timezoneSelector: '切换查看时区',
    timezones: {
      'Asia/Shanghai': '🇨🇳 上海 (CST)',
      'Asia/Tokyo': '🇯🇵 东京 (JST)',
      'America/New_York': '🇺🇸 纽约 (EST/EDT)',
      'America/Los_Angeles': '🇺🇸 洛杉矶 (PST/PDT)',
      'Europe/London': '🇬🇧 伦敦 (GMT/BST)',
      'Europe/Paris': '🇫🇷 巴黎 (CET/CEST)',
      'Australia/Sydney': '🇦🇺 悉尼 (AEST/AEDT)',
      'UTC': '🌍 UTC',
    },
  },
  modal: {
    editTask: '编辑任务',
    newTask: '新建任务',
    taskName: '任务名称',
    date: '日期',
    startTime: '开始时间',
    duration: '时长',
    repeat: '重复',
    timezone: '时区',
    endDate: '结束日期 (可选)',
    location: '地点',
    notes: '备注 / 提醒',
    color: '颜色',
    save: '保存',
    create: '创建',
    cancel: '取消',
    delete: '删除',
    placeholderTitle: '输入任务名称...',
    placeholderLocation: '输入地点（可选）...',
    placeholderNotes: '写下需要提醒自己的事项...',
    repeatTypes: {
      none: '不重复',
      daily: '每天',
      weekly: '每周',
      monthly: '每月',
      yearly: '每年',
      custom: '自定义',
    },
    customInterval: (n) => `每 ${n} 天重复一次`,
    confirmRecurringTitle: (action) => action === 'save' ? '修改重复日程' : '删除重复日程',
    confirmRecurringBody: '这是一个重复发生的日程，您希望如何应用更改？',
    actionSingle: (action) => `仅${action === 'save' ? '修改' : '删除'}此日程`,
    actionFuture: (action) => `${action === 'save' ? '修改' : '删除'}此日程及之后所有`,
    durationLabel: (h, m) => {
      if (h > 0 && m > 0) return `${h}小时${m}分钟`;
      if (h > 0) return `${h}小时`;
      return `${m}分钟`;
    },
  },
  datePicker: {
    months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    weekdays: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    weekdaysShort: ['日', '一', '二', '三', '四', '五', '六'],
  }
};

export const en: Translation = {
  app: {
    title: 'WuRi Calendar',
    today: 'Today',
    prevWeek: 'Previous Week',
    nextWeek: 'Next Week',
    newTask: 'New Task',
    toggleLeftPanel: 'Toggle Good Things',
    toggleRightPanel: 'Toggle Improvements',
    goodThingsTitle: '✨ Three Good Things',
    improvementsTitle: '📝 Three Improvements',
    goodThingLabel: (i) => `Good Thing #${i + 1}`,
    improvementLabel: (i) => `Improvement #${i + 1}`,
    goodThingPlaceholder: (i) => `Record good thing #${i + 1}...`,
    improvementPlaceholder: (i) => `Record improvement #${i + 1}...`,
    timezoneSelector: 'Switch Timezone',
    timezones: {
      'Asia/Shanghai': '🇨🇳 Shanghai (CST)',
      'Asia/Tokyo': '🇯🇵 Tokyo (JST)',
      'America/New_York': '🇺🇸 New York (EST/EDT)',
      'America/Los_Angeles': '🇺🇸 Los Angeles (PST/PDT)',
      'Europe/London': '🇬🇧 London (GMT/BST)',
      'Europe/Paris': '🇫🇷 Paris (CET/CEST)',
      'Australia/Sydney': '🇦🇺 Sydney (AEST/AEDT)',
      'UTC': '🌍 UTC',
    },
  },
  modal: {
    editTask: 'Edit Task',
    newTask: 'New Task',
    taskName: 'Task Name',
    date: 'Date',
    startTime: 'Start Time',
    duration: 'Duration',
    repeat: 'Repeat',
    timezone: 'Timezone',
    endDate: 'End Date (Optional)',
    location: 'Location',
    notes: 'Notes',
    color: 'Color',
    save: 'Save',
    create: 'Create',
    cancel: 'Cancel',
    delete: 'Delete',
    placeholderTitle: 'Enter task name...',
    placeholderLocation: 'Enter location (optional)...',
    placeholderNotes: 'Enter notes or reminders...',
    repeatTypes: {
      none: 'None',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly',
      custom: 'Custom',
    },
    customInterval: (n) => `Every ${n} days`,
    confirmRecurringTitle: (action) => action === 'save' ? 'Edit Recurring Task' : 'Delete Recurring Task',
    confirmRecurringBody: 'This is a recurring task. How would you like to apply changes?',
    actionSingle: (action) => `Only this event`,
    actionFuture: (action) => `This and following events`,
    durationLabel: (h, m) => {
      if (h > 0 && m > 0) return `${h}h ${m}m`;
      if (h > 0) return `${h}h`;
      return `${m}m`;
    },
  },
  datePicker: {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    weekdaysShort: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  }
};
