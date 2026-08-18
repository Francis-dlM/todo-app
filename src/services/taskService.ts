/**
 * 任务服务层。
 * 通过 HTTP API 与服务端交互，数据存储在 data/todo-data.json。
 * 纯函数实现，不依赖 React。
 */
import type { Task, CreateTaskInput } from '@/types';
import { generateId } from '@/utils/id';
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
 * 创建新任务。
 * 自动生成 ID，设置默认值。
 */
export async function createTask(data: CreateTaskInput): Promise<Task> {
  const task = await apiFetch<Task>(API_BASE, {
    method: 'POST',
    body: JSON.stringify({ ...data, id: generateId() }),
  });
  return task;
}

/**
 * 更新任务字段。
 */
export async function updateTask(id: string, data: Partial<Task>): Promise<Task> {
  return apiFetch<Task>(`${API_BASE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * 删除任务。
 */
export async function deleteTask(id: string): Promise<void> {
  await apiFetch(`${API_BASE}/${id}`, { method: 'DELETE' });
}

/**
 * 标记任务为已完成。
 */
export async function completeTask(id: string): Promise<Task> {
  return updateTask(id, { isCompleted: true, completedAt: new Date().toISOString() } as unknown as Partial<Task>);
}

/**
 * 撤销任务完成状态。
 */
export async function uncompleteTask(id: string): Promise<Task> {
  return updateTask(id, { isCompleted: false, completedAt: null } as unknown as Partial<Task>);
}

/**
 * 按清单获取任务列表。
 */
export async function getTasksByList(listId: string): Promise<Task[]> {
  return apiFetch<Task[]>(`${API_BASE}?listId=${encodeURIComponent(listId)}`);
}

/**
 * 获取所有任务。
 */
export async function getAllTasks(): Promise<Task[]> {
  return apiFetch<Task[]>(API_BASE);
}

/**
 * 获取所有重要任务。
 */
export async function getImportantTasks(): Promise<Task[]> {
  return apiFetch<Task[]>(`${API_BASE}?important=true`);
}

/**
 * 获取所有有截止日期的未完成任务（计划内）。
 */
export async function getPlannedTasks(): Promise<Task[]> {
  return apiFetch<Task[]>(`${API_BASE}?planned=true`);
}

/**
 * 按关键词搜索任务。
 */
export async function searchTasks(keyword: string): Promise<Task[]> {
  return apiFetch<Task[]>(`${API_BASE}?keyword=${encodeURIComponent(keyword)}`);
}

/**
 * 批量更新任务的排序顺序。
 */
export async function reorderTasks(taskIds: string[]): Promise<void> {
  await apiFetch(`${API_BASE}/reorder`, {
    method: 'PUT',
    body: JSON.stringify({ taskIds }),
  });
}
