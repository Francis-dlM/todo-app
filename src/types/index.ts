/** 任务优先级 */
export enum Priority {
  /** 无优先级（默认） */
  NONE = 'NONE',
  /** P0 紧急 */
  P0 = 'P0',
  /** P1 高 */
  P1 = 'P1',
  /** P2 中 */
  P2 = 'P2',
  /** P3 低 */
  P3 = 'P3',
}

/** 重复频率枚举 */
export enum RepeatFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

/** 重复规则接口 */
export interface RepeatRule {
  /** 重复频率 */
  frequency: RepeatFrequency;
  /** 间隔（每 N 天/周/月/年重复一次） */
  interval: number;
  /** 按星期几重复（0=周日, 1=周一, ..., 6=周六），WEEKLY 时使用 */
  byDayOfWeek: number[];
  /** 按每月第几天重复，MONTHLY 时使用 */
  byDayOfMonth: number | null;
  /** 重复截止日期 */
  until: Date | null;
}

/** 子任务接口 */
export interface Subtask {
  /** 子任务 ID */
  id: string;
  /** 子任务标题 */
  title: string;
  /** 是否已完成 */
  isCompleted: boolean;
  /** 排序序号 */
  order: number;
}

/** 清单接口 */
export interface TaskList {
  /** 清单 ID */
  id: string;
  /** 清单名称 */
  name: string;
  /** 清单颜色（十六进制色值） */
  color: string;
  /** 清单图标名称 */
  icon: string;
  /** 排序序号 */
  order: number;
  /** 创建时间 */
  createdAt: Date;
  /** 是否为默认清单（收件箱） */
  isDefault: boolean;
}

/** 任务接口 */
export interface Task {
  /** 任务 ID */
  id: string;
  /** 任务标题 */
  title: string;
  /** 任务备注 */
  note: string;
  /** 所属清单 ID */
  listId: string;
  /** 是否已完成 */
  isCompleted: boolean;
  /** 是否重要（星标） */
  isImportant: boolean;
  /** 是否在我的一天中 */
  isMyDay: boolean;
  /** 加入"我的一天"的日期（YYYY-MM-DD 格式） */
  myDayDate: string | null;
  /** 截止日期 */
  dueDate: Date | null;
  /** 提醒时间 */
  reminder: Date | null;
  /** 重复规则 */
  repeat: RepeatRule | null;
  /** 子任务列表 */
  subtasks: Subtask[];
  /** 优先级 */
  priority: Priority;
  /** 排序序号 */
  order: number;
  /** 创建时间 */
  createdAt: Date;
  /** 完成时间 */
  completedAt: Date | null;
}

/** 创建任务输入类型 */
export interface CreateTaskInput {
  title: string;
  listId: string;
  isImportant?: boolean;
  isMyDay?: boolean;
  dueDate?: Date | null;
  reminder?: Date | null;
  note?: string;
  priority?: Priority;
}

/** 创建清单输入类型 */
export interface CreateListInput {
  name: string;
  color?: string;
  icon?: string;
}

/** 初始数据类型 */
export interface InitialData {
  lists: TaskList[];
  tasks: Task[];
}

/** 移动端 Tab 类型 */
export type MobileTab = 'myday' | 'important' | 'planned' | 'inbox' | 'search' | 'all';
