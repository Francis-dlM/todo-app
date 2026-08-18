import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';
import {
  Edit as EditIcon,
  Palette as PaletteIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import type { TaskList } from '@/types';
import { useListStore } from '@/stores/listStore';
import { LIST_COLORS, MAX_LIST_NAME_LENGTH } from '@/utils/constants';
import ConfirmDialog from '@/components/Common/ConfirmDialog';

interface ListContextMenuProps {
  /** 清单数据 */
  list: TaskList;
  /** 右键菜单位置，null 表示关闭 */
  contextMenu: { mouseX: number; mouseY: number } | null;
  /** 关闭菜单回调 */
  onClose: () => void;
}

/**
 * 清单右键菜单。
 * 提供重命名、更改颜色、删除操作。
 * 删除需要二次确认，任务移至默认清单。
 */
function ListContextMenu({ list, contextMenu, onClose }: ListContextMenuProps): React.ReactElement {
  const { t } = useTranslation();
  const removeList = useListStore((state) => state.removeList);
  const updateList = useListStore((state) => state.updateList);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showColorDialog, setShowColorDialog] = useState(false);
  const [renameValue, setRenameValue] = useState(list.name);

  /** 处理重命名确认 */
  const handleRenameConfirm = async (): Promise<void> => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== list.name) {
      await updateList(list.id, { name: trimmed });
    }
    setShowRenameDialog(false);
  };

  /** 处理颜色选择 */
  const handleColorSelect = async (color: string): Promise<void> => {
    if (color !== list.color) {
      await updateList(list.id, { color });
    }
    setShowColorDialog(false);
  };

  /** 处理删除确认 */
  const handleDeleteConfirm = async (): Promise<void> => {
    await removeList(list.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  /** 打开重命名对话框时同步最新名称 */
  const openRenameDialog = (): void => {
    setRenameValue(list.name);
    setShowRenameDialog(true);
  };

  /** 处理菜单项点击 */
  const handleMenuAction = (action: string): () => void => {
    return () => {
      switch (action) {
        case 'rename':
          onClose();
          openRenameDialog();
          break;
        case 'color':
          onClose();
          setShowColorDialog(true);
          break;
        case 'delete':
          setShowDeleteConfirm(true);
          onClose();
          break;
        default:
          onClose();
      }
    };
  };

  return (
    <>
      <Menu
        open={contextMenu !== null}
        onClose={onClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleMenuAction('rename')}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('list.edit')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuAction('color')}>
          <ListItemIcon>
            <PaletteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('list.selectColor')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuAction('delete')} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText>{t('list.delete')}</ListItemText>
        </MenuItem>
      </Menu>

      {/* 重命名对话框 */}
      <Dialog
        open={showRenameDialog}
        onClose={() => setShowRenameDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>{t('list.edit')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameConfirm();
            }}
            inputProps={{ maxLength: MAX_LIST_NAME_LENGTH }}
            placeholder={t('list.namePlaceholder')}
            size="small"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowRenameDialog(false)} color="inherit">
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleRenameConfirm}
            variant="contained"
            disabled={!renameValue.trim() || renameValue.trim() === list.name}
          >
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 颜色选择对话框 */}
      <Dialog
        open={showColorDialog}
        onClose={() => setShowColorDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>{t('list.selectColor')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, py: 1 }}>
            {LIST_COLORS.map((color) => (
              <Box
                key={color}
                onClick={() => handleColorSelect(color)}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: color,
                  cursor: 'pointer',
                  border: list.color === color ? '3px solid' : '2px solid transparent',
                  borderColor: list.color === color ? 'common.white' : 'transparent',
                  outline: list.color === color ? `2px solid ${color}` : 'none',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  '&:hover': {
                    transform: 'scale(1.15)',
                    boxShadow: 2,
                  },
                }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowColorDialog(false)} color="inherit">
            {t('common.close')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 删除确认弹窗 */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title={t('list.deleteConfirmTitle')}
        message={t('list.deleteConfirm', { name: list.name })}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        confirmColor="error"
      />
    </>
  );
}

export default ListContextMenu;
