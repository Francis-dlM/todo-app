import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@mui/material';
import { List as ListIcon } from '@mui/icons-material';
import { useTaskStore } from '@/stores/taskStore';
import { useListStore } from '@/stores/listStore';
import TaskList from '@/components/Task/TaskList';
import TaskInput from '@/components/Task/TaskInput';

interface ListDetailPageProps {
  /** 清单 ID */
  listId: string;
}

/**
 * 自定义清单详情页面。
 * 顶部显示清单名称和颜色，下方任务列表。
 */
function ListDetailPage({ listId }: ListDetailPageProps): React.ReactElement {
  const { t } = useTranslation();
  const tasks = useTaskStore((state) => state.tasks);
  const isLoading = useTaskStore((state) => state.isLoading);
  const loadTasks = useTaskStore((state) => state.loadTasks);
  const lists = useListStore((state) => state.lists);
  const setActiveList = useListStore((state) => state.setActiveList);

  const list = lists.find((l) => l.id === listId);

  useEffect(() => {
    if (listId) {
      loadTasks(listId);
      setActiveList(listId);
    }
  }, [listId, loadTasks, setActiveList]);

  if (isLoading) {
    return (
      <Box className="flex items-center justify-center h-full">
        <Typography color="text.secondary">{t('app.loading')}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* 清单头部 */}
      {list && (
        <Box sx={{ mb: 3 }}>
          <Box className="flex items-center gap-2 mb-1">
            <ListIcon sx={{ color: list.color, fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {list.name}
            </Typography>
          </Box>
        </Box>
      )}

      <TaskList
        tasks={tasks}
        listId={listId}
        emptyIcon={<ListIcon sx={{ fontSize: 64 }} />}
        emptyTitle={t('task.noTasks')}
      />
      <TaskInput listId={listId} />
    </Box>
  );
}

export default ListDetailPage;
