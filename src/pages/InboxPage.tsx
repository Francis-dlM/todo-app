import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@mui/material';
import { Inbox as InboxIcon } from '@mui/icons-material';
import { useTaskStore } from '@/stores/taskStore';
import { useListStore } from '@/stores/listStore';
import TaskList from '@/components/Task/TaskList';
import TaskInput from '@/components/Task/TaskInput';
import { DEFAULT_LIST_ID } from '@/utils/constants';

/**
 * 收件箱页面。
 * 默认清单视图，显示默认清单的任务。
 */
function InboxPage(): React.ReactElement {
  const { t } = useTranslation();
  const tasks = useTaskStore((state) => state.tasks);
  const isLoading = useTaskStore((state) => state.isLoading);
  const loadTasks = useTaskStore((state) => state.loadTasks);
  const setActiveList = useListStore((state) => state.setActiveList);

  useEffect(() => {
    loadTasks(DEFAULT_LIST_ID);
    setActiveList(DEFAULT_LIST_ID);
  }, [loadTasks, setActiveList]);

  if (isLoading) {
    return (
      <Box className="flex items-center justify-center h-full">
        <Typography color="text.secondary">{t('app.loading')}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <TaskList
        tasks={tasks}
        listId={DEFAULT_LIST_ID}
        emptyIcon={<InboxIcon sx={{ fontSize: 64 }} />}
        emptyTitle={t('task.noTasks')}
      />
      <TaskInput listId={DEFAULT_LIST_ID} />
    </Box>
  );
}

export default InboxPage;
