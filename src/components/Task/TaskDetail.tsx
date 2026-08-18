import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  IconButton,
  Divider,
  Button,
  TextField,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useResponsive } from '@/hooks/useResponsive';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useTaskStore } from '@/stores/taskStore';
import { useUIStore } from '@/stores/uiStore';
import { useMyDayStore } from '@/stores/myDayStore';
import TaskDetailFields from './TaskDetailFields';
import SubtaskList from './SubtaskList';
import ConfirmDialog from '@/components/Common/ConfirmDialog';
import type { Task } from '@/types';

/**
 * 任务详情抽屉/全屏。
 * 桌面端右侧 Drawer（400px），移动端全屏 Dialog。
 * 所有字段通过 useAutoSave 实时保存。
 */
function TaskDetail(): React.ReactElement {
  const { t } = useTranslation();
  const { isMobile } = useResponsive();
  const isDetailOpen = useUIStore((state) => state.isDetailOpen);
  const detailTaskId = useUIStore((state) => state.detailTaskId);
  const closeDetail = useUIStore((state) => state.closeDetail);
  const tasks = useTaskStore((state) => state.tasks);
  const removeTask = useTaskStore((state) => state.removeTask);
  const addToMyDay = useMyDayStore((state) => state.addToMyDay);
  const removeFromMyDay = useMyDayStore((state) => state.removeFromMyDay);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const task = tasks.find((t) => t.id === detailTaskId) as Task | undefined;
  const autoSave = useAutoSave(detailTaskId);

  if (!task) {
    return <></>;
  }

  /** 处理标题编辑 */
  const handleTitleChange = (newTitle: string): void => {
    autoSave({ title: newTitle });
  };

  /** 处理备注编辑 */
  const handleNoteChange = (newNote: string): void => {
    autoSave({ note: newNote });
  };

  /** 处理删除确认 */
  const handleDeleteConfirm = async (): Promise<void> => {
    await removeTask(task.id);
    setShowDeleteConfirm(false);
    closeDetail();
  };

  /** 处理我的一天切换 */
  const handleMyDayToggle = (): void => {
    if (task.isMyDay) {
      removeFromMyDay(task.id);
    } else {
      addToMyDay(task.id);
    }
  };

  /** 详情内容 */
  const detailContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'background.paper',
      }}
    >
      {/* 顶部栏 */}
      <Box
        className="flex items-center justify-between"
        sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <IconButton onClick={closeDetail} size="small">
          <CloseIcon />
        </IconButton>
        <Button
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => setShowDeleteConfirm(true)}
          sx={{ textTransform: 'none' }}
        >
          {t('task.delete')}
        </Button>
      </Box>

      {/* 标题 */}
      <Box sx={{ px: 3, pt: 2 }}>
        <TextField
          value={task.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          variant="standard"
          fullWidth
          InputProps={{
            disableUnderline: true,
            sx: { fontSize: 20, fontWeight: 600 },
          }}
          placeholder={t('task.addPlaceholder')}
        />
      </Box>

      {/* 字段组 */}
      <Box sx={{ px: 3, py: 2 }}>
        <TaskDetailFields task={task} autoSave={autoSave} onMyDayToggle={handleMyDayToggle} />
      </Box>

      <Divider sx={{ mx: 3 }} />

      {/* 子任务 */}
      <Box sx={{ px: 3, py: 2, flex: 1, overflow: 'auto' }}>
        <SubtaskList task={task} autoSave={autoSave} />
      </Box>

      <Divider />

      {/* 备注 */}
      <Box sx={{ px: 3, py: 2 }}>
        <TextField
          value={task.note}
          onChange={(e) => handleNoteChange(e.target.value)}
          placeholder={t('task.addPlaceholder')}
          variant="standard"
          fullWidth
          multiline
          rows={3}
          InputProps={{
            disableUnderline: true,
            sx: { fontSize: 14 },
          }}
        />
      </Box>

      {/* 删除确认 */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title={t('task.deleteConfirmTitle')}
        message={t('task.deleteConfirm')}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        confirmColor="error"
      />
    </Box>
  );

  // 移动端：全屏
  if (isMobile) {
    if (!isDetailOpen) return <></>;
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1300,
          bgcolor: 'background.paper',
        }}
      >
        {detailContent}
      </Box>
    );
  }

  // 桌面端：Drawer
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        right: isDetailOpen ? 0 : -400,
        bottom: 0,
        width: 400,
        zIndex: 1200,
        borderLeft: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: isDetailOpen ? '-2px 0 8px rgba(0,0,0,0.1)' : 'none',
        transition: 'right 0.2s ease',
        overflow: 'hidden',
      }}
    >
      {detailContent}
    </Box>
  );
}

export default TaskDetail;
