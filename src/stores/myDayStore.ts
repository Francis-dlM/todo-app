import { create } from 'zustand';
import type { Task } from '@/types';
import * as myDayService from '@/services/myDayService';
import { getTodayString } from '@/utils/date';
import {
  getStorageItem,
  setStorageItem,
} from '@/utils/storage';
import { STORAGE_KEY_LAST_MY_DAY_VISIT } from '@/utils/constants';

/**
 * "我的一天"状态管理 Store。
 * 管理当日任务、推荐任务、上次访问日期。
 * 采用乐观更新模式：先更新内存状态，再调用 service 持久化，失败则回滚。
 */

interface MyDayState {
  /** 今日"我的一天"任务 */
  myDayTasks: Task[];
  /** 智能推荐任务 */
  suggestions: Task[];
  /** 上次访问"我的一天"的日期 */
  lastVisitDate: string;
  /** 是否正在加载 */
  isLoading: boolean;
}

interface MyDayActions {
  /** 加载"我的一天"任务 */
  loadMyDay: () => Promise<void>;
  /** 将任务加入"我的一天" */
  addToMyDay: (taskId: string) => Promise<void>;
  /** 将任务从"我的一天"移出 */
  removeFromMyDay: (taskId: string) => Promise<void>;
  /** 检测跨天并重置 */
  checkAndReset: () => Promise<void>;
  /** 加载智能推荐 */
  loadSuggestions: () => Promise<void>;
}

export type MyDayStore = MyDayState & MyDayActions;

export const useMyDayStore = create<MyDayStore>((set, get) => ({
  // ==================== 初始状态 ====================
  myDayTasks: [],
  suggestions: [],
  lastVisitDate: getStorageItem<string>(STORAGE_KEY_LAST_MY_DAY_VISIT, ''),
  isLoading: false,

  // ==================== Actions ====================

  loadMyDay: async () => {
    set({ isLoading: true });
    try {
      // 先检测跨天重置
      await get().checkAndReset();

      const myDayTasks = await myDayService.getMyDayTasks();
      set({ myDayTasks, isLoading: false });

      // 如果当天没有任务，加载推荐
      if (myDayTasks.length === 0) {
        await get().loadSuggestions();
      }

      // 更新最后访问日期
      const today = getTodayString();
      set({ lastVisitDate: today });
      setStorageItem(STORAGE_KEY_LAST_MY_DAY_VISIT, today);
    } catch (error) {
      console.error('Failed to load my day:', error);
      set({ isLoading: false });
    }
  },

  addToMyDay: async (taskId: string) => {
    const { myDayTasks } = get();

    try {
      const updatedTask = await myDayService.addToMyDay(taskId);
      set({ myDayTasks: [...myDayTasks, updatedTask] });
    } catch (error) {
      console.error('Failed to add to my day:', error);
    }
  },

  removeFromMyDay: async (taskId: string) => {
    const { myDayTasks } = get();

    // 乐观更新
    const previousState = myDayTasks;
    set({ myDayTasks: myDayTasks.filter((t) => t.id !== taskId) });

    try {
      await myDayService.removeFromMyDay(taskId);
    } catch (error) {
      console.error('Failed to remove from my day:', error);
      // 回滚
      set({ myDayTasks: previousState });
    }
  },

  checkAndReset: async () => {
    const { lastVisitDate } = get();
    const today = getTodayString();

    // 如果上次访问不是今天，执行跨天重置
    if (lastVisitDate && lastVisitDate !== today) {
      try {
        await myDayService.resetMyDay();
      } catch (error) {
        console.error('Failed to reset my day:', error);
      }
    }
  },

  loadSuggestions: async () => {
    try {
      const suggestions = await myDayService.getSmartSuggestions();
      set({ suggestions });
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  },
}));
