import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Switch,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';
import {
  WbSunny as MyDayIcon,
  StarBorder as StarIcon,
  CalendarMonth as CalendarIcon,
  Notifications as ReminderIcon,
  Repeat as RepeatIcon,
  Folder as FolderIcon,
  Flag as PriorityIcon,
} from '@mui/icons-material';
import type { Task, RepeatRule, RepeatFrequency } from '@/types';
import { Priority } from '@/types';
import { useListStore } from '@/stores/listStore';
import DatePicker from '@/components/Common/DatePicker';
import { REPEAT_FREQUENCY_OPTIONS, PRIORITY_CONFIG, PRIORITY_OPTIONS } from '@/utils/constants';

interface TaskDetailFieldsProps {
  /** 当前任务 */
  task: Task;
  /** 自动保存函数 */
  autoSave: (data: Partial<Task>) => void;
  /** 我的一天切换回调 */
  onMyDayToggle: () => void;
}

/**
 * 任务详情字段组。
 * 包含：我的一天、重要、截止日期、提醒、重复、所属清单。
 */
function TaskDetailFields({ task, autoSave, onMyDayToggle }: TaskDetailFieldsProps): React.ReactElement {
  const { t } = useTranslation();
  const lists = useListStore((state) => state.lists);

  /** 处理重要切换 */
  const handleImportantToggle = (): void => {
    autoSave({ isImportant: !task.isImportant });
  };

  /** 处理截止日期变更 */
  const handleDueDateChange = (date: Date | null): void => {
    autoSave({ dueDate: date });
  };

  /** 处理提醒变更 */
  const handleReminderChange = (date: Date | null): void => {
    autoSave({ reminder: date });
  };

  /** 处理重复变更 */
  const handleRepeatChange = (frequency: RepeatFrequency | 'none'): void => {
    if (frequency === 'none') {
      autoSave({ repeat: null });
    } else {
      const newRepeat: RepeatRule = {
        frequency,
        interval: 1,
        byDayOfWeek: [],
        byDayOfMonth: null,
        until: null,
      };
      autoSave({ repeat: newRepeat });
    }
  };

  /** 处理优先级变更 */
  const handlePriorityChange = (newPriority: Priority): void => {
    autoSave({ priority: newPriority });
  };

  /** 处理清单变更 */
  const handleListChange = (listId: string): void => {
    autoSave({ listId });
  };

  /** 获取当前重复频率 */
  const getCurrentRepeat = (): string => {
    if (!task.repeat) return 'none';
    return task.repeat.frequency;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {/* 加入我的一天 */}
      <Box
        className="flex items-center justify-between"
        sx={{ py: 1, cursor: 'pointer' }}
        onClick={onMyDayToggle}
      >
        <Box className="flex items-center gap-2">
          <MyDayIcon sx={{ fontSize: 20, color: task.isMyDay ? 'warning.main' : 'text.secondary' }} />
          <Typography variant="body2">
            {task.isMyDay ? t('task.removeFromMyDay') : t('task.addToMyDay')}
          </Typography>
        </Box>
        <Switch
          checked={task.isMyDay}
          onChange={onMyDayToggle}
          size="small"
          onClick={(e) => e.stopPropagation()}
        />
      </Box>

      {/* 标记为重要 */}
      <Box
        className="flex items-center justify-between"
        sx={{ py: 1, cursor: 'pointer' }}
        onClick={handleImportantToggle}
      >
        <Box className="flex items-center gap-2">
          <StarIcon sx={{ fontSize: 20, color: task.isImportant ? 'warning.main' : 'text.secondary' }} />
          <Typography variant="body2">
            {task.isImportant ? t('task.notImportant') : t('task.important')}
          </Typography>
        </Box>
        <Switch
          checked={task.isImportant}
          onChange={handleImportantToggle}
          size="small"
          onClick={(e) => e.stopPropagation()}
        />
      </Box>

      {/* 优先级 */}
      <Box className="flex items-center gap-2" sx={{ py: 1 }}>
        <PriorityIcon sx={{ fontSize: 20, color: task.priority && task.priority !== Priority.NONE ? PRIORITY_CONFIG[task.priority].bgColor : 'text.secondary' }} />
        <Select
          value={task.priority || Priority.NONE}
          onChange={(e) => handlePriorityChange(e.target.value as Priority)}
          size="small"
          sx={{ flex: 1, fontSize: 14 }}
        >
          {PRIORITY_OPTIONS.map((p) => (
            <MenuItem key={p} value={p} sx={{ fontSize: 14 }}>
              <Box className="flex items-center gap-1.5">
                {p !== Priority.NONE && (
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: PRIORITY_CONFIG[p].bgColor,
                    }}
                  />
                )}
                {t(p === Priority.NONE ? 'task.priorityNone' : `task.priority${p}`)}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* 截止日期 */}
      <Box className="flex items-center gap-2" sx={{ py: 1 }}>
        <CalendarIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
        <DatePicker
          value={task.dueDate}
          onChange={handleDueDateChange}
          label={t('task.setDueDate')}
        />
      </Box>

      {/* 提醒 */}
      <Box className="flex items-center gap-2" sx={{ py: 1 }}>
        <ReminderIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
        <DatePicker
          value={task.reminder}
          onChange={handleReminderChange}
          label={t('task.setReminder')}
          showTime
        />
      </Box>

      {/* 重复 */}
      <Box className="flex items-center gap-2" sx={{ py: 1 }}>
        <RepeatIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
        <Select
          value={getCurrentRepeat()}
          onChange={(e) => handleRepeatChange(e.target.value as RepeatFrequency | 'none')}
          size="small"
          sx={{ flex: 1, fontSize: 14 }}
        >
          <MenuItem value="none" sx={{ fontSize: 14 }}>
            {t('repeat.none')}
          </MenuItem>
          {REPEAT_FREQUENCY_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value} sx={{ fontSize: 14 }}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* 所属清单 */}
      <Box className="flex items-center gap-2" sx={{ py: 1 }}>
        <FolderIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
        <Select
          value={task.listId}
          onChange={(e) => handleListChange(e.target.value)}
          size="small"
          sx={{ flex: 1, fontSize: 14 }}
        >
          {lists.map((list) => (
            <MenuItem key={list.id} value={list.id} sx={{ fontSize: 14 }}>
              {list.name}
            </MenuItem>
          ))}
        </Select>
      </Box>
    </Box>
  );
}

export default TaskDetailFields;
