/**
 * 清单服务层。
 * 通过 HTTP API 与服务端交互，数据存储在 data/todo-data.json。
 * 纯函数实现，不依赖 React。
 */
import type { TaskList, CreateListInput } from '@/types';
import { generateId } from '@/utils/id';
import { DEFAULT_LIST_COLOR } from '@/utils/constants';
import { API_BASE_URL } from '@/utils/api';

const API_BASE = `${API_BASE_URL}/api/lists`;

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
 * 创建新清单。
 */
export async function createList(data: CreateListInput): Promise<TaskList> {
  return apiFetch<TaskList>(API_BASE, {
    method: 'POST',
    body: JSON.stringify({
      id: generateId(),
      name: data.name,
      color: data.color ?? DEFAULT_LIST_COLOR,
      icon: data.icon ?? 'List',
    }),
  });
}

/**
 * 更新清单字段。
 */
export async function updateList(id: string, data: Partial<TaskList>): Promise<TaskList> {
  return apiFetch<TaskList>(`${API_BASE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * 删除清单及其中所有任务。
 */
export async function deleteList(id: string): Promise<void> {
  await apiFetch(`${API_BASE}/${id}`, { method: 'DELETE' });
}

/**
 * 获取所有清单。
 */
export async function getAllLists(): Promise<TaskList[]> {
  return apiFetch<TaskList[]>(API_BASE);
}

/**
 * 批量更新清单的排序顺序。
 */
export async function reorderLists(listIds: string[]): Promise<void> {
  await apiFetch(`${API_BASE}/reorder`, {
    method: 'PUT',
    body: JSON.stringify({ listIds }),
  });
}
