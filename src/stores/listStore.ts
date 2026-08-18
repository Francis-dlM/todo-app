import { create } from 'zustand';
import type { TaskList, CreateListInput } from '@/types';
import * as listService from '@/services/listService';
import { DEFAULT_LIST_ID } from '@/utils/constants';
import { useTaskStore } from '@/stores/taskStore';

/**
 * 清单状态管理 Store。
 * 管理清单列表、当前活跃清单、加载状态。
 * 采用乐观更新模式：先更新内存状态，再调用 service 持久化，失败则回滚。
 */

interface ListState {
  /** 清单列表 */
  lists: TaskList[];
  /** 当前活跃清单 ID */
  activeListId: string;
  /** 是否正在加载 */
  isLoading: boolean;
}

interface ListActions {
  /** 加载所有清单 */
  loadLists: () => Promise<void>;
  /** 添加清单 */
  addList: (data: CreateListInput) => Promise<void>;
  /** 更新清单 */
  updateList: (id: string, data: Partial<TaskList>) => Promise<void>;
  /** 删除清单 */
  removeList: (id: string) => Promise<void>;
  /** 设置当前活跃清单 */
  setActiveList: (id: string) => void;
  /** 重新排序清单 */
  reorderLists: (listIds: string[]) => Promise<void>;
}

export type ListStore = ListState & ListActions;

export const useListStore = create<ListStore>((set, get) => ({
  // ==================== 初始状态 ====================
  lists: [],
  activeListId: DEFAULT_LIST_ID,
  isLoading: false,

  // ==================== Actions ====================

  loadLists: async () => {
    set({ isLoading: true });
    try {
      const lists = await listService.getAllLists();
      set({ lists, isLoading: false });
    } catch (error) {
      console.error('Failed to load lists:', error);
      set({ isLoading: false });
    }
  },

  addList: async (data: CreateListInput) => {
    try {
      const newList = await listService.createList(data);
      set((state) => ({ lists: [...state.lists, newList] }));
    } catch (error) {
      console.error('Failed to add list:', error);
    }
  },

  updateList: async (id: string, data: Partial<TaskList>) => {
    const { lists } = get();

    // 乐观更新
    const previousState = lists;
    set({
      lists: lists.map((l) => (l.id === id ? { ...l, ...data } : l)),
    });

    try {
      await listService.updateList(id, data);
    } catch (error) {
      console.error('Failed to update list:', error);
      // 回滚
      set({ lists: previousState });
    }
  },

  removeList: async (id: string) => {
    const { lists } = get();

    // 乐观更新：移除清单
    const previousState = lists;
    set({ lists: lists.filter((l) => l.id !== id) });

    // 同步更新内存中任务的 listId，将属于被删清单的任务移至默认清单
    const defaultListId = lists.find((l) => l.isDefault)?.id || DEFAULT_LIST_ID;
    const taskStore = useTaskStore.getState();
    const affectedTasks = taskStore.tasks.filter((t) => t.listId === id);
    if (affectedTasks.length > 0) {
      useTaskStore.setState({
        tasks: taskStore.tasks.map((t) =>
          t.listId === id ? { ...t, listId: defaultListId } : t,
        ),
      });
    }

    try {
      await listService.deleteList(id);
    } catch (error) {
      console.error('Failed to remove list:', error);
      // 回滚清单
      set({ lists: previousState });
      // 回滚任务
      if (affectedTasks.length > 0) {
        useTaskStore.setState({
          tasks: useTaskStore.getState().tasks.map((t) =>
            affectedTasks.some((at) => at.id === t.id) ? { ...t, listId: id } : t,
          ),
        });
      }
    }
  },

  setActiveList: (id: string) => {
    set({ activeListId: id });
  },

  reorderLists: async (listIds: string[]) => {
    const { lists } = get();

    // 乐观更新
    const previousState = lists;
    const reordered = listIds
      .map((id, index) => {
        const list = lists.find((l) => l.id === id);
        return list ? { ...list, order: index } : null;
      })
      .filter((l): l is TaskList => l !== null);
    set({ lists: reordered });

    try {
      await listService.reorderLists(listIds);
    } catch (error) {
      console.error('Failed to reorder lists:', error);
      // 回滚
      set({ lists: previousState });
    }
  },
}));
