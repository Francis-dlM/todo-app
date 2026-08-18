import { useEffect, useState } from 'react';
import { useListStore } from '@/stores/listStore';
import { useTaskStore } from '@/stores/taskStore';
import { DEFAULT_LIST_ID } from '@/utils/constants';

/**
 * 数据初始化 Hook。
 * 通过 API 预加载清单和默认清单任务。
 * 不再依赖 Dexie 初始化，因为数据现在存储在服务端 JSON 文件中。
 *
 * @returns isReady - 数据是否加载完成
 */
export function useDatabase(): { isReady: boolean } {
  const [isReady, setIsReady] = useState(false);
  const loadLists = useListStore((state) => state.loadLists);
  const loadTasks = useTaskStore((state) => state.loadTasks);
  const setActiveList = useListStore((state) => state.setActiveList);

  useEffect(() => {
    let cancelled = false;

    async function initData(): Promise<void> {
      try {
        // 预加载数据（通过 API，数据来自 data/todo-data.json）
        await Promise.all([
          loadLists(),
          loadTasks(DEFAULT_LIST_ID),
        ]);

        if (cancelled) return;

        setActiveList(DEFAULT_LIST_ID);
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize data:', error);
        setIsReady(true);
      }
    }

    initData();

    return () => {
      cancelled = true;
    };
  }, [loadLists, loadTasks, setActiveList]);

  return { isReady };
}
