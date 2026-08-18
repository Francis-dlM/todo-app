import React, { useState } from 'react';
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { List as ListIcon } from '@mui/icons-material';
import type { TaskList } from '@/types';
import ListContextMenu from './ListContextMenu';

interface ListItemProps {
  /** 清单数据 */
  list: TaskList;
  /** 是否选中 */
  isActive: boolean;
  /** 点击回调 */
  onClick: () => void;
}

/**
 * 侧边栏清单项组件。
 * 展示清单图标、名称、未完成任务数。
 * 右键弹出上下文菜单。
 */
function ListItem({ list, isActive, onClick }: ListItemProps): React.ReactElement {
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);

  /** 处理右键菜单 */
  const handleContextMenu = (event: React.MouseEvent): void => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? { mouseX: event.clientX - 2, mouseY: event.clientY - 2 }
        : null,
    );
  };

  /** 关闭右键菜单 */
  const handleCloseContextMenu = (): void => {
    setContextMenu(null);
  };

  return (
    <>
      <ListItemButton
        onClick={onClick}
        onContextMenu={handleContextMenu}
        selected={isActive}
        sx={{
          borderRadius: 2,
          mb: 0.5,
          '&.Mui-selected': {
            bgcolor: 'primary.light',
            borderLeft: 3,
            borderColor: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.light',
            },
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 40 }}>
          <ListIcon sx={{ color: list.color }} />
        </ListItemIcon>
        <ListItemText
          primary={list.name}
          primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
        />
      </ListItemButton>

      <ListContextMenu
        list={list}
        contextMenu={contextMenu}
        onClose={handleCloseContextMenu}
      />
    </>
  );
}

export default ListItem;
