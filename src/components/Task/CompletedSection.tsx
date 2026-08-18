import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, IconButton } from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { AnimatePresence } from 'framer-motion';
import type { Task } from '@/types';
import TaskItem from './TaskItem';

interface CompletedSectionProps {
  /** 已完成任务列表（按 completedAt 倒序） */
  tasks: Task[];
}

/**
 * 已完成任务折叠区。
 * 点击展开/折叠，显示"已完成 (N)"。
 * 已完成任务按 completedAt 倒序排列。
 */
function CompletedSection({ tasks }: CompletedSectionProps): React.ReactElement {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Box sx={{ mt: 2 }}>
      {/* 折叠按钮 */}
      <Box
        className="flex items-center gap-1 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        sx={{
          py: 1,
          px: 2,
          '&:hover': { bgcolor: 'action.hover' },
          borderRadius: 2,
        }}
      >
        <IconButton size="small" sx={{ p: 0.25 }}>
          {isExpanded ? (
            <ExpandLessIcon sx={{ fontSize: 18 }} />
          ) : (
            <ExpandMoreIcon sx={{ fontSize: 18 }} />
          )}
        </IconButton>
        <Typography
          variant="body2"
          sx={{ fontWeight: 500, color: 'text.secondary' }}
        >
          {t('task.completed')} ({tasks.length})
        </Typography>
      </Box>

      {/* 已完成任务列表 */}
      <AnimatePresence>
        {isExpanded &&
          tasks.map((task) => <TaskItem key={task.id} task={task} />)}
      </AnimatePresence>
    </Box>
  );
}

export default CompletedSection;
