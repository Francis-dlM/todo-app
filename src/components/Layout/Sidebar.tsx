import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Badge,
} from '@mui/material';
import {
  WbSunny as WbSunnyIcon,
  StarBorder as StarBorderIcon,
  CalendarMonth as CalendarMonthIcon,
  Inbox as InboxIcon,
  ListAlt as ListAltIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useResponsive } from '@/hooks/useResponsive';
import { useUIStore } from '@/stores/uiStore';
import type { DesktopViewId } from '@/stores/uiStore';
import { useListStore } from '@/stores/listStore';
import { useTaskStore } from '@/stores/taskStore';
import { useMyDayStore } from '@/stores/myDayStore';
import ListItemComponent from '@/components/List/ListItem';
import ListForm from '@/components/List/ListForm';
import { SIDEBAR_NAV_ITEMS, DEFAULT_LIST_ID } from '@/utils/constants';
import type { SidebarViewId } from '@/utils/constants';
import type { MobileTab } from '@/types';

/**
 * 左侧边栏。
 * 包含应用 Logo、固定导航项、用户清单列表、新建清单按钮。
 * 移动端以 Drawer 形式展示，桌面端固定展示。
 */
function Sidebar(): React.ReactElement {
  const { t } = useTranslation();
  const { isMobile } = useResponsive();
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const setMobileTab = useUIStore((state) => state.setMobileTab);
  const activeDesktopView = useUIStore((state) => state.activeDesktopView);
  const setDesktopView = useUIStore((state) => state.setDesktopView);

  const lists = useListStore((state) => state.lists);
  const activeListId = useListStore((state) => state.activeListId);
  const setActiveList = useListStore((state) => state.setActiveList);
  const loadTasks = useTaskStore((state) => state.loadTasks);
  const loadAllTasks = useTaskStore((state) => state.loadAllTasks);
  const loadImportantTasks = useTaskStore((state) => state.loadImportantTasks);
  const loadPlannedTasks = useTaskStore((state) => state.loadPlannedTasks);
  const tasks = useTaskStore((state) => state.tasks);
  const myDayTasks = useMyDayStore((state) => state.myDayTasks);
  const loadMyDay = useMyDayStore((state) => state.loadMyDay);

  const [showListForm, setShowListForm] = useState(false);

  /** 获取导航项的未完成任务计数 */
  const getCount = (id: SidebarViewId): number => {
    switch (id) {
      case 'myday':
        return myDayTasks.filter((t) => !t.isCompleted).length;
      case 'important':
        return tasks.filter((t) => t.isImportant && !t.isCompleted).length;
      case 'planned':
        return tasks.filter((t) => t.dueDate && !t.isCompleted).length;
      case 'all':
        return 0;
      case 'inbox':
        return tasks.filter((t) => t.listId === DEFAULT_LIST_ID && !t.isCompleted).length;
      default:
        return 0;
    }
  };

  /** 获取导航项的图标 */
  const getIcon = (id: SidebarViewId): React.ReactElement => {
    switch (id) {
      case 'myday':
        return <WbSunnyIcon />;
      case 'important':
        return <StarBorderIcon />;
      case 'planned':
        return <CalendarMonthIcon />;
      case 'all':
        return <ListAltIcon />;
      case 'inbox':
        return <InboxIcon />;
      default:
        return <InboxIcon />;
    }
  };

  /** 处理导航项点击 */
  const handleNavClick = (id: SidebarViewId): void => {
    // 加载数据
    switch (id) {
      case 'myday':
        loadMyDay();
        break;
      case 'important':
        loadImportantTasks();
        break;
      case 'planned':
        loadPlannedTasks();
        break;
      case 'all':
        loadAllTasks();
        break;
      case 'inbox':
        loadTasks(DEFAULT_LIST_ID);
        setActiveList(DEFAULT_LIST_ID);
        break;
      case 'search':
        break;
    }

    // 更新视图状态
    if (isMobile) {
      setMobileTab(id as MobileTab);
      toggleSidebar();
    } else {
      setDesktopView(id as DesktopViewId);
      // 对于 inbox 也设置 activeListId
      if (id === 'inbox') {
        setActiveList(DEFAULT_LIST_ID);
      }
    }
  };

  /** 判断导航项是否选中 */
  const isNavActive = (id: SidebarViewId): boolean => {
    if (isMobile) return false;
    if (id === 'inbox') {
      return activeDesktopView === 'inbox';
    }
    return activeDesktopView === id;
  };

  /** 处理清单项点击 */
  const handleListClick = (listId: string): void => {
    setActiveList(listId);
    loadTasks(listId);

    if (isMobile) {
      toggleSidebar();
    } else {
      setDesktopView('list');
    }
  };

  /** 侧边栏内容 */
  const sidebarContent = (
    <Box
      sx={{
        width: 280,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      {/* Logo 区域 */}
      <Box className="flex items-center gap-2 px-4 py-3">
        <WbSunnyIcon sx={{ color: 'primary.main', fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
          {t('app.name')}
        </Typography>
      </Box>

      {/* 固定导航项 */}
      <List sx={{ px: 1 }}>
        {SIDEBAR_NAV_ITEMS.map((item) => {
          const count = getCount(item.id);
          return (
            <ListItemButton
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              selected={isNavActive(item.id)}
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
                {getIcon(item.id)}
              </ListItemIcon>
              <ListItemText
                primary={t(`nav.${item.id === 'myday' ? 'myDay' : item.id}`)}
                primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
              />
              {count > 0 && (
                <Badge
                  badgeContent={count}
                  color="primary"
                  sx={{ mr: 1 }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ mx: 2 }} />

      {/* 用户清单列表 */}
      <Box className="flex-1 overflow-y-auto" sx={{ px: 1, py: 1 }}>
        {lists
          .filter((l) => !l.isDefault)
          .map((list) => (
            <ListItemComponent
              key={list.id}
              list={list}
              isActive={activeDesktopView === 'list' && activeListId === list.id}
              onClick={() => handleListClick(list.id)}
            />
          ))}

        {/* 新建清单 */}
        {showListForm ? (
          <ListForm onClose={() => setShowListForm(false)} />
        ) : (
          <ListItemButton
            onClick={() => setShowListForm(true)}
            sx={{ borderRadius: 2, mt: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <AddIcon sx={{ color: 'text.secondary' }} />
            </ListItemIcon>
            <ListItemText
              primary={t('list.add')}
              primaryTypographyProps={{ fontSize: 14, color: 'text.secondary' }}
            />
          </ListItemButton>
        )}
      </Box>
    </Box>
  );

  // 移动端：Drawer 形式
  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={toggleSidebar}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  // 桌面端：固定展示
  return sidebarContent;
}

export default Sidebar;
