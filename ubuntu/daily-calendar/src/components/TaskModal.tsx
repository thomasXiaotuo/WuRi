import React, { useState, useEffect, useRef } from 'react';
import { CalendarTask, TASK_COLORS, formatTime, generateId } from '../types';

interface TaskModalProps {
  task: CalendarTask | null; // 要编辑的任务，如果是新建则为 null
  defaults: { startHour: number; startMinute: number; dateStr: string } | null; // 新建任务时的默认时间/日期
  currentDateStr: string; // 当然显示的日期
  weekDates: { dateStr: string; label: string }[]; // 当前周的可用日期列表（用于快速切换日期）
  onSave: (task: CalendarTask, dateStr: string) => void; // 保存回调
  onDelete?: () => void; // 删除回调
  onClose: () => void; // 关闭回调
}

// 任务创建/编辑模态框组件
export default function TaskModal({ task, defaults, currentDateStr, weekDates, onSave, onDelete, onClose }: TaskModalProps) {
  // 表单状态管理
  const [title, setTitle] = useState(task?.title || '');
  const [dateStr, setDateStr] = useState(currentDateStr);
  const [startHour, setStartHour] = useState(task?.startHour ?? defaults?.startHour ?? 9);
  const [startMinute, setStartMinute] = useState(task?.startMinute ?? defaults?.startMinute ?? 0);
  const [duration, setDuration] = useState(task?.duration ?? 60);
  const [color, setColor] = useState(task?.color ?? TASK_COLORS[0]);
  const [location, setLocation] = useState(task?.location || '');
  const [notes, setNotes] = useState(task?.notes || '');

  // 用于自动聚焦标题输入框
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 组件挂载时自动聚焦
    titleRef.current?.focus();
  }, []);

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
    let label = '';
    if (hours > 0 && mins > 0) label = `${hours}小时${mins}分钟`;
    else if (hours > 0) label = `${hours}小时`;
    else label = `${mins}分钟`;
    durationOptions.push({ value: d, label });
  }

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // 计算任务结束时间，防止跨天（简化处理：限制在当天 24:00 前）
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = startTotalMinutes + duration;
    const maxEnd = 24 * 60;
    const finalDuration = endTotalMinutes > maxEnd ? maxEnd - startTotalMinutes : duration;

    // 如果时长变短后小于 30 分钟（例如 23:30 开始的任务），则不保存
    if (finalDuration < 30) return;

    // 构建任务对象
    const result: CalendarTask = {
      id: task?.id || generateId(), // 编辑时保留 ID，新建时生成新 ID
      title: title.trim(),
      startHour,
      startMinute,
      duration: finalDuration,
      color,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
    };
    onSave(result, dateStr);
  };

  // 点击遮罩层关闭弹窗
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // 按 ESC 键关闭弹窗
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} onKeyDown={handleKeyDown}>
      <div className="modal-content">
        <div className="modal-title">{task ? '编辑任务' : '新建任务'}</div>
        <form onSubmit={handleSubmit}>
          {/* 任务名称 */}
          <div className="modal-field">
            <label className="modal-label">任务名称</label>
            <input
              ref={titleRef}
              className="modal-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入任务名称..."
              required
            />
          </div>

          {/* 日期选择（仅限本周） */}
          <div className="modal-field">
            <label className="modal-label">日期</label>
            <select
              className="modal-select"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
            >
              {weekDates.map((wd) => (
                <option key={wd.dateStr} value={wd.dateStr}>{wd.label}</option>
              ))}
            </select>
          </div>

          {/* 开始时间和时长选择 */}
          <div className="modal-time-row">
            <div className="modal-field">
              <label className="modal-label">开始时间</label>
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
              <label className="modal-label">时长</label>
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

          {/* 地点输入 */}
          <div className="modal-field">
            <label className="modal-label">
              <span className="modal-label-icon">📍</span> 地点
            </label>
            <input
              className="modal-input"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="输入地点（可选）..."
            />
          </div>

          {/* 备注输入 */}
          <div className="modal-field">
            <label className="modal-label">
              <span className="modal-label-icon">📝</span> 备注 / 提醒
            </label>
            <textarea
              className="modal-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="写下需要提醒自己的事项..."
              rows={3}
            />
          </div>

          {/* 颜色选择器 */}
          <div className="modal-field">
            <label className="modal-label">颜色</label>
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
              <button type="button" className="btn btn-danger" onClick={onDelete}>删除</button>
            )}
            <div style={{ flex: 1 }} />
            <button type="button" className="btn btn-secondary" onClick={onClose}>取消</button>
            <button type="submit" className="btn btn-primary">{task ? '保存' : '创建'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
