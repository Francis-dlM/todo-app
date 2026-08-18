import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Chip, IconButton } from '@mui/material';
import { CalendarMonth as CalendarMonthIcon, DragIndicator as DragIndicatorIcon } from '@mui/icons-material';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AnimatePresence } from 'framer-motion';
import { useTaskStore } from '@/stores/taskStore';
import TaskItem from '@/components/Task/TaskItem';
import TaskInput from '@/components/Task/TaskInput';
import EmptyState from '@/components/Common/EmptyState';
import { formatDate, isOverdue } from '@/utils/date';
import { DEFAULT_LIST_ID } from '@/utils/constants';
import { useResponsive } from '@/hooks/useResponsive';
import type { Task } from '@/types';

/** 可排序的单个任务项，包含拖拽手柄 */
function SortableTaskItem({ task }: { task: Task }): React.ReactElement {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 'auto',
  };

  return (
    <Box ref={setNodeRef} style={style} className="flex items-center">
      <IconButton
        size="small"
        {...attributes}
        {...listeners}
        sx={{
          cursor: 'grab',
          p: 0.25,
          '&:active': { cursor: 'grabbing' },
        }}
      >
        <DragIndicatorIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
      </IconButton>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <TaskItem task={task} />
      </Box>
    </Box>
  );
}

/**
 * 计划内页面。
 * 按日期分组显示有 dueDate 的任务，逾期任务标红。
 * 同一日期组内支持拖拽排序，不同组之间不支持跨组排序。
 */
function PlannedPage(): React.ReactElement {
  const { t } = useTranslation();
  const { isMobile } = useResponsive();
  const tasks = useTaskStore((state) => state.tasks);
  const isLoading = useTaskStore((state) => state.isLoading);
  const loadPlannedTasks = useTaskStore((state) => state.loadPlannedTasks);
  const reorderTasks = useTaskStore((state) => state.reorderTasks);

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 200,
      tolerance: 6,
    },
  });

  const sensors = useSensors(isMobile ? touchSensor : pointerSensor);

  useEffect(() => {
    loadPlannedTasks();
  }, [loadPlannedTasks]);

  if (isLoading) {
    return (
      <Box className="flex items-center justify-center h-full">
        <Typography color="text.secondary">{t('app.loading')}</Typography>
      </Box>
    );
  }

  const plannedTasks = tasks.filter((task) => task.dueDate && !task.isCompleted);

  if (plannedTasks.length === 0) {
    return (
      <Box>
        <EmptyState
          icon={<CalendarMonthIcon sx={{ fontSize: 64 }} />}
          title={t('task.noTasks')}
        />
        <TaskInput listId={DEFAULT_LIST_ID} />
      </Box>
    );
  }

  // 按日期分组
  const groupedByDate = new Map<string, typeof plannedTasks>();
  for (const task of plannedTasks) {
    const dateKey = formatDate(task.dueDate!) || t('date.noDate');
    const group = groupedByDate.get(dateKey) ?? [];
    group.push(task);
    groupedByDate.set(dateKey, group);
  }

  /** 处理某一日期组内的拖拽结束 */
  const handleDragEnd = (dateTasks: Task[]) => (event: DragEndEvent): void => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = dateTasks.findIndex((t) => t.id === active.id);
    const newIndex = dateTasks.findIndex((t) => t.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...dateTasks];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    reorderTasks(reordered.map((t) => t.id));
  };

  return (
    <Box>
      {Array.from(groupedByDate.entries()).map(([dateKey, dateTasks]) => {
        const hasOverdue = dateTasks.some((task) => task.dueDate && isOverdue(task.dueDate));
        const taskIds = dateTasks.map((t) => t.id);

        return (
          <Box key={dateKey} sx={{ mb: 3 }}>
            <Box className="flex items-center gap-2 mb-2">
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600 }}
              >
                {dateKey}
              </Typography>
              {hasOverdue && (
                <Chip
                  label={t('date.overdue')}
                  color="error"
                  size="small"
                  sx={{ height: 22, fontSize: 12 }}
                />
              )}
            </Box>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd(dateTasks)}
            >
              <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                <AnimatePresence>
                  {dateTasks.map((task) => (
                    <SortableTaskItem key={task.id} task={task} />
                  ))}
                </AnimatePresence>
              </SortableContext>
            </DndContext>
          </Box>
        );
      })}
      <TaskInput listId={DEFAULT_LIST_ID} />
    </Box>
  );
}

export default PlannedPage;
