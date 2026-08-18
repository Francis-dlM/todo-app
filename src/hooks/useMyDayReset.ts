import { useEffect } from 'react';
import { useMyDayStore } from '@/stores/myDayStore';

/**
 * "我的一天"跨天重置检测 Hook。
 * 在组件挂载时检测是否跨天，如果是则自动重置。
 * 应在 MyDayPage 组件中使用。
 */
export function useMyDayReset(): void {
  const checkAndReset = useMyDayStore((state) => state.checkAndReset);

  useEffect(() => {
    checkAndReset();
  }, [checkAndReset]);
}
