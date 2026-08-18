import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@mui/material';
import { StarBorder as StarBorderIcon } from '@mui/icons-material';
import { useTaskStore } from '@/stores/taskStore';
import TaskList from '@/components/Task/TaskList';
import TaskInput from '@/components/Task/TaskInput';
import { DEFAULT_LIST_ID } from '@/utils/constants';

/**
 * 重要任务页面。
 * 显示所有 isImportant 的任务。
 */
function ImportantPage(): React.ReactElement {
  const { t } = useTranslation();
  const tasks = useTaskStore((state) => state.tasks);
  const isLoading = useTaskStore((state) => state.isLoading);
  const loadImportantTasks = useTaskStore((state) => state.loadImportantTasks);

  useEffect(() => {
    loadImportantTasks();
  }, [loadImportantTasks]);

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
        emptyIcon={<StarBorderIcon sx={{ fontSize: 64 }} />}
        emptyTitle={t('task.noTasks')}
      />
      <TaskInput listId={DEFAULT_LIST_ID} />
    </Box>
  );
}

export default ImportantPage;
