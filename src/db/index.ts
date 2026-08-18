import Dexie, { type Table } from 'dexie';
import type { Task, TaskList, InitialData } from '@/types';
import { DEFAULT_LIST_ID, DEFAULT_LIST_NAME, DEFAULT_LIST_COLOR } from '@/utils/constants';

/**
 * 应用数据库类，基于 Dexie 封装 IndexedDB。
 * 定义任务表和清单表的结构及索引。
 */
class AppDatabase extends Dexie {
  /** 任务表 */
  tasks!: Table<Task, string>;
  /** 清单表 */
  lists!: Table<TaskList, string>;

  constructor() {
    super('TodoAppDB');

    // 数据库版本 1：定义表结构和索引
    this.version(1).stores({
      tasks: 'id, listId, isCompleted, isMyDay, isImportant, dueDate, myDayDate, order',
      lists: 'id, isDefault, order',
    });
  }

  /**
   * 初始化数据库，确保默认清单存在。
   * 如果默认清单不存在则自动创建。
   */
  async init(): Promise<void> {
    const defaultList = await this.lists.get(DEFAULT_LIST_ID);
    if (!defaultList) {
      await this.lists.add({
        id: DEFAULT_LIST_ID,
        name: DEFAULT_LIST_NAME,
        color: DEFAULT_LIST_COLOR,
        icon: 'Inbox',
        order: 0,
        createdAt: new Date(),
        isDefault: true,
      });
    }
  }

  /**
   * 获取初始数据（所有清单和任务）。
   * @returns 包含清单和任务列表的初始数据对象
   */
  async getInitialData(): Promise<InitialData> {
    const [lists, tasks] = await Promise.all([
      this.lists.orderBy('order').toArray(),
      this.tasks.orderBy('order').toArray(),
    ]);
    return { lists, tasks };
  }
}

/** 数据库单例 */
export const db = new AppDatabase();

export default db;
