import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@mui/material';
import { AnimatePresence } from 'framer-motion';
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
import type { Task } from '@/types';
import TaskItem from './TaskItem';
import CompletedSection from './CompletedSection';
import { useTaskStore } from '@/stores/taskStore';
import { useResponsive } from '@/hooks/useResponsive';

interface TaskListProps {
  /** 任务列表 */
  tasks: Task[];
  /** 当前清单 ID（用于添加任务） */
  listId: string;
  /** 空状态图标 */
  emptyIcon?: React.ReactElement;
  /** 空状态标题 */
  emptyTitle?: string;
  /** 空状态描述 */
  emptyDescription?: string;
  /** 是否启用拖拽排序（默认 true） */
  sortable?: boolean;
}

/** 可排序的单个任务项，将拖拽手柄 props 注入 TaskItem */
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
    <Box ref={setNodeRef} style={style}>
      <TaskItem
        task={task}
        dragHandleProps={{ attributes, listeners }}
      />
    </Box>
  );
}

/**
 * 任务列表容器。
 * 未完成任务列表（支持拖拽排序）+ CompletedSection。
 * 按 isCompleted 分组，未完成按 order 排序。
 */
function TaskList({
  tasks,
  listId: _listId,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  sortable = true,
}: TaskListProps): React.ReactElement {
  const { t } = useTranslation();
  const { isMobile } = useResponsive();
  const reorderTasks = useTaskStore((state) => state.reorderTasks);

  const uncompletedTasks = tasks
    .filter((task) => !task.isCompleted)
    .sort((a, b) => a.order - b.order);

  const completedTasks = tasks
    .filter((task) => task.isCompleted)
    .sort((a, b) => {
      const timeA = a.completedAt?.getTime() ?? 0;
      const timeB = b.completedAt?.getTime() ?? 0;
      return timeB - timeA;
    });

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

  /** 处理拖拽结束 */
  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = uncompletedTasks.findIndex((t) => t.id === active.id);
    const newIndex = uncompletedTasks.findIndex((t) => t.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...uncompletedTasks];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    reorderTasks(reordered.map((t) => t.id));
  };

  // 如果没有任务
  if (tasks.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        {emptyIcon && <Box sx={{ mb: 2, color: 'text.disabled' }}>{emptyIcon}</Box>}
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500, mb: 1 }}>
          {emptyTitle ?? t('task.noTasks')}
        </Typography>
        {emptyDescription && (
          <Typography variant="body2" color="text.disabled">
            {emptyDescription}
          </Typography>
        )}
      </Box>
    );
  }

  const uncompletedTaskIds = uncompletedTasks.map((t) => t.id);

  return (
    <Box>
      {/* 未完成任务 */}
      {sortable && uncompletedTasks.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={uncompletedTaskIds} strategy={verticalListSortingStrategy}>
            <AnimatePresence>
              {uncompletedTasks.map((task) => (
                <SortableTaskItem key={task.id} task={task} />
              ))}
            </AnimatePresence>
          </SortableContext>
        </DndContext>
      ) : (
        <AnimatePresence>
          {uncompletedTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </AnimatePresence>
      )}

      {/* 已完成折叠区 */}
      {completedTasks.length > 0 && (
        <CompletedSection tasks={completedTasks} />
      )}
    </Box>
  );
}

export default TaskList;
