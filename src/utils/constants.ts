import { RepeatFrequency, Priority } from '@/types';

// ==================== 默认清单 ====================

/** 默认清单（收件箱）ID */
export const DEFAULT_LIST_ID = 'default-inbox';

/** 默认清单名称 */
export const DEFAULT_LIST_NAME = '任务';

/** 默认清单颜色 */
export const DEFAULT_LIST_COLOR = '#0078D4';

// ==================== 清单颜色列表 ====================

/** 可选的清单颜色列表 */
export const LIST_COLORS: string[] = [
  '#0078D4', // 蓝色（默认）
  '#7B68EE', // 中紫色
  '#E74856', // 红色
  '#FF8C00', // 深橙色
  '#FFB900', // 金色
  '#00CC6A', // 绿色
  '#00B7C3', // 青色
  '#8764B8', // 紫色
  '#E3008C', // 品红色
  '#AC7745', // 棕色
  '#6B69D6', // 靛蓝色
  '#107C10', // 深绿色
];

// ==================== 任务优先级 ====================

/** 优先级配置（UI 展示用） */
export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bgColor: string }> = {
  [Priority.NONE]: { label: '无优先级', color: '#9E9E9E', bgColor: '#F5F5F5' },
  [Priority.P0]: { label: 'P0 紧急', color: '#FFFFFF', bgColor: '#D32F2F' },
  [Priority.P1]: { label: 'P1 高', color: '#FFFFFF', bgColor: '#F57C00' },
  [Priority.P2]: { label: 'P2 中', color: '#FFFFFF', bgColor: '#1976D2' },
  [Priority.P3]: { label: 'P3 低', color: '#FFFFFF', bgColor: '#388E3C' },
};

/** 优先级选项（不含 NONE，用于详情页选择器） */
export const PRIORITY_OPTIONS: Priority[] = [Priority.NONE, Priority.P0, Priority.P1, Priority.P2, Priority.P3];

// ==================== 重复规则 ====================

/** 重复频率选项（用于 UI 展示） */
export const REPEAT_FREQUENCY_OPTIONS: { value: RepeatFrequency; label: string }[] = [
  { value: RepeatFrequency.DAILY, label: '每天' },
  { value: RepeatFrequency.WEEKLY, label: '每周' },
  { value: RepeatFrequency.MONTHLY, label: '每月' },
  { value: RepeatFrequency.YEARLY, label: '每年' },
];

/** 星期几的中文名称（0=周日） */
export const WEEKDAY_NAMES: string[] = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

// ==================== 限制常量 ====================

/** 任务标题最大长度 */
export const MAX_TASK_TITLE_LENGTH = 500;

/** 任务备注最大长度 */
export const MAX_TASK_NOTE_LENGTH = 10000;

/** 清单名称最大长度 */
export const MAX_LIST_NAME_LENGTH = 100;

/** 子任务标题最大长度 */
export const MAX_SUBTASK_TITLE_LENGTH = 200;

/** 子任务最大数量 */
export const MAX_SUBTASK_COUNT = 100;

// ==================== 侧边栏导航项 ====================

/** 侧边栏视图 ID 类型 */
export type SidebarViewId = 'myday' | 'important' | 'planned' | 'inbox' | 'search' | 'all';

/** 侧边栏固定导航项 */
export const SIDEBAR_NAV_ITEMS: { id: SidebarViewId; label: string; icon: string }[] = [
  { id: 'myday', label: '我的一天', icon: 'WbSunny' },
  { id: 'important', label: '重要', icon: 'StarBorder' },
  { id: 'planned', label: '计划内', icon: 'CalendarMonth' },
  { id: 'all', label: '全部', icon: 'ListAlt' },
  { id: 'inbox', label: '任务', icon: 'Inbox' },
];

// ==================== 存储键名 ====================

/** localStorage 键名前缀 */
export const STORAGE_KEY_PREFIX = 'todo-app:';

/** 上次访问"我的一天"的日期键 */
export const STORAGE_KEY_LAST_MY_DAY_VISIT = `${STORAGE_KEY_PREFIX}last-my-day-visit`;

/** 侧边栏展开状态键 */
export const STORAGE_KEY_SIDEBAR_OPEN = `${STORAGE_KEY_PREFIX}sidebar-open`;

/** 最后一次 PWA 更新提示键 */
export const STORAGE_KEY_LAST_UPDATE_PROMPT = `${STORAGE_KEY_PREFIX}last-update-prompt`;
