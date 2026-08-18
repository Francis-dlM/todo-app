import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhCN from './locales/zh-CN.json';

/**
 * i18next 初始化配置。
 * MVP 阶段仅支持中文，预留多语言扩展能力。
 */
i18n.use(initReactI18next).init({
  resources: {
    'zh-CN': {
      translation: zhCN,
    },
  },
  lng: 'zh-CN',
  fallbackLng: 'zh-CN',
  interpolation: {
    escapeValue: false, // React 已内置 XSS 防护
  },
});

export default i18n;
