import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

// React 应用的入口点
// 查找 ID 为 'root' 的 DOM 元素，并将 React 应用挂载到该元素上
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* React.StrictMode 用于在开发模式下检测潜在问题 */}
    <App />
  </React.StrictMode>
);
