# Update Log / 更新日志

All notable changes to this project will be documented in this file.
本项目的所有重要更改都将记录在此文件中。

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，

and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
并且本项目遵守 [语义化版本控制](https://semver.org/lang/zh-CN/spec/v2.0.0.html)。

## [1.0.1] - 2026-02-11 / 2026-02-12

### Features / 新功能

- **Input Limits**
  **输入限制**
  - Implemented a hybrid input length limit for "Good Things" and "Improvements":
    实现了“三件好事”和“三项改进”的混合输入长度限制：
    - Maximum limit is 75 units.
      最大限制为75个单位。
    - **Strict Blocking**: Input (including spaces) is completely blocked when the limit is reached.
      **严格限制**：达到限制时，输入（包括空格）将被完全阻止。

### Changes / 变更

- **Build System**
  **构建系统**
  - Added support for building Windows Portable executable and NSIS Installer.
    添加了构建 Windows 便携版和 NSIS 安装程序的支持。
  - Configured electron-builder for standardized releases.
    配置了 electron-builder 以进行标准化发布。

### Fixes / 修复

- **Weekly Recurrence Fixes**
  **每周重复功能修复**
  - Fixed critical UI bug where weekday labels were shifted by one day (e.g., Thursday displayed as Wednesday).
    修复了星期标签偏移一天的严重 UI 问题（例如，周四显示为周三）。
  - Fixed "Weekly" repeat option to automatically select the correct weekday.
    修复了“每周”重复选项未能自动选中正确星期的问题。
  - Fixed new task creation to default to the current date in the viewed timezone.
    修复了新建任务默认日期问题，现在会根据当前查看的时区设置默认日期。
  - Stabilized recurring task logic to strictly follow calendar dates.
    优化了重复任务逻辑，确保严格遵循日历日期。

## [1.0.0] - 2026-02-06 / 2026-02-10

### Features / 新功能

- **Timezone Support**
  **时区支持**
  - Added automatic detection of the user's local timezone.
    添加了用户本地时区的自动检测。
  - Implemented a timezone selector in the main application interface.
    在主应用界面实现了时区选择器。
  - Added support for creating and viewing tasks across different timezones.
    添加了跨不同时区创建和查看任务的支持。
  - Added visual indicators for timezone-specific events.
    为特定时区的事件添加了视觉指示器。

- **Localization Updates**
  **本地化更新**
  - Added Chinese and English translations for timezone names (e.g., "China Standard Time").
    添加了时区名称的中英文翻译（例如，“中国标准时间”）。
  - Updated date and time formatting to respect the selected locale.
    更新了日期和时间格式以遵循所选的语言区域设置。

### Changes / 变更

- **UI Improvements**
  **UI 改进**
  - Increased global font sizes for better readability across the application.
    增加了全局字体大小以提高整个应用程序的可读性。
  - Adjusted the layout of the top bar to accommodate the new timezone selector.
    调整了顶部栏的布局以容纳新的时区选择器。

### Fixes / 修复

- Fixed an issue where recurring tasks would shift dates incorrectly when viewed in different timezones.
  修复了在不同时区查看时重复任务日期偏移错误的问题。
