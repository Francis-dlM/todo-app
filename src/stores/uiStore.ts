import { create } from 'zustand';
import type { MobileTab } from '@/types';
import {
  getStorageItem,
  setStorageItem,
} from '@/utils/storage';
import { STORAGE_KEY_SIDEBAR_OPEN } from '@/utils/constants';

/** 桌面端视图 ID 类型 */
export type DesktopViewId = 'myday' | 'important' | 'planned' | 'inbox' | 'search' | 'list' | 'all';

/**
 * UI 状态管理 Store。
 * 管理侧边栏开关、详情抽屉、移动端 Tab、桌面端视图等界面状态。
 * 纯 UI 状态，不涉及异步操作。
 */

interface UIState {
  /** 侧边栏是否展开 */
  sidebarOpen: boolean;
  /** 当前查看详情的任务 ID */
  detailTaskId: string;
  /** 详情抽屉/面板是否打开 */
  isDetailOpen: boolean;
  /** 移动端当前激活的 Tab */
  activeMobileTab: MobileTab;
  /** 桌面端当前激活的视图 */
  activeDesktopView: DesktopViewId;
}

interface UIActions {
  /** 切换侧边栏展开/折叠 */
  toggleSidebar: () => void;
  /** 打开任务详情 */
  openDetail: (taskId: string) => void;
  /** 关闭任务详情 */
  closeDetail: () => void;
  /** 设置移动端 Tab */
  setMobileTab: (tab: MobileTab) => void;
  /** 设置桌面端视图 */
  setDesktopView: (view: DesktopViewId) => void;
}

export type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>((set, get) => ({
  // ==================== 初始状态 ====================
  sidebarOpen: getStorageItem<boolean>(STORAGE_KEY_SIDEBAR_OPEN, true),
  detailTaskId: '',
  isDetailOpen: false,
  activeMobileTab: 'myday' as MobileTab,
  activeDesktopView: 'myday' as DesktopViewId,

  // ==================== Actions ====================

  toggleSidebar: () => {
    const newOpen = !get().sidebarOpen;
    set({ sidebarOpen: newOpen });
    setStorageItem(STORAGE_KEY_SIDEBAR_OPEN, newOpen);
  },

  openDetail: (taskId: string) => {
    set({ detailTaskId: taskId, isDetailOpen: true });
  },

  closeDetail: () => {
    set({ isDetailOpen: false, detailTaskId: '' });
  },

  setMobileTab: (tab: MobileTab) => {
    set({ activeMobileTab: tab });
  },

  setDesktopView: (view: DesktopViewId) => {
    set({ activeDesktopView: view });
  },
}));
