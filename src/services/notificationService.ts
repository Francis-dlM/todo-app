import { db } from '@/db';
import type { Task } from '@/types';

/**
 * 通知服务层。
 * 提供 Web Notifications 权限请求、提醒调度等业务逻辑。
 * 纯函数实现，不依赖 React。
 */

/** 存储活跃的提醒定时器 */
const activeTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

/**
 * 请求浏览器通知权限。
 * @returns 授予的权限状态
 */
export async function requestPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  return permission;
}

/**
 * 为任务调度提醒。
 * 如果任务的 reminder 时间在未来，则设置 setTimeout 在指定时间触发通知。
 * 如果 reminder 时间已过，立即发送通知。
 * @param task - 需要设置提醒的任务
 */
export function scheduleReminder(task: Task): void {
  // 先取消已有的提醒
  cancelReminder(task.id);

  if (!task.reminder) {
    return;
  }

  const reminderTime = new Date(task.reminder).getTime();
  const now = Date.now();
  const delay = reminderTime - now;

  if (delay <= 0) {
    // 已过提醒时间，立即发送通知
    sendNotification(task);
    return;
  }

  // 设置定时提醒
  const timer = setTimeout(() => {
    sendNotification(task);
    activeTimers.delete(task.id);
  }, delay);

  activeTimers.set(task.id, timer);
}

/**
 * 取消指定任务的提醒。
 * @param taskId - 任务 ID
 */
export function cancelReminder(taskId: string): void {
  const timer = activeTimers.get(taskId);
  if (timer !== undefined) {
    clearTimeout(timer);
    activeTimers.delete(taskId);
  }
}

/**
 * 检查数据库中所有未完成且有提醒的任务，调度到期提醒。
 * 应在应用启动时调用，以恢复提醒调度。
 */
export async function checkAndNotify(): Promise<void> {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const now = Date.now();

  // 获取所有有提醒且未完成的任务
  const allTasks = await db.tasks.toArray();
  const tasksWithReminder = allTasks.filter(
    (t) => !t.isCompleted && t.reminder !== null,
  );

  for (const task of tasksWithReminder) {
    const reminderTime = new Date(task.reminder!).getTime();

    if (reminderTime <= now) {
      // 提醒时间已过，发送通知并清除提醒
      sendNotification(task);
      await db.tasks.update(task.id, { reminder: null });
    } else {
      // 提醒时间在未来，调度提醒
      scheduleReminder(task);
    }
  }
}

/**
 * 发送浏览器通知。
 * @param task - 触发通知的任务
 */
function sendNotification(task: Task): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const title = '任务提醒';
  const options: NotificationOptions = {
    body: task.title,
    icon: '/icons/icon-192.png',
    tag: `task-reminder-${task.id}`,
    requireInteraction: true,
  };

  try {
    new Notification(title, options);
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}
