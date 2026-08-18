import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@mui/material';
import { ListAlt as ListAltIcon } from '@mui/icons-material';
import { useTaskStore } from '@/stores/taskStore';
import TaskList from '@/components/Task/TaskList';
import TaskInput from '@/components/Task/TaskInput';
import { DEFAULT_LIST_ID } from '@/utils/constants';

/**
 * 全部任务页面。
 * 显示所有清单下的所有任务，支持拖拽排序。
 */
function AllTasksPage(): React.ReactElement {
  const { t } = useTranslation();
  const tasks = useTaskStore((state) => state.tasks);
  const isLoading = useTaskStore((state) => state.isLoading);
  const loadAllTasks = useTaskStore((state) => state.loadAllTasks);

  useEffect(() => {
    loadAllTasks();
  }, [loadAllTasks]);

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
        emptyIcon={<ListAltIcon sx={{ fontSize: 64 }} />}
        emptyTitle={t('task.noTasks')}
      />
      <TaskInput listId={DEFAULT_LIST_ID} />
    </Box>
  );
}

export default AllTasksPage;
