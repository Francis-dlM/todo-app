import { useRef, useCallback } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import type { Task } from '@/types';

/** 自动保存延迟时间（毫秒） */
const AUTO_SAVE_DELAY = 300;

/**
 * 任务详情自动保存 Hook。
 * 使用 debounce 机制，在用户编辑后延迟 300ms 自动保存到数据库。
 *
 * @param taskId - 要自动保存的任务 ID
 * @returns save - 触发保存的函数，接收部分 Task 字段
 *
 * @example
 * ```tsx
 * const autoSave = useAutoSave(taskId);
 * <input onChange={(e) => autoSave({ title: e.target.value })} />
 * ```
 */
export function useAutoSave(taskId: string): (data: Partial<Task>) => void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updateTaskDetail = useTaskStore((state) => state.updateTaskDetail);

  const save = useCallback(
    (data: Partial<Task>) => {
      // 清除之前的定时器
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }

      // 设置新的定时器，延迟保存
      timerRef.current = setTimeout(() => {
        updateTaskDetail(taskId, data);
        timerRef.current = null;
      }, AUTO_SAVE_DELAY);
    },
    [taskId, updateTaskDetail],
  );

  return save;
}
