import { useEffect, useState, useCallback } from 'react';
import * as notificationService from '@/services/notificationService';

/**
 * 通知权限与提醒调度 Hook。
 * 在应用首次挂载时请求通知权限并检查到期提醒。
 * 返回通知权限状态和调度/取消提醒的方法。
 */
export function useNotification(): {
  permission: NotificationPermission;
  scheduleReminder: (taskId: string, reminder: Date) => void;
  cancelReminder: (taskId: string) => void;
} {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied',
  );

  useEffect(() => {
    async function initNotifications(): Promise<void> {
      const result = await notificationService.requestPermission();
      setPermission(result);

      // 权限已授予时，检查并调度到期提醒
      if (result === 'granted') {
        await notificationService.checkAndNotify();
      }
    }

    initNotifications();
  }, []);

  const scheduleReminder = useCallback(
    (_taskId: string, reminder: Date) => {
      // 构造一个临时 Task 对象用于调度
      // 实际使用时从 taskStore 获取完整任务数据
      notificationService.scheduleReminder({
        id: _taskId,
        title: '',
        note: '',
        listId: '',
        isCompleted: false,
        isImportant: false,
        isMyDay: false,
        myDayDate: null,
        dueDate: null,
        reminder,
        repeat: null,
        subtasks: [],
        priority: 'NONE' as any,
        order: 0,
        createdAt: new Date(),
        completedAt: null,
      });
    },
    [],
  );

  const cancelReminder = useCallback((taskId: string) => {
    notificationService.cancelReminder(taskId);
  }, []);

  return { permission, scheduleReminder, cancelReminder };
}
