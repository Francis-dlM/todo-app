import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@/styles/global.css';
import '@/i18n';

/**
 * React 应用入口。
 * 挂载根组件到 DOM，初始化主题和全局样式。
 * 注册 PWA Service Worker。
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// 注册 PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // SW 注册失败不影响应用运行
    });
  });
}
