import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, TextField, IconButton } from '@mui/material';
import {
  Add as AddIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTaskStore } from '@/stores/taskStore';
import { useUIStore } from '@/stores/uiStore';
import { MAX_TASK_TITLE_LENGTH } from '@/utils/constants';

interface TaskInputProps {
  /** 当前清单 ID */
  listId: string;
}

/**
 * 快速添加任务输入框。
 * 固定在列表底部，Enter 创建任务，Escape 清空。
 * 标题空时抖动提示。
 */
function TaskInput({ listId }: TaskInputProps): React.ReactElement {
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const addTask = useTaskStore((state) => state.addTask);
  const openDetail = useUIStore((state) => state.openDetail);

  /** 提交创建任务 */
  const handleSubmit = async (): Promise<void> => {
    const trimmed = value.trim();

    if (!trimmed) {
      // 抖动提示
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    if (trimmed.length > MAX_TASK_TITLE_LENGTH) {
      return;
    }

    await addTask({ title: trimmed, listId });

    // 获取新创建的任务并打开详情
    const tasks = useTaskStore.getState().tasks;
    const newTask = tasks[tasks.length - 1];
    if (newTask) {
      openDetail(newTask.id);
    }

    setValue('');
    setIsExpanded(false);
  };

  /** 处理键盘事件 */
  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter') {
      handleSubmit();
    } else if (event.key === 'Escape') {
      setValue('');
      setIsExpanded(false);
      inputRef.current?.blur();
    }
  };

  /** 抖动动画变体 */
  const shakeVariants = {
    shake: {
      x: [0, -8, 8, -6, 6, -4, 4, 0],
      transition: { duration: 0.4 },
    },
    stable: { x: 0 },
  };

  return (
    <motion.div
      animate={isShaking ? 'shake' : 'stable'}
      variants={shakeVariants}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          py: 1,
          px: 2,
          mt: 1,
          bgcolor: 'background.paper',
          borderRadius: 2,
          border: 1,
          borderColor: isExpanded ? 'primary.main' : 'divider',
          transition: 'border-color 0.2s ease',
        }}
      >
        <IconButton size="small" onClick={handleSubmit} sx={{ p: 0.5 }}>
          <AddIcon sx={{ color: 'primary.main', fontSize: 22 }} />
        </IconButton>

        <TextField
          inputRef={inputRef}
          value={value}
          onChange={(e) => {
            if (e.target.value.length <= MAX_TASK_TITLE_LENGTH) {
              setValue(e.target.value);
            }
          }}
          onFocus={() => setIsExpanded(true)}
          onBlur={() => {
            if (!value.trim()) {
              setIsExpanded(false);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={t('task.addPlaceholder')}
          variant="standard"
          fullWidth
          InputProps={{
            disableUnderline: true,
            sx: { fontSize: 16 },
          }}
        />
      </Box>
    </motion.div>
  );
}

export default TaskInput;
