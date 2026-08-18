/**
 * API 配置。
 * 自动检测当前访问环境，选择正确的 API 地址：
 * - 本地开发（localhost:3000）：API 在 localhost:3001
 * - 局域网访问（手机等）：API 在同 host 的 3001 端口
 * - 生产环境（非 3000 端口）：API 由 nginx 反向代理，使用相对路径 /api
 */

const API_PORT = 3001;

function getApiBaseUrl(): string {
  // 非开发端口（如 80），说明是生产环境，API 由 nginx 代理
  if (window.location.port === '' || (window.location.port !== '3000' && window.location.port !== '5173')) {
    return '';
  }
  // 本地开发模式
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return `http://localhost:${API_PORT}`;
  }
  // 局域网访问（手机）
  return `http://${window.location.hostname}:${API_PORT}`;
}

export const API_BASE_URL = getApiBaseUrl();
