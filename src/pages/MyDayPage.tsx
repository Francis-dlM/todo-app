import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@mui/material';
import { WbSunny as WbSunnyIcon } from '@mui/icons-material';
import { useMyDayStore } from '@/stores/myDayStore';
import { useMyDayReset } from '@/hooks/useMyDayReset';
import MyDayHeader from '@/components/MyDay/MyDayHeader';
import SmartSuggestion from '@/components/MyDay/SmartSuggestion';
import TaskList from '@/components/Task/TaskList';
import TaskInput from '@/components/Task/TaskInput';
import EmptyState from '@/components/Common/EmptyState';
import { DEFAULT_LIST_ID } from '@/utils/constants';

/**
 * "我的一天"页面。
 * MyDayHeader + TaskList + SmartSuggestion（空时显示）。
 */
function MyDayPage(): React.ReactElement {
  const { t } = useTranslation();
  const myDayTasks = useMyDayStore((state) => state.myDayTasks);
  const isLoading = useMyDayStore((state) => state.isLoading);
  const loadMyDay = useMyDayStore((state) => state.loadMyDay);

  // 跨天重置检测
  useMyDayReset();

  useEffect(() => {
    loadMyDay();
  }, [loadMyDay]);

  if (isLoading) {
    return (
      <Box className="flex items-center justify-center h-full">
        <Typography color="text.secondary">{t('app.loading')}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <MyDayHeader />

      {myDayTasks.length > 0 ? (
        <TaskList
          tasks={myDayTasks}
          listId={DEFAULT_LIST_ID}
          emptyIcon={<WbSunnyIcon sx={{ fontSize: 64 }} />}
          emptyTitle={t('myDay.noTasks')}
          emptyDescription={t('myDay.noTasksDesc')}
        />
      ) : (
        <>
          <EmptyState
            icon={<WbSunnyIcon sx={{ fontSize: 64 }} />}
            title={t('myDay.noTasks')}
            description={t('myDay.noTasksDesc')}
          />
          <SmartSuggestion />
        </>
      )}

      <TaskInput listId={DEFAULT_LIST_ID} />
    </Box>
  );
}

export default MyDayPage;
