/**
 * "我的一天"服务层。
 * 通过 HTTP API 与服务端交互，数据存储在 data/todo-data.json。
 * 纯函数实现，不依赖 React。
 */
import type { Task } from '@/types';
import { API_BASE_URL } from '@/utils/api';

const API_BASE = `${API_BASE_URL}/api/tasks`;

/** 通用 API 请求封装 */
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `API error: ${res.status}`);
  }
  return res.json();
}

/**
 * 将任务加入"我的一天"。
 */
export async function addToMyDay(taskId: string): Promise<Task> {
  return apiFetch<Task>(`${API_BASE}/${taskId}/myday`, { method: 'POST' });
}

/**
 * 将任务从"我的一天"移出。
 */
export async function removeFromMyDay(taskId: string): Promise<Task> {
  return apiFetch<Task>(`${API_BASE}/${taskId}/myday`, { method: 'DELETE' });
}

/**
 * 获取"我的一天"任务列表。
 */
export async function getMyDayTasks(): Promise<Task[]> {
  return apiFetch<Task[]>(`${API_BASE}?myDay=true`);
}

/**
 * 重置"我的一天"（跨天逻辑）。
 */
export async function resetMyDay(): Promise<void> {
  await apiFetch(`${API_BASE_URL}/api/myday/reset`, { method: 'POST' });
}

/**
 * 获取智能推荐任务。
 */
export async function getSmartSuggestions(): Promise<Task[]> {
  return apiFetch<Task[]>(`${API_BASE_URL}/api/myday/suggestions`);
}
