# Update Log / 更新日志

All notable changes to this project will be documented in this file.
本项目的所有重要更改都将记录在此文件中。

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，

and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
并且本项目遵守 [语义化版本控制](https://semver.org/lang/zh-CN/spec/v2.0.0.html)。

## [1.0.1] - Unreleased / 未发布

### Features / 新功能

- **New Feature Title**
  **新功能标题**
  - Description of the new feature in English.
    新功能的中文描述。

### Changes / 变更

- **Change Title**
  **变更标题**
  - Description of the change in English.
    变更的中文描述。

### Fixes / 修复

- Description of the fix in English.
  修复的中文描述。

## [1.0.0] - 2026-02-11 / 2026-02-11

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
