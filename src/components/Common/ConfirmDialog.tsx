import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

interface ConfirmDialogProps {
  /** 是否打开 */
  open: boolean;
  /** 标题 */
  title: string;
  /** 内容消息 */
  message: string;
  /** 确认回调 */
  onConfirm: () => void;
  /** 取消回调 */
  onCancel: () => void;
  /** 确认按钮颜色，默认 primary */
  confirmColor?: 'primary' | 'error' | 'warning' | 'info' | 'success';
}

/**
 * 通用确认弹窗。
 * MUI Dialog，包含标题、内容、取消/确认按钮。
 */
function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmColor = 'primary',
}: ConfirmDialogProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle sx={{ fontWeight: 600 }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} color="inherit">
          {t('common.cancel')}
        </Button>
        <Button onClick={onConfirm} color={confirmColor} variant="contained">
          {t('common.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDialog;
