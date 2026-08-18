import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Checkbox,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import type { Task, Subtask } from '@/types';
import { generateId } from '@/utils/id';
import { MAX_SUBTASK_TITLE_LENGTH, MAX_SUBTASK_COUNT } from '@/utils/constants';

interface SubtaskListProps {
  /** 当前任务 */
  task: Task;
  /** 自动保存函数 */
  autoSave: (data: Partial<Task>) => void;
}

/**
 * 子任务列表 + 输入。
 * 每个子任务有复选框 + 标题 + 删除按钮。
 * 底部添加子任务输入框。
 */
function SubtaskList({ task, autoSave }: SubtaskListProps): React.ReactElement {
  const { t } = useTranslation();
  const [newTitle, setNewTitle] = useState('');

  /** 切换子任务完成状态 */
  const handleToggleSubtask = (subtaskId: string): void => {
    const updatedSubtasks = task.subtasks.map((s) =>
      s.id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s,
    );
    autoSave({ subtasks: updatedSubtasks });
  };

  /** 删除子任务 */
  const handleDeleteSubtask = (subtaskId: string): void => {
    const updatedSubtasks = task.subtasks.filter((s) => s.id !== subtaskId);
    autoSave({ subtasks: updatedSubtasks });
  };

  /** 添加子任务 */
  const handleAddSubtask = (): void => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    if (task.subtasks.length >= MAX_SUBTASK_COUNT) return;

    const newSubtask: Subtask = {
      id: generateId(),
      title: trimmed,
      isCompleted: false,
      order: task.subtasks.length,
    };

    autoSave({ subtasks: [...task.subtasks, newSubtask] });
    setNewTitle('');
  };

  /** 处理键盘事件 */
  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter') {
      handleAddSubtask();
    } else if (event.key === 'Escape') {
      setNewTitle('');
    }
  };

  /** 完成的子任务数 */
  const completedCount = task.subtasks.filter((s) => s.isCompleted).length;

  return (
    <Box>
      {/* 子任务标题 */}
      <Box className="flex items-center gap-2 mb-2">
        <Typography variant="subtitle2" color="text.secondary">
          {t('task.subtask')} ({completedCount}/{task.subtasks.length})
        </Typography>
      </Box>

      {/* 子任务列表 */}
      {task.subtasks
        .sort((a, b) => a.order - b.order)
        .map((subtask) => (
          <Box
            key={subtask.id}
            className="flex items-center gap-1"
            sx={{ py: 0.5 }}
          >
            <Checkbox
              checked={subtask.isCompleted}
              onChange={() => handleToggleSubtask(subtask.id)}
              size="small"
              sx={{ p: 0.5 }}
            />
            <Typography
              variant="body2"
              sx={{
                flex: 1,
                textDecoration: subtask.isCompleted ? 'line-through' : 'none',
                color: subtask.isCompleted ? 'text.disabled' : 'text.primary',
                fontSize: 14,
              }}
            >
              {subtask.title}
            </Typography>
            <IconButton
              size="small"
              onClick={() => handleDeleteSubtask(subtask.id)}
              sx={{ p: 0.25 }}
            >
              <DeleteIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            </IconButton>
          </Box>
        ))}

      {/* 添加子任务输入框 */}
      {task.subtasks.length < MAX_SUBTASK_COUNT && (
        <Box className="flex items-center gap-1 mt-1">
          <IconButton size="small" onClick={handleAddSubtask} sx={{ p: 0.5 }}>
            <AddIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          </IconButton>
          <TextField
            value={newTitle}
            onChange={(e) => {
              if (e.target.value.length <= MAX_SUBTASK_TITLE_LENGTH) {
                setNewTitle(e.target.value);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={t('task.addSubtask')}
            variant="standard"
            fullWidth
            InputProps={{
              disableUnderline: true,
              sx: { fontSize: 14 },
            }}
          />
        </Box>
      )}
    </Box>
  );
}

export default SubtaskList;
