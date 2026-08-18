import { create } from 'zustand';
import type { Task, CreateTaskInput } from '@/types';
import * as taskService from '@/services/taskService';

/**
 * 任务状态管理 Store。
 * 管理任务列表、当前选中清单、加载状态。
 * 采用乐观更新模式：先更新内存状态，再调用 service 持久化，失败则回滚。
 */

interface TaskState {
  /** 任务列表 */
  tasks: Task[];
  /** 当前选中清单 ID */
  currentListId: string;
  /** 是否正在加载 */
  isLoading: boolean;
}

interface TaskActions {
  /** 加载指定清单的任务 */
  loadTasks: (listId: string) => Promise<void>;
  /** 加载所有任务 */
  loadAllTasks: () => Promise<void>;
  /** 加载重要任务 */
  loadImportantTasks: () => Promise<void>;
  /** 加载计划内任务 */
  loadPlannedTasks: () => Promise<void>;
  /** 搜索任务 */
  searchTasks: (keyword: string) => Promise<void>;
  /** 添加任务 */
  addTask: (data: CreateTaskInput) => Promise<void>;
  /** 切换任务完成状态 */
  toggleComplete: (id: string) => Promise<void>;
  /** 切换任务重要标记 */
  toggleImportant: (id: string) => Promise<void>;
  /** 删除任务 */
  removeTask: (id: string) => Promise<void>;
  /** 更新任务详情 */
  updateTaskDetail: (id: string, data: Partial<Task>) => Promise<void>;
  /** 重新排序任务 */
  reorderTasks: (taskIds: string[]) => Promise<void>;
  /** 设置当前清单 ID */
  setCurrentListId: (listId: string) => void;
}

export type TaskStore = TaskState & TaskActions;

export const useTaskStore = create<TaskStore>((set, get) => ({
  // ==================== 初始状态 ====================
  tasks: [],
  currentListId: '',
  isLoading: false,

  // ==================== Actions ====================

  loadTasks: async (listId: string) => {
    set({ isLoading: true, currentListId: listId });
    try {
      const tasks = await taskService.getTasksByList(listId);
      set({ tasks, isLoading: false });
    } catch (error) {
      console.error('Failed to load tasks:', error);
      set({ isLoading: false });
    }
  },

  loadAllTasks: async () => {
    set({ isLoading: true });
    try {
      const tasks = await taskService.getAllTasks();
      set({ tasks, isLoading: false });
    } catch (error) {
      console.error('Failed to load all tasks:', error);
      set({ isLoading: false });
    }
  },

  loadImportantTasks: async () => {
    set({ isLoading: true });
    try {
      const tasks = await taskService.getImportantTasks();
      set({ tasks, isLoading: false });
    } catch (error) {
      console.error('Failed to load important tasks:', error);
      set({ isLoading: false });
    }
  },

  loadPlannedTasks: async () => {
    set({ isLoading: true });
    try {
      const tasks = await taskService.getPlannedTasks();
      set({ tasks, isLoading: false });
    } catch (error) {
      console.error('Failed to load planned tasks:', error);
      set({ isLoading: false });
    }
  },

  searchTasks: async (keyword: string) => {
    set({ isLoading: true });
    try {
      const tasks = await taskService.searchTasks(keyword);
      set({ tasks, isLoading: false });
    } catch (error) {
      console.error('Failed to search tasks:', error);
      set({ isLoading: false });
    }
  },

  addTask: async (data: CreateTaskInput) => {
    try {
      const newTask = await taskService.createTask(data);
      set((state) => ({ tasks: [...state.tasks, newTask] }));
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  },

  toggleComplete: async (id: string) => {
    const { tasks } = get();
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    // 乐观更新
    const previousState = tasks;
    const isNowCompleted = !task.isCompleted;
    set({
      tasks: tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              isCompleted: isNowCompleted,
              completedAt: isNowCompleted ? new Date() : null,
            }
          : t,
      ),
    });

    try {
      if (isNowCompleted) {
        await taskService.completeTask(id);
      } else {
        await taskService.uncompleteTask(id);
      }
    } catch (error) {
      console.error('Failed to toggle complete:', error);
      // 回滚
      set({ tasks: previousState });
    }
  },

  toggleImportant: async (id: string) => {
    const { tasks } = get();
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    // 乐观更新
    const previousState = tasks;
    const isNowImportant = !task.isImportant;
    set({
      tasks: tasks.map((t) =>
        t.id === id ? { ...t, isImportant: isNowImportant } : t,
      ),
    });

    try {
      await taskService.updateTask(id, { isImportant: isNowImportant });
    } catch (error) {
      console.error('Failed to toggle important:', error);
      // 回滚
      set({ tasks: previousState });
    }
  },

  removeTask: async (id: string) => {
    const { tasks } = get();

    // 乐观更新
    const previousState = tasks;
    set({ tasks: tasks.filter((t) => t.id !== id) });

    try {
      await taskService.deleteTask(id);
    } catch (error) {
      console.error('Failed to remove task:', error);
      // 回滚
      set({ tasks: previousState });
    }
  },

  updateTaskDetail: async (id: string, data: Partial<Task>) => {
    const { tasks } = get();

    // 乐观更新
    const previousState = tasks;
    set({
      tasks: tasks.map((t) => (t.id === id ? { ...t, ...data } : t)),
    });

    try {
      await taskService.updateTask(id, data);
    } catch (error) {
      console.error('Failed to update task detail:', error);
      // 回滚
      set({ tasks: previousState });
    }
  },

  reorderTasks: async (taskIds: string[]) => {
    const { tasks } = get();

    // 乐观更新：更新 taskIds 中任务的 order，保留其他任务
    const previousState = tasks;
    const updated = tasks.map((t) => {
      const newIndex = taskIds.indexOf(t.id);
      if (newIndex !== -1) {
        return { ...t, order: newIndex };
      }
      return t;
    });
    set({ tasks: updated });

    try {
      await taskService.reorderTasks(taskIds);
    } catch (error) {
      console.error('Failed to reorder tasks:', error);
      // 回滚
      set({ tasks: previousState });
    }
  },

  setCurrentListId: (listId: string) => {
    set({ currentListId: listId });
  },
}));
