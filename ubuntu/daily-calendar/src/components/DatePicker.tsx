import React, { useState, useRef, useEffect } from 'react';

interface DatePickerProps {
  selectedDate: Date; // 当前选中的日期
  onDateChange: (date: Date) => void; // 日期更改回调
}

// 选择器模式：无、选择年份、选择月份、选择日期
type PickerMode = 'none' | 'year' | 'month' | 'day';

const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
const WEEKDAY_HEADERS = ['一', '二', '三', '四', '五', '六', '日'];

// 自定义日期选择器组件
export default function DatePicker({ selectedDate, onDateChange }: DatePickerProps) {
  const [pickerMode, setPickerMode] = useState<PickerMode>('none');
  // 视图状态：当前正在查看的年份和月份（不一定等于选中的日期）
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());
  const popoverRef = useRef<HTMLDivElement>(null);

  // 点击组件外部时关闭选择器
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPickerMode('none');
      }
    };
    if (pickerMode !== 'none') {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [pickerMode]);

  // 当外部传入的选中日期变化时，同步视图状态
  useEffect(() => {
    setViewYear(selectedDate.getFullYear());
    setViewMonth(selectedDate.getMonth());
  }, [selectedDate]);

  // 处理头部年份点击：切换年份选择器
  const handleYearClick = () => {
    setPickerMode(pickerMode === 'year' ? 'none' : 'year');
  };

  // 处理头部月份点击：切换月份选择器
  const handleMonthClick = () => {
    setPickerMode(pickerMode === 'month' ? 'none' : 'month');
  };

  // 处理头部日期点击：切换日期选择器
  const handleDayClick = () => {
    setViewYear(selectedDate.getFullYear());
    setViewMonth(selectedDate.getMonth());
    setPickerMode(pickerMode === 'day' ? 'none' : 'day');
  };

  // 选择年份
  const selectYear = (year: number) => {
    setViewYear(year);
    // 选择年份后，跳转到月份选择
    setPickerMode('month');
  };

  // 选择月份
  const selectMonth = (month: number) => {
    setViewMonth(month);
    // 选择月份后，跳转到日期选择
    setPickerMode('day');
  };

  // 选择具体日期
  const selectDay = (day: number) => {
    const newDate = new Date(viewYear, viewMonth, day);
    onDateChange(newDate);
    setPickerMode('none'); // 选择完成后关闭
  };

  // 日历网格生成逻辑
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate(); // 获取当月天数
  const getFirstDayOfMonth = (year: number, month: number) => {
    const d = new Date(year, month, 1).getDay();
    return d === 0 ? 6 : d - 1; // 转换为周一为0，周日为6
  };

  const today = new Date();
  // 检查某天是否被选中
  const isSelectedDay = (day: number) =>
    viewYear === selectedDate.getFullYear() &&
    viewMonth === selectedDate.getMonth() &&
    day === selectedDate.getDate();
  // 检查某天是否是今天
  const isTodayDay = (day: number) =>
    viewYear === today.getFullYear() &&
    viewMonth === today.getMonth() &&
    day === today.getDate();

  // 年份范围：当前年 ± 10 年
  const currentYear = new Date().getFullYear();
  const yearStart = currentYear - 10;
  const yearEnd = currentYear + 10;
  const years: number[] = [];
  for (let y = yearStart; y <= yearEnd; y++) years.push(y);

  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  return (
    <div className="date-picker-wrapper" ref={popoverRef}>
      {/* 顶部显示区，可点击切换不同选择模式 */}
      <div className="date-picker-display">
        <span className="date-picker-segment year" onClick={handleYearClick}>
          {selectedDate.getFullYear()}年
        </span>
        <span className="date-picker-segment month" onClick={handleMonthClick}>
          {MONTHS[selectedDate.getMonth()]}
        </span>
        <span className="date-picker-segment day" onClick={handleDayClick}>
          {selectedDate.getDate()}日
        </span>
        <span className="date-picker-weekday">
          {weekdays[selectedDate.getDay()]}
        </span>
      </div>

      {/* 年份选择器 */}
      {pickerMode === 'year' && (
        <div className="picker-popover picker-year">
          <div className="picker-title">选择年份</div>
          <div className="picker-year-grid">
            {years.map((y) => (
              <div
                key={y}
                className={`picker-year-item ${y === selectedDate.getFullYear() ? 'selected' : ''} ${y === currentYear ? 'current' : ''}`}
                onClick={() => selectYear(y)}
              >
                {y}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 月份选择器 */}
      {pickerMode === 'month' && (
        <div className="picker-popover picker-month">
          <div className="picker-nav">
            <button className="picker-nav-btn" onClick={() => setViewYear(viewYear - 1)}>‹</button>
            <span className="picker-nav-title" onClick={() => setPickerMode('year')}>{viewYear}年</span>
            <button className="picker-nav-btn" onClick={() => setViewYear(viewYear + 1)}>›</button>
          </div>
          <div className="picker-month-grid">
            {MONTHS.map((m, i) => (
              <div
                key={i}
                className={`picker-month-item ${i === selectedDate.getMonth() && viewYear === selectedDate.getFullYear() ? 'selected' : ''} ${i === today.getMonth() && viewYear === today.getFullYear() ? 'current' : ''}`}
                onClick={() => selectMonth(i)}
              >
                {m}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 日期选择器 (日历视图) */}
      {pickerMode === 'day' && (
        <div className="picker-popover picker-day">
          <div className="picker-nav">
            <button className="picker-nav-btn" onClick={() => {
              // 切换到上个月
              if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
              else setViewMonth(viewMonth - 1);
            }}>‹</button>
            <span className="picker-nav-title" onClick={() => setPickerMode('month')}>
              {viewYear}年 {MONTHS[viewMonth]}
            </span>
            <button className="picker-nav-btn" onClick={() => {
              // 切换到下个月
              if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
              else setViewMonth(viewMonth + 1);
            }}>›</button>
          </div>
          <div className="picker-day-header">
            {WEEKDAY_HEADERS.map((w) => (
              <div key={w} className="picker-day-header-cell">{w}</div>
            ))}
          </div>
          <div className="picker-day-grid">
            {/* 填充每月的空白起始格 */}
            {Array.from({ length: getFirstDayOfMonth(viewYear, viewMonth) }).map((_, i) => (
              <div key={`empty-${i}`} className="picker-day-cell empty" />
            ))}
            {/* 日期格子 */}
            {Array.from({ length: getDaysInMonth(viewYear, viewMonth) }).map((_, i) => {
              const day = i + 1;
              return (
                <div
                  key={day}
                  className={`picker-day-cell ${isSelectedDay(day) ? 'selected' : ''} ${isTodayDay(day) ? 'today' : ''}`}
                  onClick={() => selectDay(day)}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
