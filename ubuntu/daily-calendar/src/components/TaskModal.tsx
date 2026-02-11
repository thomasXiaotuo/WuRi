import React, { useState, useEffect, useRef } from 'react';
import { CalendarTask, TASK_COLORS, formatTime, generateId, RepeatType, RecurringConfig } from '../types';
import { AVAILABLE_TIMEZONES, getLocalTimezone } from '../utils/timezone';
import { useLanguage } from '../contexts/LanguageContext';

export type RecurringAction = 'single' | 'future';

interface TaskModalProps {
  task: CalendarTask | null; // 要编辑的任务，如果是新建则为 null
  defaults: { startHour: number; startMinute: number; dateStr: string } | null; // 新建任务时的默认时间/日期
  currentDateStr: string; // 当然显示的日期
  weekDates: { dateStr: string; label: string }[]; // 当前周的可用日期列表（用于快速切换日期）
  onSave: (task: CalendarTask, dateStr: string, action?: RecurringAction) => void; // 保存回调
  onDelete?: (action?: RecurringAction) => void; // 删除回调
  onClose: () => void; // 关闭回调
}

// 任务创建/编辑模态框组件
export default function TaskModal({ task, defaults, currentDateStr, weekDates, onSave, onDelete, onClose }: TaskModalProps) {
  const { t } = useLanguage();
  // 表单状态管理
  const [title, setTitle] = useState(task?.title || '');
  const [dateStr, setDateStr] = useState(currentDateStr);
  const [startHour, setStartHour] = useState(task?.startHour ?? defaults?.startHour ?? 9);
  const [startMinute, setStartMinute] = useState(task?.startMinute ?? defaults?.startMinute ?? 0);
  const [duration, setDuration] = useState(task?.duration ?? 60);
  const [color, setColor] = useState(task?.color ?? TASK_COLORS[0]);
  const [location, setLocation] = useState(task?.location || '');
  const [notes, setNotes] = useState(task?.notes || '');

  // 重复任务状态
  const [repeatType, setRepeatType] = useState<RepeatType>('none');
  const [customInterval, setCustomInterval] = useState(1);
  const [selectedWeekDays, setSelectedWeekDays] = useState<number[]>([]);
  const [endDate, setEndDate] = useState('');
  const [timezone, setTimezone] = useState(getLocalTimezone());

  // 确认模式状态
  const [confirmMode, setConfirmMode] = useState<'save' | 'delete' | null>(null);
  const [pendingTask, setPendingTask] = useState<CalendarTask | null>(null);

  // 用于自动聚焦标题输入框
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 组件挂载时自动聚焦
    titleRef.current?.focus();

    // 如果是新建任务，根据 defaults 初始化日期和时间
    if (!task && defaults) {
      if (defaults.dateStr) setDateStr(defaults.dateStr);
      if (defaults.startHour !== undefined) setStartHour(defaults.startHour);
      if (defaults.startMinute !== undefined) setStartMinute(defaults.startMinute);
    }
  }, [task, defaults]);

  // 生成时间选项列表 (00:00 到 23:30)
  const timeOptions: { hour: number; minute: number; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      timeOptions.push({ hour: h, minute: m, label: formatTime(h, m) });
    }
  }

  // 生成时长选项列表 (30 分钟到 8 小时)
  const durationOptions: { value: number; label: string }[] = [];
  for (let d = 30; d <= 480; d += 30) {
    const hours = Math.floor(d / 60);
    const mins = d % 60;
    const label = t.modal.durationLabel(hours, mins);
    durationOptions.push({ value: d, label });
  }

  // 处理周几选择
  const toggleWeekDay = (day: number) => {
    setSelectedWeekDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };

  // 处理删除点击
  const handleDeleteClick = () => {
    if (task?.recurringId) {
      setConfirmMode('delete');
    } else {
      if (onDelete) onDelete();
    }
  };

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // 计算任务结束时间，防止跨天
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = startTotalMinutes + duration;
    const maxEnd = 24 * 60;
    const finalDuration = endTotalMinutes > maxEnd ? maxEnd - startTotalMinutes : duration;

    // 如果时长变短后小于 30 分钟，则不保存
    if (finalDuration < 30) return;

    // 构建基本任务对象
    const baseTask: CalendarTask = {
      id: task?.id || generateId(),
      title: title.trim(),
      startHour,
      startMinute,
      duration: finalDuration,
      color,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      recurringId: task?.recurringId, // 保持引用
      recurringConfig: task?.recurringConfig // 保持引用
    };

    // 如果是新建重复任务
    if (!task && repeatType !== 'none') {
      const config: RecurringConfig = {
        id: generateId(),
        type: repeatType,
        startDate: dateStr,
        endDate: endDate || undefined,
        weekDays: repeatType === 'weekly' ? selectedWeekDays : undefined,
        interval: repeatType === 'custom' ? customInterval : undefined,
        timezone: timezone, // 保存时区设置
        template: {
          title: baseTask.title,
          startHour: baseTask.startHour,
          startMinute: baseTask.startMinute,
          duration: baseTask.duration,
          color: baseTask.color,
          location: baseTask.location,
          notes: baseTask.notes,
        }
      };

      baseTask.recurringConfig = config;
      onSave(baseTask, dateStr);
      return;
    }

    // 如果是编辑现有的重复任务
    if (task?.recurringId) {
      setPendingTask(baseTask);
      setConfirmMode('save');
      return;
    }

    onSave(baseTask, dateStr);
  };

  // 点击遮罩层关闭弹窗
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // 按 ESC 键关闭弹窗
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  // 如果处于确认模式，显示选择对话框
  if (confirmMode) {
    return (
      <div className="modal-overlay" onClick={handleOverlayClick} onKeyDown={handleKeyDown}>
        <div className="modal-content" style={{ maxWidth: '400px' }}>
          <div className="modal-title">
            {t.modal.confirmRecurringTitle(confirmMode)}
          </div>
          <p style={{ margin: '20px 0', color: '#333' }}>
            {t.modal.confirmRecurringBody}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              className="btn btn-primary"
              onClick={() => {
                if (confirmMode === 'save' && pendingTask) onSave(pendingTask, dateStr, 'single');
                if (confirmMode === 'delete' && onDelete) onDelete('single');
              }}
            >
              {t.modal.actionSingle(confirmMode)}
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                if (confirmMode === 'save' && pendingTask) onSave(pendingTask, dateStr, 'future');
                if (confirmMode === 'delete' && onDelete) onDelete('future');
              }}
            >
              {t.modal.actionFuture(confirmMode)}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setConfirmMode(null)}
              style={{ marginTop: '10px' }}
            >
              {t.modal.cancel}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} onKeyDown={handleKeyDown}>
      <div className="modal-content">
        <div className="modal-title">{task ? t.modal.editTask : t.modal.newTask}</div>
        <form onSubmit={handleSubmit}>
          {/* 任务名称 */}
          <div className="modal-field">
            <label className="modal-label">{t.modal.taskName}</label>
            <input
              ref={titleRef}
              className="modal-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.modal.placeholderTitle}
              required
            />
          </div>

          {/* 日期选择（仅限本周） */}
          <div className="modal-field">
            <label className="modal-label">{t.modal.date}</label>
            <select
              className="modal-select"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              disabled={!!task} // 编辑模式下不允许改日期（简化逻辑）
            >
              {weekDates.map((wd) => (
                <option key={wd.dateStr} value={wd.dateStr}>{wd.label}</option>
              ))}
            </select>
          </div>

          {/* 开始时间和时长选择 */}
          <div className="modal-time-row">
            <div className="modal-field">
              <label className="modal-label">{t.modal.startTime}</label>
              <select
                className="modal-select"
                value={`${startHour}:${startMinute}`}
                onChange={(e) => {
                  const [h, m] = e.target.value.split(':').map(Number);
                  setStartHour(h);
                  setStartMinute(m);
                }}
              >
                {timeOptions.map((opt) => (
                  <option key={opt.label} value={`${opt.hour}:${opt.minute}`}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-field">
              <label className="modal-label">{t.modal.duration}</label>
              <select
                className="modal-select"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              >
                {durationOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 重复设置 (仅新建时显示，简化逻辑) */}
          {!task && (
            <div className="modal-field">
              <label className="modal-label">
                <span className="modal-label-icon">🔁</span> {t.modal.repeat}
              </label>
              <select
                className="modal-select"
                value={repeatType}
                onChange={(e) => setRepeatType(e.target.value as RepeatType)}
              >
                <option value="none">{t.modal.repeatTypes.none}</option>
                <option value="daily">{t.modal.repeatTypes.daily}</option>
                <option value="weekly">{t.modal.repeatTypes.weekly}</option>
                <option value="monthly">{t.modal.repeatTypes.monthly}</option>
                <option value="yearly">{t.modal.repeatTypes.yearly}</option>
                <option value="custom">{t.modal.repeatTypes.custom}</option>
              </select>

              {/* 时区选择 */}
              <div style={{ marginTop: '8px' }}>
                <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', display: 'block' }}>{t.modal.timezone}</label>
                <select
                  className="modal-select"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  style={{ fontSize: '12px', padding: '4px' }}
                >
                  {AVAILABLE_TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>{t.app.timezones[tz.value]}</option>
                  ))}
                </select>
              </div>

              {/* 每周设置 */}
              {repeatType === 'weekly' && (
                <div className="week-days-selector" style={{ marginTop: '8px', display: 'flex', gap: '4px' }}>
                  {t.datePicker.weekdaysShort.map((day, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleWeekDay(idx)}
                      className={`btn-weekday ${selectedWeekDays.includes(idx) ? 'selected' : ''}`}
                      style={{
                        width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #ddd',
                        background: selectedWeekDays.includes(idx) ? '#007aff' : 'transparent',
                        color: selectedWeekDays.includes(idx) ? 'white' : '#333',
                        fontSize: '12px', cursor: 'pointer'
                      }}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              )}

              {/* 自定义设置 */}
              {repeatType === 'custom' && (
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px' }}>{t.modal.customInterval(customInterval)}</span>
                  <input
                    type="number"
                    min="1"
                    className="modal-input"
                    style={{ width: '60px', marginLeft: '10px' }}
                    value={customInterval}
                    onChange={(e) => setCustomInterval(Number(e.target.value))}
                  />
                </div>
              )}

              {/* 结束日期 */}
              {repeatType !== 'none' && (
                <div style={{ marginTop: '8px' }}>
                  <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', display: 'block' }}>{t.modal.endDate}</label>
                  <input
                    type="date"
                    className="modal-input"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          {/* 地点输入 */}
          <div className="modal-field">
            <label className="modal-label">
              <span className="modal-label-icon">📍</span> {t.modal.location}
            </label>
            <input
              className="modal-input"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t.modal.placeholderLocation}
            />
          </div>

          {/* 备注输入 */}
          <div className="modal-field">
            <label className="modal-label">
              <span className="modal-label-icon">📝</span> {t.modal.notes}
            </label>
            <textarea
              className="modal-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.modal.placeholderNotes}
              rows={3}
            />
          </div>

          {/* 颜色选择器 */}
          <div className="modal-field">
            <label className="modal-label">{t.modal.color}</label>
            <div className="color-picker">
              {TASK_COLORS.map((c) => (
                <div
                  key={c}
                  className={`color-swatch ${color === c ? 'selected' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          {/* 底部按钮区 */}
          <div className="modal-actions">
            {onDelete && (
              <button type="button" className="btn btn-danger" onClick={handleDeleteClick}>{t.modal.delete}</button>
            )}
            <div style={{ flex: 1 }} />
            <button type="button" className="btn btn-secondary" onClick={onClose}>{t.modal.cancel}</button>
            <button type="submit" className="btn btn-primary">{task ? t.modal.save : t.modal.create}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
