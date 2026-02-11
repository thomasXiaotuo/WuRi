import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  DayData,
  CalendarTask,
  createEmptyDayData,
  generateId,
  formatTime,
  formatDateStr,
  isToday,
  isSameDay,
  getWeekStart,
  getWeekDays,
  TOTAL_SLOTS,
  SLOT_HEIGHT,
  slotToTime,
  WEEKDAY_NAMES,
} from './types';
import { loadDayData, saveDayData } from './utils/storage';
import TaskModal from './components/TaskModal';
import DatePicker from './components/DatePicker';

// SVG 图标组件 define
const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 12L6 8l4-4" />
  </svg>
);
const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 12l4-4-4-4" />
  </svg>
);
const SidebarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="14" height="12" rx="2" />
    <line x1="6.5" y1="3" x2="6.5" y2="15" />
  </svg>
);
const SidebarRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="14" height="12" rx="2" />
    <line x1="11.5" y1="3" x2="11.5" y2="15" />
  </svg>
);
const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="9" y1="4" x2="9" y2="14" />
    <line x1="4" y1="9" x2="14" y2="9" />
  </svg>
);

const WEEKDAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

// 主应用组件
export default function App() {
  // --- 状态管理 ---
  const [selectedDate, setSelectedDate] = useState(new Date()); // 当前选中的日期
  const [weekDays, setWeekDays] = useState<Date[]>([]); // 当前周的日期列表
  const [weekDataMap, setWeekDataMap] = useState<Record<string, DayData>>({}); // 缓存一周的数据
  const [leftPanelOpen, setLeftPanelOpen] = useState(true); // 左侧面板开关状态
  const [rightPanelOpen, setRightPanelOpen] = useState(true); // 右侧面板开关状态

  // 模态框状态
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<CalendarTask | null>(null); // 正在编辑的任务（新建为 null）
  const [modalDefaults, setModalDefaults] = useState<{ startHour: number; startMinute: number; dateStr: string } | null>(null);
  const [modalDateStr, setModalDateStr] = useState(''); // 模态框当前日期的字符串形式

  const [currentTime, setCurrentTime] = useState(new Date()); // 当前系统时间（用于显示红线）

  // 拖拽状态
  const [dragState, setDragState] = useState<{
    taskId: string;
    dateStr: string;
    type: 'move' | 'resize'; // 移动还是改变大小
    startY: number; // 拖拽起始 Y 坐标
    originalTask: CalendarTask; // 原始任务数据
  } | null>(null);

  const timelineRef = useRef<HTMLDivElement>(null); // 时间轴滚动容器的引用
  const saveTimeoutRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({}); // 防抖保存定时器
  const weekDataMapRef = useRef(weekDataMap); // 用于在事件监听器中访问最新的 state

  // 保持 ref 与 state 同步
  useEffect(() => { weekDataMapRef.current = weekDataMap; }, [weekDataMap]);

  // --- 副作用 ---

  // 当选中日期变化时，计算该周的日期列表
  useEffect(() => {
    const ws = getWeekStart(selectedDate);
    setWeekDays(getWeekDays(ws));
  }, [selectedDate]);

  // 当周日期列表变化时，加载这一周的所有数据
  useEffect(() => {
    if (weekDays.length === 0) return;
    const loadAll = async () => {
      const map: Record<string, DayData> = {};
      for (const day of weekDays) {
        const ds = formatDateStr(day);
        map[ds] = await loadDayData(ds);
      }
      setWeekDataMap(map);
    };
    loadAll();
  }, [weekDays]);

  // 定时更新当前时间（每 30 秒）
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // 初始加载或切换周时，自动滚动到当前时间
  useEffect(() => {
    if (timelineRef.current) {
      const now = new Date();
      const mins = now.getHours() * 60 + now.getMinutes();
      // 滚动位置：当前时间减去 200px 的缓冲，避免贴顶
      timelineRef.current.scrollTop = Math.max(0, (mins / 30) * SLOT_HEIGHT - 200);
    }
  }, [weekDays]);

  // --- 辅助函数 ---

  // 防抖保存数据（避免频繁写入文件）
  const scheduleSave = useCallback((dateStr: string, data: DayData) => {
    if (saveTimeoutRef.current[dateStr]) clearTimeout(saveTimeoutRef.current[dateStr]);
    saveTimeoutRef.current[dateStr] = setTimeout(() => { saveDayData(dateStr, data); }, 400);
  }, []);

  const goToday = () => setSelectedDate(new Date());
  const goPrevWeek = () => { const d = new Date(selectedDate); d.setDate(d.getDate() - 7); setSelectedDate(d); };
  const goNextWeek = () => { const d = new Date(selectedDate); d.setDate(d.getDate() + 7); setSelectedDate(d); };

  const selectedDateStr = formatDateStr(selectedDate);
  // 获取当前选中日期的数据，如果没有则创建空数据
  const selectedDayData = weekDataMap[selectedDateStr] || createEmptyDayData(selectedDateStr);

  // --- 数据更新处理 ---

  // 更新“三件好事”
  const updateGoodThing = (field: 'thing1' | 'thing2' | 'thing3', value: string) => {
    const ds = selectedDateStr;
    const current = weekDataMap[ds] || createEmptyDayData(ds);
    const newData = { ...current, goodThings: { ...current.goodThings, [field]: value } };
    setWeekDataMap((prev) => ({ ...prev, [ds]: newData }));
    scheduleSave(ds, newData);
  };

  // 更新“三项改进”
  const updateImprovement = (field: 'item1' | 'item2' | 'item3', value: string) => {
    const ds = selectedDateStr;
    const current = weekDataMap[ds] || createEmptyDayData(ds);
    const newData = { ...current, improvements: { ...current.improvements, [field]: value } };
    setWeekDataMap((prev) => ({ ...prev, [ds]: newData }));
    scheduleSave(ds, newData);
  };

  // --- 任务操作处理 ---

  // 点击空白时间槽：准备新建任务
  const handleCellClick = (dateStr: string, slot: number) => {
    const { hour, minute } = slotToTime(slot);
    setEditingTask(null);
    setModalDefaults({ startHour: hour, startMinute: minute, dateStr });
    setModalDateStr(dateStr);
    setShowModal(true);
  };

  // 点击已存在的任务：准备编辑
  const handleTaskClick = (dateStr: string, task: CalendarTask, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTask(task);
    setModalDefaults(null);
    setModalDateStr(dateStr);
    setShowModal(true);
  };

  // 点击顶部“新建”按钮
  const handleAddTask = () => {
    setEditingTask(null);
    setModalDefaults({ startHour: 9, startMinute: 0, dateStr: selectedDateStr });
    setModalDateStr(selectedDateStr);
    setShowModal(true);
  };

  // 保存任务（新建或更新）
  const handleSaveTask = (task: CalendarTask, targetDateStr: string) => {
    // 如果是编辑任务，且日期发生了改变
    if (editingTask && targetDateStr !== modalDateStr) {
      // 1. 从旧日期中删除
      const oldData = weekDataMap[modalDateStr] || createEmptyDayData(modalDateStr);
      const oldTasks = oldData.tasks.filter((t) => t.id !== editingTask.id);
      const newOldData = { ...oldData, tasks: oldTasks };
      setWeekDataMap((prev) => ({ ...prev, [modalDateStr]: newOldData }));
      scheduleSave(modalDateStr, newOldData);

      // 2. 添加到新日期
      const newDateData = weekDataMap[targetDateStr] || createEmptyDayData(targetDateStr);
      const newTasks = [...newDateData.tasks, { ...task, id: generateId() }];
      const newNewData = { ...newDateData, tasks: newTasks };
      setWeekDataMap((prev) => ({ ...prev, [targetDateStr]: newNewData }));
      scheduleSave(targetDateStr, newNewData);
    } else {
      // 仅在当前日期修改或新建
      const ds = targetDateStr;
      const current = weekDataMap[ds] || createEmptyDayData(ds);
      let newTasks: CalendarTask[];
      if (editingTask) {
        // 更新现有任务
        newTasks = current.tasks.map((t) => (t.id === task.id ? task : t));
      } else {
        // 添加新任务
        newTasks = [...current.tasks, { ...task, id: generateId() }];
      }
      const newData = { ...current, tasks: newTasks };
      setWeekDataMap((prev) => ({ ...prev, [ds]: newData }));
      scheduleSave(ds, newData);
    }
    setShowModal(false);
    setEditingTask(null);
  };

  // 删除任务
  const handleDeleteTask = (taskId: string) => {
    const ds = modalDateStr;
    const current = weekDataMap[ds] || createEmptyDayData(ds);
    const newTasks = current.tasks.filter((t) => t.id !== taskId);
    const newData = { ...current, tasks: newTasks };
    setWeekDataMap((prev) => ({ ...prev, [ds]: newData }));
    scheduleSave(ds, newData);
    setShowModal(false);
    setEditingTask(null);
  };

  // 快速删除
  const handleQuickDelete = (dateStr: string, taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const current = weekDataMap[dateStr] || createEmptyDayData(dateStr);
    const newTasks = current.tasks.filter((t) => t.id !== taskId);
    const newData = { ...current, tasks: newTasks };
    setWeekDataMap((prev) => ({ ...prev, [dateStr]: newData }));
    scheduleSave(dateStr, newData);
  };

  // --- 拖拽与调整大小逻辑 ---
  const handleDragStart = (dateStr: string, taskId: string, type: 'move' | 'resize', e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const dayData = weekDataMap[dateStr];
    if (!dayData) return;
    const task = dayData.tasks.find((t) => t.id === taskId);
    if (!task) return;

    // 记录拖拽初始状态
    const state = { taskId, dateStr, type, startY: e.clientY, originalTask: { ...task } };
    setDragState(state);

    const handleMouseMove = (ev: MouseEvent) => {
      const deltaY = ev.clientY - state.startY;
      // 计算垂直移动了多少个 30 分钟槽
      const slotDelta = Math.round(deltaY / SLOT_HEIGHT);

      const currentMap = weekDataMapRef.current;
      const currentDayData = currentMap[dateStr];
      if (!currentDayData) return;
      const currentTask = currentDayData.tasks.find((t) => t.id === taskId);
      if (!currentTask) return;

      if (type === 'move') {
        // 移动模式：改变开始时间
        const originalSlot = state.originalTask.startHour * 2 + (state.originalTask.startMinute === 30 ? 1 : 0);
        let newSlot = originalSlot + slotDelta;
        const taskSlots = state.originalTask.duration / 30;
        // 限制边界
        newSlot = Math.max(0, Math.min(TOTAL_SLOTS - taskSlots, newSlot));
        const { hour, minute } = slotToTime(newSlot);

        // 如果时间发生变化，更新状态
        if (currentTask.startHour !== hour || currentTask.startMinute !== minute) {
          const newTasks = currentDayData.tasks.map((t) =>
            t.id === taskId ? { ...t, startHour: hour, startMinute: minute } : t
          );
          const newData = { ...currentDayData, tasks: newTasks };
          setWeekDataMap((prev) => ({ ...prev, [dateStr]: newData }));
          scheduleSave(dateStr, newData);
        }
      } else {
        // 调整大小模式：改变时长
        const originalSlots = state.originalTask.duration / 30;
        let newSlots = originalSlots + slotDelta;
        newSlots = Math.max(1, newSlots); // 至少 30 分钟

        const startSlot = state.originalTask.startHour * 2 + (state.originalTask.startMinute === 30 ? 1 : 0);
        // 限制不超过当天末尾
        if (startSlot + newSlots > TOTAL_SLOTS) newSlots = TOTAL_SLOTS - startSlot;

        const newDuration = newSlots * 30;
        if (currentTask.duration !== newDuration) {
          const newTasks = currentDayData.tasks.map((t) =>
            t.id === taskId ? { ...t, duration: newDuration } : t
          );
          const newData = { ...currentDayData, tasks: newTasks };
          setWeekDataMap((prev) => ({ ...prev, [dateStr]: newData }));
          scheduleSave(dateStr, newData);
        }
      }
    };

    const handleMouseUp = () => {
      setDragState(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // 获取当前时间在时间轴上的像素位置
  const getCurrentTimePosition = (): number | null => {
    const mins = currentTime.getHours() * 60 + currentTime.getMinutes();
    return (mins / 30) * SLOT_HEIGHT;
  };

  const todayInWeek = weekDays.some((d) => isToday(d));
  const currentTimePos = todayInWeek ? getCurrentTimePosition() : null;
  const todayColIndex = weekDays.findIndex((d) => isToday(d));

  // 为模态框准备的周日期选项
  const weekDateOptions = weekDays.map((d) => ({
    dateStr: formatDateStr(d),
    label: `${d.getMonth() + 1}月${d.getDate()}日 ${WEEKDAY_LABELS[weekDays.indexOf(d)]}`,
  }));

  // 渲染左侧时间标签列
  const renderTimeLabels = () => {
    const labels = [];
    for (let i = 0; i < TOTAL_SLOTS; i++) {
      const { hour, minute } = slotToTime(i);
      const isHourStart = minute === 0;
      labels.push(
        <div key={i} className={`wk-time-label-row ${isHourStart ? 'hour-start' : ''}`}>
          {isHourStart ? formatTime(hour, 0) : ''}
        </div>
      );
    }
    return labels;
  };

  // 渲染单日列
  const renderDayColumn = (date: Date, colIdx: number) => {
    const ds = formatDateStr(date);
    const dayData = weekDataMap[ds] || createEmptyDayData(ds);
    const isSelected = isSameDay(date, selectedDate);
    const isTodayCol = isToday(date);

    return (
      <div key={ds} className={`wk-day-col ${isSelected ? 'selected' : ''} ${isTodayCol ? 'is-today' : ''}`}>
        {/* 背景网格 */}
        {Array.from({ length: TOTAL_SLOTS }).map((_, i) => (
          <div key={i} className={`wk-slot ${i % 2 === 0 ? 'hour-start' : ''}`} onClick={() => handleCellClick(ds, i)} />
        ))}
        {/* 任务块 */}
        {dayData.tasks.map((task) => {
          const startSlot = task.startHour * 2 + (task.startMinute === 30 ? 1 : 0);
          const slots = task.duration / 30;
          const top = startSlot * SLOT_HEIGHT;
          const height = slots * SLOT_HEIGHT - 2; // 留一点间隙
          const endMinutes = task.startHour * 60 + task.startMinute + task.duration;
          const endHour = Math.floor(endMinutes / 60);
          const endMinute = endMinutes % 60;
          const isDragging = dragState?.taskId === task.id && dragState?.dateStr === ds;
          const hasLocation = task.location && task.location.trim();
          const hasNotes = task.notes && task.notes.trim();

          return (
            <div
              key={task.id}
              className={`task-block ${isDragging ? 'dragging' : ''}`}
              style={{ top: `${top}px`, height: `${height}px`, backgroundColor: task.color, left: '2px', right: '2px' }}
              onClick={(e) => handleTaskClick(ds, task, e)}
              onMouseDown={(e) => handleDragStart(ds, task.id, 'move', e)}
            >
              <div className="task-block-title">{task.title}</div>
              {/* 根据高度动态显示详细信息 */}
              {height > 36 && (
                <div className="task-block-time">
                  {formatTime(task.startHour, task.startMinute)} – {formatTime(endHour, endMinute)}
                </div>
              )}
              {height > 54 && hasLocation && (
                <div className="task-block-location">📍 {task.location}</div>
              )}
              {height > 72 && hasNotes && (
                <div className="task-block-notes">📝 {task.notes}</div>
              )}
              <button className="task-block-delete" onClick={(e) => handleQuickDelete(ds, task.id, e)} title="删除">×</button>
              {/* 底部调整大小手柄 */}
              <div className="task-block-resize-handle" onMouseDown={(e) => { e.stopPropagation(); handleDragStart(ds, task.id, 'resize', e); }} />
            </div>
          );
        })}
      </div>
    );
  };

  const formatShortDate = (date: Date) => `${date.getMonth() + 1}月${date.getDate()}日`;

  return (
    <div className="app-container">
      {/* 顶部标题栏 */}
      <header className="app-header">
        <div className="app-header-left">
          <button className={`header-btn sidebar-toggle ${leftPanelOpen ? 'active' : ''}`} onClick={() => setLeftPanelOpen(!leftPanelOpen)} title={leftPanelOpen ? '隐藏三件好事' : '展开三件好事'}>
            <SidebarIcon />
          </button>
          <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
        </div>
        <div className="app-header-center">
          <button className="header-btn nav-btn" onClick={goPrevWeek} title="上一周"><ChevronLeft /></button>
          <button className="header-btn today-btn" onClick={goToday}>今天</button>
          <button className="header-btn nav-btn" onClick={goNextWeek} title="下一周"><ChevronRight /></button>
          <button className="header-btn add-btn" onClick={handleAddTask} title="新建任务"><PlusIcon /></button>
        </div>
        <div className="app-header-right">
          <button className={`header-btn sidebar-toggle ${rightPanelOpen ? 'active' : ''}`} onClick={() => setRightPanelOpen(!rightPanelOpen)} title={rightPanelOpen ? '隐藏改进记录' : '展开改进记录'}>
            <SidebarRightIcon />
          </button>
        </div>
      </header>

      <div className="app-body">
        {/* 左侧面板：三件好事 */}
        <div className={`sidebar-panel left ${leftPanelOpen ? '' : 'collapsed'}`}>
          <div className="sidebar-header">
            <div className="sidebar-title">✨ 今日三件好事</div>
            <div className="sidebar-date-info">{formatShortDate(selectedDate)}</div>
          </div>
          <div className="sidebar-content">
            {(['thing1', 'thing2', 'thing3'] as const).map((field, idx) => (
              <div key={field} className="good-thing-item">
                <div className="good-thing-label">
                  <span className="number">{idx + 1}</span>
                  第{['一', '二', '三'][idx]}件好事
                </div>
                <textarea className="good-thing-textarea" placeholder={`记录今天的第${idx + 1}件好事...`} value={selectedDayData.goodThings[field]} onChange={(e) => updateGoodThing(field, e.target.value)} />
              </div>
            ))}
          </div>
        </div>

        {/* 中间：周视图时间轴 */}
        <div className="timeline-container">
          <div className="wk-header">
            <div className="wk-header-gutter" />
            {weekDays.map((day, i) => {
              const isTodayCol = isToday(day);
              const isSelected = isSameDay(day, selectedDate);
              return (
                <div key={i} className={`wk-header-day ${isTodayCol ? 'is-today' : ''} ${isSelected ? 'selected' : ''}`} onClick={() => setSelectedDate(new Date(day))}>
                  <span className="wk-header-weekday">{WEEKDAY_NAMES[i]}</span>
                  <span className={`wk-header-date ${isTodayCol ? 'today-circle' : ''}`}>{day.getDate()}</span>
                </div>
              );
            })}
          </div>
          <div className="timeline-scroll" ref={timelineRef}>
            <div className="wk-grid" style={{ height: TOTAL_SLOTS * SLOT_HEIGHT }}>
              <div className="wk-time-labels">{renderTimeLabels()}</div>
              <div className="wk-columns">{weekDays.map((day, i) => renderDayColumn(day, i))}</div>
              {/* 当前时间红线 */}
              {currentTimePos !== null && todayColIndex >= 0 && (
                <div className="wk-current-time-line" style={{ top: `${currentTimePos}px` }}>
                  <div className="wk-current-time-dot" style={{ left: `calc(${(todayColIndex / 7) * 100}% - 4px)` }} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右侧面板：改进记录 */}
        <div className={`sidebar-panel right ${rightPanelOpen ? '' : 'collapsed'}`}>
          <div className="sidebar-header">
            <div className="sidebar-title">📝 今日三项改进</div>
            <div className="sidebar-date-info">{formatShortDate(selectedDate)}</div>
          </div>
          <div className="sidebar-content">
            {(['item1', 'item2', 'item3'] as const).map((field, idx) => (
              <div key={field} className="improvement-item">
                <div className="improvement-label">
                  <span className="number">{idx + 1}</span>
                  第{['一', '二', '三'][idx]}项改进
                </div>
                <textarea className="improvement-textarea" placeholder={`记录今天的第${idx + 1}项改进...`} value={selectedDayData.improvements[field]} onChange={(e) => updateImprovement(field, e.target.value)} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 任务模态框 */}
      {showModal && (
        <TaskModal
          task={editingTask}
          defaults={modalDefaults}
          currentDateStr={modalDateStr}
          weekDates={weekDateOptions}
          onSave={handleSaveTask}
          onDelete={editingTask ? () => handleDeleteTask(editingTask.id) : undefined}
          onClose={() => { setShowModal(false); setEditingTask(null); }}
        />
      )}
    </div>
  );
}
