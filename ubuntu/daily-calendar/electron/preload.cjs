// 引入 Electron 的 contextBridge 和 ipcRenderer 模块
// contextBridge: 用于在隔离的上下文之间（如主进程和渲染进程）安全地暴露 API
// ipcRenderer: 用于从渲染进程向主进程发送同步或异步消息
const { contextBridge, ipcRenderer } = require('electron');

// 将 API 暴露给渲染进程（前端）
// 在前端可以通过 window.electronAPI 访问这些方法
contextBridge.exposeInMainWorld('electronAPI', {
  // 加载指定日期的数据
  // dateStr: 日期字符串，例如 "2023-10-27"
  // 返回: Promise，解析为该日期的数据对象
  loadDayData: (dateStr) => ipcRenderer.invoke('load-day-data', dateStr),

  // 保存指定日期的数据
  // dateStr: 日期字符串
  // data: 要保存的数据对象
  // 返回: Promise，解析为保存操作的结果
  saveDayData: (dateStr, data) => ipcRenderer.invoke('save-day-data', dateStr, data),
});
