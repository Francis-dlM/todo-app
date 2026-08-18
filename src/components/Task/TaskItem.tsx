import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, IconButton, Typography, Chip } from '@mui/material';
import {
  CheckBoxOutlineBlank as CheckboxBlankIcon,
  CheckBox as CheckboxFilledIcon,
  StarBorder as StarBorderIcon,
  Star as StarIcon,
  DragIndicator as DragIndicatorIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import type { Task } from '@/types';
import { Priority } from '@/types';
import { useTaskStore } from '@/stores/taskStore';
import { useUIStore } from '@/stores/uiStore';
import { isOverdue, isDateToday, formatDate, dayjs } from '@/utils/date';

interface TaskItemProps {
  /** 任务数据 */
  task: Task;
  /** 拖拽手柄属性（由 SortableTaskItem 注入） */
  dragHandleProps?: {
    attributes?: React.HTMLAttributes<HTMLElement>;
    listeners?: Record<string, unknown>;
  };
}

/** 优先级竖条配置 */
const PRIORITY_BAR_CONFIG: Record<string, { color: string; label: string }> = {
  [Priority.P0]: { color: '#D32F2F', label: 'P0' },
  [Priority.P1]: { color: '#F57C00', label: 'P1' },
  [Priority.P2]: { color: '#1976D2', label: 'P2' },
  [Priority.P3]: { color: '#388E3C', label: 'P3' },
};

/**
 * 单个任务行组件。
 * Outlook 风格左侧优先级竖条 + 复选框 + 标题 + 截止日期 + 重要星标。
 * 使用 framer-motion 做勾选动画。
 */
function TaskItem({ task, dragHandleProps }: TaskItemProps): React.ReactElement {
  const { t } = useTranslation();
  const toggleComplete = useTaskStore((state) => state.toggleComplete);
  const toggleImportant = useTaskStore((state) => state.toggleImportant);
  const openDetail = useUIStore((state) => state.openDetail);

  const hasPriority = task.priority && task.priority !== Priority.NONE && !task.isCompleted;
  const barConfig = hasPriority ? PRIORITY_BAR_CONFIG[task.priority!] : null;

  /** 获取截止日期显示文本和颜色 */
  const getDueDateDisplay = (): { text: string; color: 'error' | 'primary' | 'default' } => {
    if (!task.dueDate) return { text: '', color: 'default' };

    if (isOverdue(task.dueDate)) {
      return { text: t('date.overdue'), color: 'error' };
    }
    if (isDateToday(task.dueDate)) {
      return { text: t('date.today'), color: 'primary' };
    }
    const tomorrow = dayjs().add(1, 'day');
    if (dayjs(task.dueDate).isSame(tomorrow, 'day')) {
      return { text: t('date.tomorrow'), color: 'default' };
    }
    return { text: formatDate(task.dueDate), color: 'default' };
  };

  const dueDateDisplay = getDueDateDisplay();

  /** 处理复选框点击 */
  const handleToggleComplete = (event: React.MouseEvent): void => {
    event.stopPropagation();
    toggleComplete(task.id);
  };

  /** 处理星标点击 */
  const handleToggleImportant = (event: React.MouseEvent): void => {
    event.stopPropagation();
    toggleImportant(task.id);
  };

  /** 处理行点击（打开详情） */
  const handleRowClick = (): void => {
    openDetail(task.id);
  };

  /** 根据优先级获取背景渐变色 */
  const getPriorityBg = (): string | undefined => {
    if (task.isCompleted) return undefined;
    switch (task.priority) {
      case Priority.P0:
        return 'linear-gradient(90deg, rgba(211,47,47,0.08) 0%, rgba(211,47,47,0.03) 40%, transparent 100%)';
      case Priority.P1:
        return 'linear-gradient(90deg, rgba(245,124,0,0.08) 0%, rgba(245,124,0,0.03) 40%, transparent 100%)';
      case Priority.P2:
        return 'linear-gradient(90deg, rgba(25,118,210,0.08) 0%, rgba(25,118,210,0.03) 40%, transparent 100%)';
      case Priority.P3:
        return 'linear-gradient(90deg, rgba(56,142,60,0.08) 0%, rgba(56,142,60,0.03) 40%, transparent 100%)';
      default:
        return undefined;
    }
  };

  const priorityBg = getPriorityBg();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Box
        onClick={handleRowClick}
        sx={{
          display: 'flex',
          alignItems: 'stretch',
          mb: 0.5,
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
          overflow: 'hidden',
          cursor: 'pointer',
          bgcolor: task.isCompleted ? 'action.hover' : (priorityBg ? undefined : 'background.paper'),
          background: priorityBg,
          '&:hover': {
            bgcolor: 'action.hover',
            background: priorityBg ? `linear-gradient(90deg, ${barConfig?.color}15 0%, ${barConfig?.color}08 40%, transparent 100%)` : undefined,
          },
          transition: 'background-color 0.15s ease',
        }}
      >
        {/* 左侧优先级竖条 — Outlook 风格 */}
        {barConfig && (
          <Box
            sx={{
              width: 20,
              flexShrink: 0,
              bgcolor: barConfig.color,
              opacity: 0.75,
              borderRadius: '1px 0 0 1px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0,
              transition: 'opacity 0.2s ease',
              '&:hover': { opacity: 0.9 },
            }}
          >
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 800,
                color: 'rgba(255,255,255,0.95)',
                lineHeight: 1.1,
                userSelect: 'none',
              }}
            >
              {barConfig.label[0]}
            </Typography>
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 800,
                color: 'rgba(255,255,255,0.95)',
                lineHeight: 1.1,
                userSelect: 'none',
              }}
            >
              {barConfig.label.slice(1)}
            </Typography>
          </Box>
        )}

        {/* 主内容区 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, py: 1.25, pl: 1, pr: 1.5, flex: 1, minWidth: 0 }}>
          {/* 拖拽手柄（仅在有 dragHandleProps 时渲染） */}
          {dragHandleProps && (
            <Box
              component="span"
              role="button"
              tabIndex={0}
              {...dragHandleProps.attributes}
              {...dragHandleProps.listeners}
              sx={{
                cursor: 'grab',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 0.25,
                opacity: 0.3,
                '&:hover': { opacity: 0.8 },
                '&:active': { cursor: 'grabbing' },
                flexShrink: 0,
                borderRadius: 1,
              }}
            >
              <DragIndicatorIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
            </Box>
          )}

          {/* 复选框 */}
          <IconButton
            size="small"
            onClick={handleToggleComplete}
            sx={{ p: 0.5, flexShrink: 0 }}
          >
            <motion.div
              whileTap={{ scale: 1.3 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              {task.isCompleted ? (
                <CheckboxFilledIcon sx={{ color: 'primary.main', fontSize: 22 }} />
              ) : (
                <CheckboxBlankIcon sx={{ color: 'text.disabled', fontSize: 22 }} />
              )}
            </motion.div>
          </IconButton>

          {/* 标题和日期 */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body1"
              sx={{
                textDecoration: task.isCompleted ? 'line-through' : 'none',
                color: task.isCompleted ? 'text.disabled' : 'text.primary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: 15,
              }}
            >
              {task.title}
            </Typography>
            {dueDateDisplay.text && !task.isCompleted && (
              <Chip
                label={dueDateDisplay.text}
                size="small"
                color={dueDateDisplay.color}
                variant="outlined"
                sx={{ height: 20, fontSize: 11, mt: 0.25 }}
              />
            )}
          </Box>

          {/* 重要星标 */}
          <IconButton
            size="small"
            onClick={handleToggleImportant}
            sx={{ p: 0.5, flexShrink: 0 }}
          >
            {task.isImportant ? (
              <StarIcon sx={{ color: 'warning.main', fontSize: 20 }} />
            ) : (
              <StarBorderIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
            )}
          </IconButton>
        </Box>
      </Box>
    </motion.div>
  );
}

export default TaskItem;
